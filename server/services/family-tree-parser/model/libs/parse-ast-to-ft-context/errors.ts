import { declareRuntimeError } from "../../../../../common/runtime-error.ts";

const familyTreeAstParserErrors = {
  IncorrectSyntax: declareRuntimeError(
    "FamilyTreeAstToContextParser:IncorrectSyntax",
  ),
  UnimplementedSyntax: declareRuntimeError(
    "FamilyTreeAstToContextParser:UnimplementedSyntax",
  ),
  InvalidReference: declareRuntimeError(
    "FamilyTreeAstToContextParser:InvalidReference",
  ),
  DuplicateDeclaration: declareRuntimeError(
    "FamilyTreeAstToContextParser:DuplicateDeclaration",
  ),
  MissingDeclaration: declareRuntimeError(
    "FamilyTreeAstToContextParser:MissingDeclaration",
  ),
} as const;

export default familyTreeAstParserErrors;
