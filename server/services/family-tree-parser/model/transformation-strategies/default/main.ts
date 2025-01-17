import { declareTransformationPipeline } from "../../../../../common/transformation-pipeline.ts";

export default declareTransformationPipeline(
  "DefaultTransformationPipeline",
  (await import("./steps/1-develop-context.ts")).default,
  (await import(
    "./steps/2-assign-generation-numbers.ts"
  )).default,
  (await import("./steps/3-normalise-generation-numbers.ts")).default,
  (await import("./steps/4-attach-direct-patrilineage.ts")).default,
  (await import("./steps/5-attach-tree.ts")).default,
  (await import("./steps/6-format-for-output.ts")).default,
);
