export default function debugOnly<Output>(fn: ()=>Output) {
    const value = Deno.env.get("DEBUG");
    if (value && !["false", "no", "0"].includes(value.toLowerCase())) {
        fn();
    }
}