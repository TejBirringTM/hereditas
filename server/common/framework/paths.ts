import { declareNatural, declareString } from "../validation.ts";
import * as v from "@valibot/valibot";

const PathSegment = declareString(
  "Path Segment",
  "A lowercase alphanumeric string that may include hyphens and underscores, but neither as the first nor last character.",
  /([a-z0-9]+[a-z0-9\-\_]*[a-z0-9]+)/,
);
type TPathSegment = v.InferInput<typeof PathSegment.schema>;

const VersionMajor = declareNatural("Version Major");
export type TVersionMajor = v.InferInput<typeof VersionMajor.schema>;

type PathSegments = TPathSegment[];

export type TServicePath = TPathSegment;
export const servicePath = (path: TServicePath) => {
  const _path = PathSegment.assert(path);
  return `/services/${_path}`;
};

export type TRequestPath = PathSegments;
export const requestPath = (
  path: TRequestPath,
  versionMajor: TVersionMajor,
) => {
  const _versionMajor = VersionMajor.assert(versionMajor);
  const _path = path.map((pathSegment) => PathSegment.assert(pathSegment)).join(
    "/",
  );
  return `/${_path}/v${_versionMajor}`;
};
