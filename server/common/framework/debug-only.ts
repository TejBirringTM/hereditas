import config from "../../config.ts";

export function isDebugMode() {
  // const value = Deno.env.get("DEBUG");
  // return (value && !["false", "no", "0"].includes(value.toLowerCase()));
  return config.debugMode;
}

export default function debugOnly<Output>(fn: () => Output) {
  if (isDebugMode()) {
    fn();
  }
}
