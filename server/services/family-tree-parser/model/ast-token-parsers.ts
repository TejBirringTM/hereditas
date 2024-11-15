import type { IToken } from "ebnf";
import { shallowFindOfType, recursivelyFindFirstOfType } from "../../../libs/grammar-parser/main.ts";
import assert from "node:assert";

type TokenParser<T> = (token: IToken) => T;
type SomeTokenParser = TokenParser<unknown>;

export const MAYBE_A_ = <T>(parser: TokenParser<T>, token?: IToken) => token ? parser(token) : undefined;

export const MALE_DECLARATION = ((token)=>{
    const key = recursivelyFindFirstOfType(token, "DECLARATION_KEY", false, true).text;
    const title = recursivelyFindFirstOfType(token, "STRING", false, true).text.slice(1, -1);
    return {
        type: "MALE_DECLARATION",
        key,
        title
    } as const;
}) satisfies SomeTokenParser;

export const MALE_REFERENCE = ((token)=>{
    const key = recursivelyFindFirstOfType(token, "DECLARATION_KEY", false, true).text;
    return {
        type: "MALE_REFERENCE",
        key
    } as const;
}) satisfies SomeTokenParser;

export const MALE_EXPRESSION = ((token)=>{
    const declaration = MAYBE_A_(MALE_DECLARATION, recursivelyFindFirstOfType(token, "MALE_DECLARATION", false, false));
    const reference = MAYBE_A_(MALE_REFERENCE, recursivelyFindFirstOfType(token, "MALE_REFERENCE", false, false));
    const expression = declaration ?? reference;
    assert(!!expression);
    return expression;
}) satisfies SomeTokenParser;

export const FEMALE_DECLARATION = ((token)=>{
    const key = recursivelyFindFirstOfType(token, "DECLARATION_KEY", false, true).text;
    const title = recursivelyFindFirstOfType(token, "STRING", false, true).text.slice(1, -1);
    return {
        type: "FEMALE_DECLARATION",
        key,
        title
    } as const;
}) satisfies SomeTokenParser;

export const FEMALE_REFERENCE = ((token)=>{
    const key = recursivelyFindFirstOfType(token, "DECLARATION_KEY", false, true).text;
    return {
        type: "FEMALE_REFERENCE",
        key
    } as const;
}) satisfies SomeTokenParser;

export const FEMALE_EXPRESSION = ((token)=>{
    const declaration = MAYBE_A_(FEMALE_DECLARATION, recursivelyFindFirstOfType(token, "FEMALE_DECLARATION", false, false));
    const reference = MAYBE_A_(FEMALE_REFERENCE, recursivelyFindFirstOfType(token, "FEMALE_REFERENCE", false, false));
    const expression = declaration ?? reference;
    assert(!!expression);
    return expression;
}) satisfies SomeTokenParser;

export const PERSON_EXPRESSION = ((token)=>{
    const maleDeclaration = MAYBE_A_(MALE_DECLARATION, recursivelyFindFirstOfType(token, "MALE_DECLARATION", false, false));
    const maleReference = MAYBE_A_(MALE_REFERENCE, recursivelyFindFirstOfType(token, "MALE_REFERENCE", false, false));
    const femaleDeclaration = MAYBE_A_(FEMALE_DECLARATION, recursivelyFindFirstOfType(token, "FEMALE_DECLARATION", false, false));
    const femaleReference = MAYBE_A_(FEMALE_REFERENCE, recursivelyFindFirstOfType(token, "FEMALE_REFERENCE", false, false));
    const expression = maleDeclaration ?? maleReference ?? femaleDeclaration ?? femaleReference;
    assert(!!expression);
    return expression;
}) satisfies SomeTokenParser;

export const ADOPTED_HEIR_DECLARATION = ((token)=>{
    const maleExpressions = shallowFindOfType(token, "MALE_EXPRESSION");
    const fromMaleExpression = MAYBE_A_(MALE_EXPRESSION, maleExpressions[0]);
    const toMaleExpression = MAYBE_A_(MALE_EXPRESSION, maleExpressions[1]);
    assert(!!fromMaleExpression);
    assert(!!toMaleExpression);
    return {
        type: "ADOPTED_HEIR_DECLARATION",
        from: fromMaleExpression,
        to: toMaleExpression
    }
}) satisfies SomeTokenParser;

export const MARRIAGE_DECLARATION = ((token)=>{
    const fromMaleExpression = MALE_EXPRESSION(recursivelyFindFirstOfType(token, "MALE_EXPRESSION", false, true));
    const toFemaleExpression = FEMALE_EXPRESSION(recursivelyFindFirstOfType(token, "FEMALE_EXPRESSION", false, true));
    const key = recursivelyFindFirstOfType(token, "MARRIAGE_DECLARATION_KEY", false, true).text;
    return {
        type: "MARRIAGE_DECLARATION",
        from: fromMaleExpression,
        to: toFemaleExpression,
        key
    }
}) satisfies SomeTokenParser;

export const MARRIAGE_REFERENCE = ((token)=>{
    const key = recursivelyFindFirstOfType(token, "MARRIAGE_DECLARATION_KEY", false, true).text;
    return {
        type: "MARRIAGE_REFERENCE",
        key
    } as const;
}) satisfies SomeTokenParser;

export const PROGENY_DECLARATION = ((token)=>{
    const fromMarriageReference = MARRIAGE_REFERENCE(recursivelyFindFirstOfType(token, "MARRIAGE_REFERENCE", false, true));
    const toPersonExpression = PERSON_EXPRESSION(recursivelyFindFirstOfType(token, "PERSON_EXPRESSION", false, true));
    return {
        type: "PROGENY_DECLARATION",
        from: fromMarriageReference,
        to: toPersonExpression
    } as const;
}) satisfies SomeTokenParser;

export type inferToken<T extends SomeTokenParser> = ReturnType<T>;
