import { Grammars, TokenError, type IToken } from "npm:ebnf"
import { loadTextFile } from "../../common/file.ts";
import path from "node:path";
import grammarParserErrors from "./errors.ts";
const Parser = Grammars.W3C.Parser;

export class GrammarParser {
    private readonly grammar;
    private readonly parser;
    
    constructor(grammar: string) {
        this.grammar = grammar;
        try {
            this.parser = new Parser(this.grammar, { keepUpperRules: true });
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : undefined;
            throw grammarParserErrors.InvalidGrammarSpec.create(errorMessage);
        }
    }
    
    // top-most rule is used if no targetRule is specified 
    parse(input: string, targetRule?: string) {
        // get abstract syntax tree (AST)
        const ast = this.parser.getAST(input, targetRule);
        if (!ast && input.length === 0) {
            throw grammarParserErrors.ItemNotFound.create("input is empty");
        } else if (!ast) {
            throw grammarParserErrors.InvalidInputText.create("input could not parsed");
        }
        // check for errors and collate them all
        const collateErrors = (token: IToken) => {
            if (!token) return [new TokenError("input is invalid", token)];
            const errors : TokenError[] = [];
            errors.push(...token.errors);
            token.children.forEach((_token)=>{
                errors.push(...collateErrors(_token));
            })
            return errors;
        };
        const errors = collateErrors(ast).map((e, idx)=>{
            let errorMessage = e.message;
            errorMessage = `[${idx}] => ` + errorMessage.charAt(0).toLowerCase() + errorMessage.slice(1);
            return errorMessage;
        }).join(", ");
        // throw error if any errors present in AST
        const hasError = errors.length > 0;
        if (hasError) {
            throw grammarParserErrors.InvalidInputText.create(errors);
        }
        // return the ast
        return ast;
    }
}

export async function createGrammarParserFromFile(filePath: string) {
    const grammarFile = await loadTextFile(path.resolve(filePath));
    const grammarParser = new GrammarParser(grammarFile);
    return grammarParser;
}

export function recursivelyFindOfType(token: IToken, type: string) {
    const collection : IToken[] = [];
    function _recursivelyFindOfType(collection: IToken[], token: IToken) {
        if (token.type === type) {
            collection.push(token);
        }
        for (const _token of token.children) {
            _recursivelyFindOfType(collection, _token);
        }
    }

    _recursivelyFindOfType(collection, token);

    return collection;
}

export function recursivelyFindFirstOfType<
    ThrowError extends boolean = true
>(token: IToken, type: string, includeSelf: boolean = false, throwError: ThrowError) {
    if (includeSelf && token.type === type) {
            return token;
    }
    function _recursivelyFindFirstOfType(token: IToken) {
        for (const _token of token.children) {
            if (_token.type === type) {
                return _token;
            }
            else {
                _recursivelyFindFirstOfType(_token);
            }
        }
    }
    const result = _recursivelyFindFirstOfType(token);
    if (throwError && !result) {
        throw grammarParserErrors.ItemNotFound.create(`could not find ${type} when parsing ${token.type}`);
    }
    return result as ThrowError extends true ? Exclude<typeof result, undefined> : typeof result;
}

export function shallowFindOfType(token: IToken, type: string) {
    return token.children.filter((_token)=>(_token.type === type));
}
