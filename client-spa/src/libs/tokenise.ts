import * as v from "valibot";

const errorResponseBodySchema = v.object({
    success: v.literal(false),
    error: v.literal(true),
    status: v.number(),
    message: v.string(),
});

const successResponseBodySchemaTokenise = v.object({
    success: v.literal(true),
    error: v.literal(false),
    data: v.object({
        token: v.string()
    })
});

const responseBodySchemaTokenise = v.union([successResponseBodySchemaTokenise, errorResponseBodySchema]);

const successResponseBodySchemaDetokenise = v.object({
    success: v.literal(true),
    error: v.literal(false),
    data: v.object({
        string: v.string()
    })
});

const responseBodySchemaDetokenise = v.union([successResponseBodySchemaDetokenise, errorResponseBodySchema]);

export function tokeniseString(input: string) {
    return fetch(`${import.meta.env.VITE_SERVER_URL ?? "*"}/services/tokeniser/tokenise-string/v1`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({
            string: input
        })
    })
    .then((response)=>{
        return response.json();
    })
    .then((json)=>{
        const parseResult = v.safeParse(responseBodySchemaTokenise, json);
        if (!parseResult.success) {
            throw new Error("Failed to tokenise string");
        } else if (!parseResult.output.success) {
            throw new Error(parseResult.output.message);
        } else {
            return parseResult.output.data.token;
        }
    })
}


export function detokeniseString(input: string) {
    return fetch(`${import.meta.env.VITE_SERVER_URL ?? "*"}/services/tokeniser/detokenise-string/v1`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({
            token: input
        })
    })
    .then((response)=>{
        return response.json();
    })
    .then((json)=>{
        const parseResult = v.safeParse(responseBodySchemaDetokenise, json);
        if (!parseResult.success) {
            throw new Error("Failed to detokenise string");
        } else if (!parseResult.output.success) {
            throw new Error(parseResult.output.message);
        } else {
            return parseResult.output.data.string;
        }
    })
}
