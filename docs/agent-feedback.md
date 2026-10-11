# Agent feedback with Agentation

[Agentation](https://agentation.dev) lets you click elements in the running
preview, leave notes, and hand structured context to a coding agent over MCP.

## Setup

The toolbar is mounted once at the app root and only renders in development
(`packages/webapp/src/lib/agentation.tsx`). It is React-only and relies on the
`react` → `preact/compat` alias, so keep the aliasing rules in `AGENTS.md`.

Register the MCP server with your agent:

```bash
claude mcp add agentation -- npx -y agentation-mcp server
```

or in any MCP client:

```json
{
   "mcpServers": {
      "agentation": {
         "command": "npx",
         "args": ["-y", "agentation-mcp", "server"]
      }
   }
}
```

## Workflow

1. Run `pnpm dev`, open <http://localhost:5173>.
2. Click the elements you want changed and add notes.
3. Ask the agent to read pending annotations before implementing.
4. Resolve annotations only after verifying the implemented change.

Agentation must never render in production builds.
