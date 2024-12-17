import { declareTransformationPipeline } from "../../../../../common/transformation-pipeline.ts";

export default declareTransformationPipeline(
  "DefaultTransformationPipeline",
  (await import("./steps/1-develop-context.ts")).default,
  (await import(
    "./steps/2-traverse-tree-recursively-to-assign-generation-numbers.ts"
  )).default,
  (await import("./steps/3-normalise-generation-numbers.ts")).default,
  (await import("./steps/4-attach-direct-patrilineage.ts")).default,
  (await import("./steps/5-format-for-output.ts")).default,
);
