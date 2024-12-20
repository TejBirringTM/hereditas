import { GptO1Mini } from "./llm-bots.ts";
import { promptV1 } from "./prompt-templates.ts";

interface IFamilyTreeScribe {
  scribe(humanReadableTextEntry: string): Promise<string>;
}

export class FamilyTreeScribe implements IFamilyTreeScribe {
  private readonly grammar;
  private readonly gpt;

  constructor(grammar: string) {
    this.grammar = grammar;
    this.gpt = new GptO1Mini();
  }

  async scribe(familyTreeDescription: string): Promise<string> {
    const result = await this.gpt.complete(
      promptV1({
        grammar: this.grammar,
        familyTreeDescription,
      }),
    );
    return result;
  }
}
