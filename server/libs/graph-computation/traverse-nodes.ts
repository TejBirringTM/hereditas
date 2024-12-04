type LoopFunctionArgs<Node, Context> = {
    context: Context,
    node: Node,
    iteration: Readonly<number>,
    thisIteration: Readonly<{
        nodes: Node[]
    }>,
    nextIteration: Readonly<{
        nodes: Node[]
    }>,
    scheduleNode: (...nodes: Node[]) => void
};

export function traverseNodes<Node, Context>(
    nodes: Node[],
    initialContext: Context,
    loopFunction: (args: LoopFunctionArgs<Node, Context>) => Context
) {
    // initialise loop context
    let context = structuredClone(initialContext);
    let iteration = 1;
    let currentNodes = nodes;
    let nextNodes = new Set<Node>();
    // loop
    while(currentNodes.length > 0) {
        currentNodes.forEach((currentNode)=>{
            const args = {
                context,
                node: currentNode,
                iteration,
                thisIteration: Object.freeze({
                    nodes: currentNodes
                }),
                nextIteration: Object.freeze({
                    nodes: Array.from(nextNodes)
                }),
                scheduleNode: (...nodes: Node[]) => {
                    nodes.forEach((nodeToSchedule)=>{
                        nextNodes.add(nodeToSchedule);
                    });
                }
            } satisfies LoopFunctionArgs<Node, Context>;
            context = loopFunction(args);
        });
        // update loop context
        iteration++;
        currentNodes = Array.from(nextNodes);
        nextNodes = new Set<Node>();
    }
    // return the user context as final result
    return context;
}
