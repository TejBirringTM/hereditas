import {
  ErrorMessage,
  InferOutput,
  ObjectEntries,
  parse,
  StrictObjectIssue,
  StrictObjectSchema,
} from "@valibot/valibot";
import { HttpError, Router, Status } from "@oak/oak";
import { ValiError } from "@valibot/valibot";
import ApiRequestErrors from "./request-errors.ts";
import {
  type ApiErrorResult,
  type ApiSuccessResult,
  declareErrorResponse,
} from "./response.ts";
export { declareErrorResponse, declareSuccessResponse } from "./response.ts";
import {
  requestPath as _requestPath,
  servicePath as _servicePath,
  type TRequestPath,
  type TServicePath,
  type TVersionMajor,
} from "./paths.ts";
import debugOnly from "./debug-only.ts";

export function declareJsonApi(servicePath: TServicePath) {
  const __servicePath = _servicePath(servicePath);
  const router = new Router({
    sensitive: true,
    strict: true,
    prefix: __servicePath,
  });

  const declareRequest = <
    TRequestEntries extends ObjectEntries,
    TRequestParserErrorMessage extends
      | ErrorMessage<StrictObjectIssue>
      | undefined,
    TResponse extends object,
  >(
    requestPath: TRequestPath,
    versionMajor: TVersionMajor,
    requestSchema: StrictObjectSchema<
      TRequestEntries,
      TRequestParserErrorMessage
    >,
    requestHandler: (
      request: InferOutput<
        StrictObjectSchema<TRequestEntries, TRequestParserErrorMessage>
      >,
    ) => Promise<ApiSuccessResult<TResponse> | ApiErrorResult>
  ) => {
    const __requestPath = _requestPath(requestPath, versionMajor);

    debugOnly(() => {
      console.debug(
        `✅ Registered request (POST) ===> ${__servicePath}${__requestPath}`,
      );
    });

    return router.post(__requestPath, async (ctx) => {
      // try parse request body as a JSON object
      let requestBody;
      try {
        requestBody = await ctx.request.body.json();
      } catch (e) {
        if (e instanceof HttpError && e.status === Status.BadRequest) {
          ctx.response.body = ApiRequestErrors.requestBodyNotJsonError;
        }
        return;
      }
      // try parse request body using route- and method-specific schema
      let request: InferOutput<typeof requestSchema>;
      try {
        request = parse(requestSchema, requestBody);
      } catch (e) {
        if (e instanceof ValiError) {
          ctx.response.body = ApiRequestErrors.requestBodyNotValidError(
            e.issues,
          );
        }
        return;
      }
      // get response
      try {
        const response = await requestHandler(request);
        ctx.response.body = response;
        if (response.error) {
          ctx.response.status = response.status;
        } else {
          ctx.response.status = Status.OK;
        }
      } catch (_e) {
        const genericErrorResponse = declareErrorResponse(
          Status.InternalServerError,
          "An unknown error occurred.",
        );
        ctx.response.body = genericErrorResponse;
        ctx.response.status = genericErrorResponse.status;
      }
    });
  };

  return Object.freeze({
    path: __servicePath,
    router,
    declareRequest,
  });
}

export type JsonApiDeclaration = ReturnType<typeof declareJsonApi>;

export const registerServices = (services: JsonApiDeclaration[]) =>
  Object.freeze(services);
