
import "dotenv/config";
import crypto from "node:crypto";
import { createMcpExpressApp } from
  "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from
  "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "./mcp.js";

const app = createMcpExpressApp({ host: "0.0.0.0" });
const PORT = Number(process.env.PORT || 3000);
const API_KEY = process.env.MCP_API_KEY;

if (!API_KEY || API_KEY.length < 32) {
  throw new Error(
    "Set MCP_API_KEY to a secret of at least 32 characters."
  );
}

// Constant-time comparison after checking equal lengths.
function validApiKey(received) {
  if (typeof received !== "string") return false;

  const expected = Buffer.from(API_KEY);
  const actual = Buffer.from(received);

  return (
    expected.length === actual.length &&
    crypto.timingSafeEqual(expected, actual)
  );
}

function authenticate(req, res, next) {
  const authorization = req.get("authorization") || "";
  const [scheme, token, ...extra] = authorization.split(" ");

  if (
    scheme !== "Bearer" ||
    !token ||
    extra.length > 0 ||
    !validApiKey(token)
  ) {
    res.set("WWW-Authenticate", "Bearer");
    return res.status(401).json({
      error: "Unauthorized. Provide a valid Bearer token.",
    });
  }

  next();
}

app.get("/", (_req, res) => {
  res.send("REST API MCP Server is running!");
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "rest-api-mcp-server",
  });
});

// Stateless Streamable HTTP: each request gets a fresh MCP server.
app.post("/mcp", authenticate, async (req, res) => {
  const server = createMcpServer();

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP request failed:", error.message);

    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal MCP server error",
      });
    }
  } finally {
    res.on("close", () => {
      void transport.close();
      void server.close();
    });
  }
});

// This starter does not implement GET-based SSE or session deletion.
app.get("/mcp", (_req, res) => {
  res.status(405).json({ error: "GET is not supported" });
});

app.delete("/mcp", (_req, res) => {
  res.status(405).json({ error: "DELETE is not supported" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`MCP server listening on port ${PORT}`);
});
