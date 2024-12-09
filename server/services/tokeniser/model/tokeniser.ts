import zlib from "node:zlib";
import { Buffer } from "node:buffer";

export async function deflate(input: string) {
  const buffer = Buffer.from(input, "utf8");
  const deflatedBuffer = await new Promise<Buffer>((resolve, reject) => {
    zlib.deflateRaw(buffer, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
  const deflatedString = deflatedBuffer.toString("base64");
  return deflatedString;
}

export async function inflate(input: string) {
  const buffer = Buffer.from(input, "base64");
  const inflatedBuffer = await new Promise<Buffer>((resolve, reject) => {
    zlib.inflateRaw(buffer, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
  const inflatedString = inflatedBuffer.toString("utf8");
  return inflatedString;
}

export async function tokeniseObject<T>(object: T) {
  const jsonString = JSON.stringify(object);
  const token = await deflate(jsonString);
  return token;
}

export async function detokeniseObject<T>(token: string) {
  const jsonString = await inflate(token);
  const object = JSON.parse(jsonString);
  return object;
}
