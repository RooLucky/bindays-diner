<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Full-stack project conventions

### HTTP/API

- Use Next.js App Router Route Handlers for backend HTTP endpoints.
- Put API routes under `app/api/**/route.ts`.
- Read the relevant local Next.js docs in `node_modules/next/dist/docs/` before changing routing, server runtime, env handling, or caching behavior.
- API routes that touch Neon, Drizzle, Cloudflare R2, or secrets must run server-side only.
- Prefer `export const runtime = "nodejs"` for routes that use database or storage clients.
- Prefer `export const dynamic = "force-dynamic"` for health checks and request-time backend routes.
- Client components and hooks must call this app's API routes with `fetch`; they must not call Neon, Drizzle, or R2 directly.
- Put reusable client HTTP hooks under `hooks/`, such as `use-health-check.ts`.

### Environment variables

- Keep secrets in `.env*` files only. They are ignored by git.
- Do not prefix database or storage secrets with `NEXT_PUBLIC_`.
- Use `DATABASE_URL` for Neon:

```env
DATABASE_URL="postgresql://neondb_owner:************@ep-lingering-sound-a7knqwdh.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

- Use server-only env validation from `lib/env.ts`.
- Use `R2_ENDPOINT` for Cloudflare R2 when adding new code. `S3_ENDPOINT` may remain as a compatibility fallback.

### Drizzle and Neon

- Use Drizzle ORM with the Neon HTTP driver from `drizzle-orm/neon-http`.
- Keep the Drizzle schema in `lib/db/schema.ts`.
- Keep the Drizzle client in `lib/db/index.ts`.
- Access the database only through `getDb()`.
- Ensure there is only one shared Drizzle client instance per server process by keeping the module-level singleton pattern:

```ts
let db: ReturnType<typeof createDb> | undefined;

export function getDb() {
  db ??= createDb();
  return db;
}
```

- Do not create new Drizzle clients inside route handlers, hooks, React components, or utility functions.
- Use `drizzle.config.ts` for drizzle-kit commands.
- Use the package scripts for schema work:
  - `pnpm db:generate`
  - `pnpm db:migrate`
  - `pnpm db:studio`

### Cloudflare R2

- Use the AWS SDK v3 S3-compatible client for R2.
- Keep R2 client setup in `lib/r2/index.ts`.
- Access R2 only from server code, route handlers, or server utilities.

### Knowledge-based chatbot

- Keep chatbot provider calls server-only under `app/api/chatbot/**` and `lib/chatbot/**`.
- Use `OPENAI_API_KEY` with `OPENAI_CHATBOT_MODEL` as the primary provider.
- Use `OLLAMA_BASE_URL`, `OLLAMA_API_KEY`, and the `OLLAMA_CHATBOT_*` model variables only as sequential fallbacks.
- `OLLAMA_CHATBOT_MAX_ATTEMPTS` limits how many configured Ollama models may be tried for one question. It defaults to `4` and may be set up to `16`.
- Never send provider keys, provider errors, or model configuration to client components.
- Public chatbot answers must come from active rows in `chatbot_knowledge_entries`.
- Models may select approved knowledge IDs, but model-generated prose must not be returned as restaurant facts.
- Keep the public request limits in `lib/chatbot-contracts.ts` and durable rate-limit windows in `chatbot_rate_limits`.
- Set `CHATBOT_RATE_LIMIT_SALT` to a private random value in production when possible. It must never use a `NEXT_PUBLIC_` prefix.

### Realtime menu content

- Use Ably for live public menu and campaign content. Do not host Socket.IO or a custom WebSocket server in Vercel Functions.
- Keep `ABLY_API_KEY` server-only. Browser clients must receive short-lived, subscribe-only tokens from `app/api/realtime/token/route.ts`.
- Publish `menu-content.updated` only after successful admin management mutations. The public client only uses the event to call `router.refresh()` and must never access Neon directly.
- Scope realtime subscriptions to `/home`, `/menu`, and campaign pages. Do not mount them in the shared website layout or use them for cart, loyalty, reservations, or chatbot flows.
