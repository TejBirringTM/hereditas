import * as v from "@valibot/valibot";
import { declareJsonApi } from "../../common/framework/main.ts";
import { deflate, inflate } from "./model/tokeniser.ts";
import {
  declareErrorResponse,
  declareSuccessResponse,
} from "../../common/framework/response.ts";
import { Status } from "@oak/oak";
import { isRuntimeError } from "../../errors/runtime-error.ts";
import { dumpError } from "../../common/error-handling.ts";

const tokeniserService = declareJsonApi("tokeniser");

tokeniserService.declareRequest(
  true,
  ["tokenise-string"],
  1,
  v.strictObject({
    string: v.string(),
  }),
  async (request) => {
    try {
      const inputString = request.string;
      const token = await deflate(inputString);
      return declareSuccessResponse({
        token,
      });
    } catch (e) {
      dumpError(e);
      if (isRuntimeError(e)) {
        return declareErrorResponse(Status.BadRequest, e.message);
      } else {
        return declareErrorResponse(
          Status.InternalServerError,
          "An unknown error occurred.",
        );
      }
    }
  },
);

tokeniserService.declareRequest(
  true,
  ["detokenise-string"],
  1,
  v.strictObject({
    token: v.string(),
  }),
  async (request) => {
    try {
      const inputString = request.token;
      const detoken = await inflate(inputString);
      return declareSuccessResponse({
        string: detoken,
      });
    } catch (e) {
      dumpError(e);
      if (isRuntimeError(e)) {
        return declareErrorResponse(Status.BadRequest, e.message);
      } else {
        return declareErrorResponse(
          Status.InternalServerError,
          "An unknown error occurred.",
        );
      }
    }
  },
);

export default tokeniserService;
