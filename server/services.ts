import { registerServices } from "./common/framework/main.ts";

export default registerServices([
  (await import("./services/family-tree-parser/service.ts")).default,
  (await import("./services/family-tree-scribe/service.ts")).default,
  (await import("./services/tokeniser/service.ts")).default,
  (await import("./services/app-content/service.ts")).default,
]);
