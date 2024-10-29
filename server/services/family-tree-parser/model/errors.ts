import { declareRuntimeError } from "../../../common/runtime-error.ts";

export const familyTreeParserErrors = {
    IncorrectSyntax: declareRuntimeError("FamilyTreeParserIncorrectSyntax"),
    UnimplementedSyntax: declareRuntimeError("FamilyTreeParserUnimplementedSyntax"),
    InvalidReference: declareRuntimeError("FamilyTreeParserInvalidReference")
} as const;

export default familyTreeParserErrors;