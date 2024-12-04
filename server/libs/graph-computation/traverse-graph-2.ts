import assert from "node:assert";

type NeighbourFn<Node> = (currentNode: Node) => Node[];

interface VisitContext<Node> {
    rootNode: Node;
    currentNode: {
        node: Node,
        neighbours: {
            all: Node[],
            new: Node[],    // these are neighbours that have already been visited (i.e. processed) and therefore don't need to be stacked
            old: Node[],
        };
    };
}

type VisitFn<Node> = (context: VisitContext<Node>) => void;

type BaseOptions<Node> = {
    debug?: boolean,
    visit?: VisitFn<Node>,
};

const debugOnly = <Node>(options?: BaseOptions<Node>, fn?: (()=>void)) => {
    if (options?.debug) {
        fn?.();
    }
};

type DepthFirstOptions<Node> = BaseOptions<Node> & {
    beforePush?: VisitFn<Node>,
    afterPush?: VisitFn<Node>,
    beforePop?: VisitFn<Node>,
    afterPop?: VisitFn<Node>
};

export function traverseGraphDepthFirst<Node>(startNode: Node, getNeighbours: NeighbourFn<Node>, options?: DepthFirstOptions<Node>) {
    const stack = [startNode];
    const getCurrentNode = () => stack[stack.length-1];

    const visitedNodes = new Set<Node>();

    while (stack.length > 0) {
        const n = getCurrentNode();
        debugOnly(options, ()=>{
            console.debug("CURRENT NODE: ", n);
        });

        const neighbours = getNeighbours(n);
        const visitedNeighbours = neighbours.filter((n)=>visitedNodes.has(n));
        const unvisitedNeighbours = neighbours.filter((n)=>!visitedNodes.has(n));

        const context = {
            currentNode: {
                node: n,
                neighbours: {
                    all: neighbours,
                    old: visitedNeighbours,
                    new: unvisitedNeighbours
                }
            },
            rootNode: startNode,
        } satisfies VisitContext<Node>;

        if (unvisitedNeighbours.length > 0) {
            debugOnly(options, ()=>{
                console.debug("REFERRING: ", ...unvisitedNeighbours);
            })
            // before stack push:
            options?.beforePush?.(context);
            // stack push:
            // if current node has unvisited neighbours, add them to the top of the stack
            stack.push(...unvisitedNeighbours);
            // after stack push:
            options?.afterPush?.(context);
        } else {
            debugOnly(options, ()=>{
                console.debug("VISITING NODE: ", n);
            });            
            // before pop + visit:
            options?.beforePop?.(context);
            // pop + visit:
            {
                // if current node has no (more) unvisited neighbours, pop it from the stack
                const pop = stack.pop();
                assert(pop && pop === n);
                // visit current node
                options?.visit?.(context);
                // mark current node as visited
                visitedNodes.add(pop);
            }
            // after pop + visit:
            options?.afterPop?.(context);
        }
    }
}

type BreadthFirstOptions<Node> = BaseOptions<Node> & {
    beforeEnqueue?: VisitFn<Node>,
    afterEnqueue?: VisitFn<Node>,
    beforeDequeue?: VisitFn<Node>,
    afterDequeue?: VisitFn<Node>
};

export function traverseGraphBreadthFirst<Node>(startNode: Node, getNeighbours: NeighbourFn<Node>, options?: BreadthFirstOptions<Node>) {
    const queue = [startNode];
    const getCurrentNode = () => queue[0];

    while (queue.length > 0) {
        const n = getCurrentNode();
        debugOnly(options, ()=>{
            console.debug("CURRENT NODE: ", n);
        });
        
        const neighbours = getNeighbours(n);
        const newNeighbours = neighbours.filter((n)=>!queue.includes(n));
        const oldNeighbours = neighbours.filter((n)=>queue.includes(n));

        const context = {
            currentNode: {
                node: n,
                neighbours: {
                    all: neighbours,
                    new: newNeighbours,
                    old: oldNeighbours
                }
            },
            rootNode: startNode,
        } satisfies VisitContext<Node>;

        // if current node has new neighbours, add them to the tail of the queue
        if (newNeighbours.length > 0) {
            debugOnly(options, ()=>{
                console.debug("REFERRING: ", ...newNeighbours);
            });
            // before enqueue:
            options?.beforeEnqueue?.(context);
            // enqueue:
            queue.push(...newNeighbours);
            // after enqueue:
            options?.afterEnqueue?.(context);
        // otherwise, dequeue this
        } else {
            debugOnly(options, ()=>{
                console.debug("VISITING NODE: ", n);
            });
            // before visit + dequeue:
            options?.beforeDequeue?.(context);
            // visit + dequeue:
            {
                // if current node has no new neighbours, dequeue it
                const pop = queue.shift();
                assert(pop && pop === n);
                // visit the current node
                options?.visit?.(context);
            }
            // after visit + dequeue:
            options?.afterDequeue?.(context);
        }
    }   
}
