const config = {
  port: parseInt(Deno.env.get("PORT") ?? "8080"),
  cors: {
    origin: Deno.env.get("CORS_ORIGIN") ?? "*",
  },
  external: {
    anthrophic: {
      apiKey: Deno.env.get("ANTHROPIC_API_KEY") ?? null
    },
    openai: {
      apiKey: Deno.env.get("OPENAI_API_KEY") ?? null
    }
  },
  debugMode: !!Deno.env.get("DEBUG")
} as const;

export default config;
