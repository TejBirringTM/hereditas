export function dumpError(e: unknown) {
  if (e instanceof Error) {
    console.error("name:", e.name);
    console.error("message:", e.message);
    console.error("stack:", e.stack);
    if (e.cause) {
      console.error("cause:", e.cause);
    }
  }
}
