export interface Prompt {
    role: "user" | "assistant" | "system",
    content: string
}

export type TemplateArgs = Record<string, string | number | boolean | undefined | null>;

export type PromptTemplate<Args extends TemplateArgs> = (args: Args) => Prompt;
export type PromptsTemplate<Args extends TemplateArgs> = (args: Args) => Prompt[];

export function makePromptTemplate<Args extends TemplateArgs>(templateFn: PromptTemplate<Args>) : PromptTemplate<Args> {
    return templateFn;
}

export function makePromptsTemplate<Args extends TemplateArgs>(templateFn: PromptsTemplate<Args>) : PromptsTemplate<Args> {
    return templateFn;
}

export interface Bot {
    complete(prompts: Prompt[]) : Promise<string>
}
