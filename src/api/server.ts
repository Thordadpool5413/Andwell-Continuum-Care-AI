import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { continuumReviewInputSchema } from "../domain/contracts.js";
import { runContinuumReview } from "../engine/continuumReview.js";
import {
  ANDWELL_REGISTRY_VERSION,
  ANDWELL_SERVICES,
} from "../registry/andwellServices.js";

const port = Number(process.env.PORT ?? 8787);

function sendJson(response: ServerResponse, status: number, payload: unknown): void {
  response.statusCode = status;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");
  response.end(JSON.stringify(payload));
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let total = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.byteLength;
    if (total > 1_000_000) throw new Error("Request body exceeds synthetic API limit");
    chunks.push(buffer);
  }

  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
}

const server = createServer(async (request, response) => {
  try {
    const method = request.method ?? "GET";
    const url = new URL(request.url ?? "/", "http://localhost");

    if (method === "GET" && url.pathname === "/health") {
      sendJson(response, 200, {
        ok: true,
        service: "andwell-continuum-care-ai",
        registryVersion: ANDWELL_REGISTRY_VERSION,
        dataMode: "synthetic-development",
      });
      return;
    }

    if (method === "GET" && url.pathname === "/v1/services") {
      sendJson(response, 200, {
        registryVersion: ANDWELL_REGISTRY_VERSION,
        services: ANDWELL_SERVICES.map((service) => ({
          id: service.id,
          name: service.name,
          family: service.family,
          summary: service.summary,
          reviewerRole: service.reviewerRole,
          sourceUrl: service.sourceUrl,
          eligibilityChecks: service.eligibilityChecks,
        })),
      });
      return;
    }

    if (method === "POST" && url.pathname === "/v1/reviews") {
      if (process.env.ALLOW_SYNTHETIC_API !== "true") {
        sendJson(response, 503, {
          error: {
            code: "SYNTHETIC_API_DISABLED",
            message: "Set ALLOW_SYNTHETIC_API=true for local synthetic development.",
          },
        });
        return;
      }

      const parsed = continuumReviewInputSchema.safeParse(await readJson(request));
      if (!parsed.success) {
        sendJson(response, 400, {
          error: {
            code: "INVALID_REVIEW_INPUT",
            message: "Review input is invalid.",
            details: parsed.error.flatten(),
          },
        });
        return;
      }

      sendJson(response, 200, { result: runContinuumReview(parsed.data) });
      return;
    }

    sendJson(response, 404, {
      error: { code: "NOT_FOUND", message: "Route not found." },
    });
  } catch (error) {
    sendJson(response, 500, {
      error: {
        code: "REQUEST_FAILED",
        message: error instanceof Error ? error.message : "Request failed.",
      },
    });
  }
});

server.listen(port, () => {
  console.log("Andwell Continuum Care AI synthetic API listening on :" + port);
});
