import { registerServices } from "./framework/main.ts";

export default registerServices([
    (await import("./services/family-tree-parser/service.ts")).default
]);
