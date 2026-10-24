# REST API MCP Server

A Node.js-based Model Context Protocol (MCP) server that exposes REST API operations as tools for compatible AI clients.

## Features

- Retrieve multiple posts using `get_posts`
- Retrieve an individual post using `get_post`
- Submit a demo post using `create_post`
- API-key authentication using Bearer tokens
- Input validation with Zod
- Health-check endpoint
- Streamable HTTP transport
- Deployment on Render

## Tech Stack

- Node.js
- Express.js
- Model Context Protocol (MCP) SDK
- Zod
- REST API — JSONPlaceholder
- Render

## Live Demo

- **Homepage:** https://rest-api-mcp-server.onrender.com/
- **Health Check:** https://rest-api-mcp-server.onrender.com/health
- **MCP Endpoint:** https://rest-api-mcp-server.onrender.com/mcp

Note: The MCP endpoint is intended for compatible MCP clients. Opening it directly in a browser does not perform an MCP initialization request.

## Available Tools

| Tool | Description |
|---|---|
| `get_posts` | Retrieve posts, with an optional limit from 1 to 10 |
| `get_post` | Retrieve a post using its ID |
| `create_post` | Submit a demo post with a title, body, and user ID |

## Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd rest-api-mcp-server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```env
MCP_API_KEY=your_random_secret_of_at_least_32_characters
REST_API_BASE_URL=https://jsonplaceholder.typicode.com
PORT=3000
```

Use a strong, randomly generated secret for `MCP_API_KEY`. Never commit your real `.env` file.

### 4. Start the server

```bash
npm start
```

The server starts on the configured port.

## Testing

Use MCP Inspector with the Streamable HTTP transport.

For the deployed server, configure:

- URL: `https://rest-api-mcp-server.onrender.com/mcp`
- Header: `Authorization`
- Value: `Bearer YOUR_MCP_API_KEY`

Keep your API key private.

## Important Note

JSONPlaceholder is a demo API. Posts submitted through `create_post` are simulated and are not permanently saved.

## Future Improvements

- Add persistent database storage
- Add automated tests
- Add rate limiting and request logging
- Support more REST API operations
- Improve client integration and deployment documentation

## Author

Sanjay Nishad and https://github.com/Sanjay0070.