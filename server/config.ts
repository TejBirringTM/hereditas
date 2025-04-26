const config = {
  host: Deno.env.get("HOST") ?? "127.0.0.1",
  port: parseInt(Deno.env.get("PORT") ?? "8080"),
  cors: {
    origin: Deno.env.get("CORS_ORIGIN") ?? "*",
  },
  cache: {
    ttlInMilliseconds: parseInt(Deno.env.get("CACHE_TTL_MS") ?? "3_600_000"), // default: 1 hour in milliseconds
  },
  external: {
    anthrophic: {
      apiKey: Deno.env.get("ANTHROPIC_API_KEY") ?? null,
    },
    openai: {
      apiKey: Deno.env.get("OPENAI_API_KEY") ?? null,
    },
    airtable: {
      apiKey: Deno.env.get("AIRTABLE_PERSONAL_ACCESS_TOKEN") ?? null,
    },
  },
  debugMode: !!Deno.env.get("DEBUG"),
} as const;

export default config;
