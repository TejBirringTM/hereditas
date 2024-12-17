import { declareRuntimeError } from "./runtime-error.ts";

export const UnimplementedSyntaxError = declareRuntimeError(
    "ParseFamilyTree:UnimplementedSyntaxError",
);

export const InvalidReferenceError = declareRuntimeError(
    "ParseFamilyTree:InvalidReferenceError",
);

export const DuplicateDeclarationError = declareRuntimeError(
    "ParseFamilyTree:DuplicateDeclarationError",
);

export const MissingDeclarationError = declareRuntimeError(
    "ParseFamilyTree:MissingDeclarationError",
);

export const InvalidDeclarationError = declareRuntimeError(
    "ParseFamilyTree:InvalidDeclarationError",
);

export const ProcessingFailedError = declareRuntimeError(
    "ParseFamilyTree:ProcessingFailedError",
);
