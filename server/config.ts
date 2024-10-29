const config = {
    port: parseInt(Deno.env.get("PORT") ?? "8080"),
} as const;

export default config;
