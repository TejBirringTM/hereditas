import { declareRuntimeError } from "./runtime-error.ts";

export const RetrievalFailedError = declareRuntimeError(
  "Database:RetrievalFailed",
);
