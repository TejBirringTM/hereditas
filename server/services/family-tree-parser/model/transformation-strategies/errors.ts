import { declareRuntimeError } from "../../../../common/runtime-error.ts";

const FamilyTreeParserTransformationPipelineErrors = {
  MissingDeclaration: declareRuntimeError(
    "FamilyTreeParserTransformationPipeline:MissingDeclaration",
  ),
  ProcessingFailed: declareRuntimeError(
    "FamilyTreeParserTransformationPipeline:ProcessingFailed",
  ),
  // UnexpectedCase: declareRuntimeError("FamilyTreeParserTransformationPipeline:UnexpectedCase")
} as const;

export default FamilyTreeParserTransformationPipelineErrors;
