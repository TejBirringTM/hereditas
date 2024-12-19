import { declareRuntimeError } from "./runtime-error.ts";

export const LargeLanguageModelFailed = declareRuntimeError(
    "ScribeFamilyTree:LargeLanguageModelFailedError",
);
