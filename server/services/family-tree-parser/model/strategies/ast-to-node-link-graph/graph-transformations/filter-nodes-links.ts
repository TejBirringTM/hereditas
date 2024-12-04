import { declareTransformation } from "../../strategy.ts";
import assignGenerationNumbers from "./assign-generation-numbers.ts";

type Input = ReturnType<typeof assignGenerationNumbers["fn"]>;
export default declareTransformation("Filter nodes and links", (input: Input)=>{
    return {
        nodes: input.nodes,
        links: input.links.filter((link)=>(
            link.type === "Groom" || 
            link.type === "Bride" ||
            link.type === "MaritalProgeny" ||
            link.type === "AdoptedMaritalProgeny" ||
            link.type === "AdoptedChild"
        ))
    }
});
