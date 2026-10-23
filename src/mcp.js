
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";

const API_BASE_URL =
  process.env.REST_API_BASE_URL ||
  "https://jsonplaceholder.typicode.com";

async function apiRequest(path, options = {}) {
  const url = new URL(path, API_BASE_URL);

  // Only allow requests to the configured API origin.
  if (url.origin !== new URL(API_BASE_URL).origin) {
    throw new Error("Invalid API destination");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`REST API returned HTTP ${response.status}`);
  }

  return response.json();
}

function success(data) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

function failure(error) {
  console.error("REST API tool failed:", error.message);

  return {
    isError: true,
    content: [
      {
        type: "text",
        text: "The REST API request failed. Check the API availability and server logs.",
      },
    ],
  };
}

export function createMcpServer() {
  const server = new McpServer({
    name: "rest-api-mcp-server",
    version: "1.0.0",
  });

  // Tool 1: Retrieve a limited number of posts.
  server.registerTool(
    "get_posts",
    {
      title: "Get Posts",
      description: "Retrieve recent posts from the REST API.",
      inputSchema: {
        limit: z.number().int().min(1).max(10).optional(),
      },
    },
    async ({ limit = 5 }) => {
      try {
        const posts = await apiRequest(
          `/posts?_limit=${limit}`
        );
        return success(posts);
      } catch (error) {
        return failure(error);
      }
    }
  );

  // Tool 2: Retrieve a post by its ID.
  server.registerTool(
    "get_post",
    {
      title: "Get Post",
      description: "Retrieve one post using its numeric ID.",
      inputSchema: {
        id: z.number().int().min(1).max(100),
      },
    },
    async ({ id }) => {
      try {
        const post = await apiRequest(`/posts/${id}`);
        return success(post);
      } catch (error) {
        return failure(error);
      }
    }
  );

  // Tool 3: Create a demo post.
  server.registerTool(
    "create_post",
    {
      title: "Create Post",
      description:
        "Submit a new demo post to the REST API. The demo API does not persist it.",
      inputSchema: {
        title: z.string().trim().min(1).max(200),
        body: z.string().trim().min(1).max(5000),
        userId: z.number().int().min(1).max(10),
      },
    },
    async ({ title, body, userId }) => {
      try {
        const post = await apiRequest("/posts", {
          method: "POST",
          body: JSON.stringify({ title, body, userId }),
        });

        return success(post);
      } catch (error) {
        return failure(error);
      }
    }
  );

  return server;
}
