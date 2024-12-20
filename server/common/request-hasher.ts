import { RouteParams, RouterContext, State } from "@oak/oak";
import { getQuery } from "./request-hasher/get-query.ts";

type JsonPrimitive = string | number | boolean | null;
type JsonArray = JsonValue[];
type JsonObject = { [key: string]: JsonValue };
type JsonValue = JsonPrimitive | JsonObject | JsonArray;

interface SerialisableRequest extends JsonObject {
    method: string;
    path: string;
    query: Record<string, string | string[]>;
    body: JsonValue;
    params: Record<string, string>;
    headers: Record<string, string>;
}

interface RequestHashOptions {
    includeHeaders?: boolean | string[];
    excludeHeaders?: string[];
    includePath?: boolean;
    includeQuery?: boolean;
    includeBody?: boolean;
    includeParams?: boolean;
    normaliseArrays?: boolean;
    trimStrings?: boolean;
}

const defaultOptions = {
    includeHeaders: ['content-type', 'accept'],
    excludeHeaders: ['authorization', 'cookie', 'user-agent'],
    includePath: true,
    includeQuery: true,
    includeBody: true,
    includeParams: true,
    normaliseArrays: true,
    trimStrings: true,
} as const satisfies RequestHashOptions;

export class RequestHasher {
    private static sortObjectKeys = <T extends JsonValue>(obj: T): T => {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(RequestHasher.sortObjectKeys) as T;
        }

        return Object.keys(obj as JsonObject)
            .sort()
            .reduce<JsonObject>((acc, key) => {
                acc[key] = RequestHasher.sortObjectKeys((obj as JsonObject)[key]);
                return acc;
            }, {}) as T;
    };

    private static normaliseValue<V extends string | string[]>(value: V, options: RequestHashOptions) {
        if (typeof value === 'string' && options.trimStrings) {
            return value.trim() as V;
        }

        if (Array.isArray(value) && options.normaliseArrays) {
            return [...new Set(value)].sort() as V;
        }

        return value;
    }

    private static hashString(str: string) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    private static filterHeaders(
        headers: Headers,
        options: RequestHashOptions,
    ) {
        const normalisedHeaders: Record<string, string> = {};
        const includeHeaders =
            options.includeHeaders === true ? Array.from(headers.keys()) : options.includeHeaders || [];

        const excludeHeaders = options.excludeHeaders || [];

        for (const [key, value] of headers.entries()) {
            const headerKey = key.toLowerCase();
            if (
                value !== undefined &&
                includeHeaders.includes(headerKey) &&
                !excludeHeaders.includes(headerKey)
            ) {
                normalisedHeaders[headerKey] = value;
            }
        }

        return normalisedHeaders;
    }

    private static extractMethod<
        R extends string, P extends RouteParams<R> = RouteParams<R>, S extends State = Record<string, unknown>    
    >(ctx: RouterContext<R, P, S>) {
        return ctx.request.method;
    }

    private static extractPath<
        R extends string, P extends RouteParams<R> = RouteParams<R>, S extends State = Record<string, unknown>    
    >(ctx: RouterContext<R, P, S>) {
        return ctx.request.url.pathname;
    }

    private static extractQueryParams<
        R extends string, P extends RouteParams<R> = RouteParams<R>, S extends State = Record<string, unknown>    
    >(ctx: RouterContext<R, P, S>, options: RequestHashOptions) {
        return Object.fromEntries(
            Array.from(ctx.request.url.searchParams.entries()).map(([key, value]) => [
                key,
                RequestHasher.normaliseValue(value, options),
            ])
        )
    }

    private static async extractBody<
    R extends string, P extends RouteParams<R> = RouteParams<R>, S extends State = Record<string, unknown>    
>(ctx: RouterContext<R, P, S>) {
    if (!ctx.request.hasBody) {
        return "";
    } else {
        return await ctx.request.body.text();
    }
}

private static extractPathParams<
R extends string, P extends RouteParams<R> = RouteParams<R>, S extends State = Record<string, unknown>    
>(ctx: RouterContext<R, P, S>, options: RequestHashOptions) {
    return Object.entries(getQuery(ctx, { mergeParams: true })).reduce(
        (acc, [key, value]) => {
            acc[key] = RequestHasher.normaliseValue(value, options) as string;
            return acc;
        },
        {} as Record<string, string>
    );
}

private static extractHeaders<
R extends string, P extends RouteParams<R> = RouteParams<R>, S extends State = Record<string, unknown>    
>(ctx: RouterContext<R, P, S>, options: RequestHashOptions) {
    return RequestHasher.filterHeaders(ctx.request.headers, options);
}

    static async serialiseRequest<
        R extends string, P extends RouteParams<R> = RouteParams<R>, S extends State = Record<string, unknown>    
    >(
        ctx: RouterContext<R, P, S>,
        options: RequestHashOptions = {}
    ): Promise<SerialisableRequest> {
        const mergedOptions = { ...defaultOptions, ...options };

        const serialised: SerialisableRequest = {
            method: this.extractMethod(ctx),
            path: mergedOptions.includePath ? this.extractPath(ctx) : '',
            query: mergedOptions.includeQuery ? this.extractQueryParams(ctx, mergedOptions) : {},
            body: mergedOptions.includeBody ? await this.extractBody(ctx) : {},
            params: mergedOptions.includeParams ? this.extractPathParams(ctx, mergedOptions) : {},
            headers: mergedOptions.includeHeaders ? this.extractHeaders(ctx, mergedOptions) : {},
        };

        return serialised;
    }

static async hashRequest<
    R extends string, P extends RouteParams<R> = RouteParams<R>, S extends State = Record<string, unknown>    
    >(
        ctx: RouterContext<R, P, S>,
        options: RequestHashOptions = {}
    ): Promise<string> {
        const serialised = await RequestHasher.serialiseRequest(ctx, options);
        const sorted = RequestHasher.sortObjectKeys(serialised);
        const stringified = JSON.stringify(sorted);
        return RequestHasher.hashString(stringified);
    }
}
