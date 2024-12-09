export function isDebugMode() {
  const value = Deno.env.get("DEBUG");
  return (value && !["false", "no", "0"].includes(value.toLowerCase()));
}

export default function debugOnly<Output>(fn: () => Output) {
  if (isDebugMode()) {
    fn();
  }
}
