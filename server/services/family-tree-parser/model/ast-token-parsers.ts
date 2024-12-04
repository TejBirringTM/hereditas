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

export const ADOPTED_PROGENY_DECLARATION = ((token)=>{
    const marriageReferences = shallowFindOfType(token, "MARRIAGE_REFERENCE");
    const personExpressions = shallowFindOfType(token, "PERSON_EXPRESSION");
    const fromExpression = (marriageReferences.length > 0) ? MAYBE_A_(MARRIAGE_REFERENCE, marriageReferences[0]) : MAYBE_A_(PERSON_EXPRESSION, personExpressions[0]);
    const toExpression = (marriageReferences.length > 0) ? MAYBE_A_(PERSON_EXPRESSION, personExpressions[0]) : MAYBE_A_(PERSON_EXPRESSION, personExpressions[1]);
    assert(!!fromExpression);
    assert(!!toExpression);
    return {
        type: "ADOPTED_PROGENY_DECLARATION",
        from: fromExpression,
        to: toExpression
    }
}) satisfies SomeTokenParser;

export const MARRIAGE_DECLARATION = ((token)=>{
    const personExpressions = shallowFindOfType(token, "PERSON_EXPRESSION");
    const fromExpression = MAYBE_A_(PERSON_EXPRESSION, personExpressions[0]);
    const toExpression = MAYBE_A_(PERSON_EXPRESSION, personExpressions[1]);
    assert(!!fromExpression);
    assert(!!toExpression);
    const key = recursivelyFindFirstOfType(token, "MARRIAGE_DECLARATION_KEY", false, false)?.text;
    return {
        type: "MARRIAGE_DECLARATION",
        from: fromExpression,
        to: toExpression,
        key: key || `mrg:${toExpression.key}`
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
