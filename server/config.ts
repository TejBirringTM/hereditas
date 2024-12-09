const config = {
  port: parseInt(Deno.env.get("PORT") ?? "8080"),
  cors: {
    origin: Deno.env.get("CORS_ORIGIN") ?? "*",
  },
} as const;

export default config;
