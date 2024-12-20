import { makePromptsTemplate, Prompt } from "./llm-interface.ts";

export const promptV1 = makePromptsTemplate(
  (
    { grammar, familyTreeDescription }: {
      grammar: string;
      familyTreeDescription: string;
    },
  ) => {
    const initialSystemPrompt: Prompt = {
      role: "system",
      content:
        `You are a specialist in converting plain English descriptions of family trees (i.e. geneologies, ancestries) into a formal EBNF notation.

Here is the complete grammar specification in EBNF format:
${grammar}

Follow these rules strictly:

1. Create declaration keys using lowercase names without spaces. Declaration keys can contain uppercase or lowercase alphabet, digits, or "."; must begin with alphabet or non-zero digit.
2. Always start with a START WITH declaration for the earliest ancestor mentioned
3. Remember that descendants (i.e. progeny and adopted progeny) are always declared on a marriage, so marriages need to be declared first! Therefore, identify and declare marriages first. When no marriage is explitly mentioned but a descendant is, assume a spouse whose name was not recorded i.e. (<create declaration key for spouse>: "") and create a marriage declaration for it BEFORE declaring progeny or adopted progeny.
4. When no gender is mentioned for an individual, take an educated guess, otherwise assume that the person is male.
5. Use APPEND for additional information about individuals. An APPEND must always end with a newline.
6. Add helpful comments using /* */
7. Never append any additional characters before or after the output. Make sure the result exactly conforms to the described EBNF.
`,
    };

    const examplarSystemPrompt: Prompt = {
      role: "system",
      content:
        `Here's a comprehensive example showing multiple generations and relationships:

/* Family tree of the Smith-Jones lineage */
START WITH [john: "John Smith Sr."]
(margaret: "Margaret Wilson")
[john] ----{mrg:john.margaret}---- (margaret)

/* Children of John and Margaret */
{mrg:john.margaret} ----{dsc:john.jr}---> [johnjr: "John Smith Jr."]
{mrg:john.margaret} ----{dsc:mary}---> (mary: "Mary Smith")

/* John Jr.'s marriage and children */
(sarah: "Sarah Jones")
[johnjr] ----{mrg:johnjr.sarah}---- (sarah)
{mrg:johnjr.sarah} ----{dsc:william}---> [william: "William Smith"]

/* Additional information */
APPEND [john]:
Founder of Smith Trading Company
Lived 1820-1885

APPEND (sarah):
Daughter of Robert Jones
Accomplished pianist
`,
    };

    const instructionalSystemPrompt: Prompt = {
      role: "system",
      content:
        'For each input, provide only the EBNF output with no additional explanation. If this is not possible, just respond with "FAILED: " followed by a brief reason why.',
    };

    const userPrompt: Prompt = {
      role: "user",
      content: `Here is a description of a family tree in plain English:

\"${familyTreeDescription}\"

Provide only the EBNF output with no additional explanation.
`,
    };

    return [
      initialSystemPrompt,
      examplarSystemPrompt,
      instructionalSystemPrompt,
      userPrompt,
    ];
  },
);
