import { LargeLanguageModelFailed } from "../../../errors/scribe-ft.ts";
import { Bot, Prompt } from "./llm-interface.ts";
import { openai } from "./llm-vendors.ts";

export class GptO1Mini implements Bot {
    private readonly openai;
    constructor() {
        this.openai = openai();
    }
    async complete(prompts: Prompt[]): Promise<string> {
        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: prompts
            });
            if (completion.choices.length === 0 || !completion.choices[0].message.content || completion.choices[0].message.content.length === 0) {
                throw LargeLanguageModelFailed.create("AI failed to produce output");
            }
            const result = completion.choices[0].message.content;
            return result;
        } catch (e) {
            if (e instanceof Error) {
                console.error('Error occurred:', e);  // Logs the error with full stack trace
                if (e.cause) {
                  console.error('Caused by:', e.cause);
                }
            } else {
                console.error('An unknown error occurred:', e);
            }
            throw LargeLanguageModelFailed.create("AI failed");
        }
    }
}
