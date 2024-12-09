import { declareRuntimeError } from "../../../../common/runtime-error.ts";

const FamilyTreeParserTransformationPipelineErrors = {
  MissingDeclaration: declareRuntimeError(
    "FamilyTreeParserTransformationPipeline:MissingDeclaration",
  ),
  // ProcessingTimedOut: declareRuntimeError("FamilyTreeParserTransformationPipeline:ProcessingTimedOut"),
  ProcessingFailed: declareRuntimeError(
    "FamilyTreeParserTransformationPipeline:ProcessingFailed",
  ),
} as const;

export default FamilyTreeParserTransformationPipelineErrors;
