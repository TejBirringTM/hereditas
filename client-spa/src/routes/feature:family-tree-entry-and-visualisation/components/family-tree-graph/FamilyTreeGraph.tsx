import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Graph as FamilyTreeGraph } from "../../libs/parse-family-tree-entry";
import {forceManyBody, forceCenter, forceCollide, forceLink, forceY, forceX, forceSimulation} from "d3-force";
import {select} from "d3-selection"
import {line} from "d3-shape"
import {zoom as _zoom, D3ZoomEvent} from "d3-zoom";
import { SimulationNode, SimulationLink } from "../types";
import { getLinkStyle, getNodeStyle } from "./family-tree-graph-styling/node-link-style";
import FamilyTreeGraphPopup from "./FamilyTreeGraphPopup";
import { gridLineColour } from "./family-tree-graph-styling/grid-style";
import styles from "./FamilyTreeGraph.module.css"

export interface FamilyTreeEntryGraphFunctions {
    reset: () => void
}

interface FamilyTreeEntryGraphProps {
    graph?: FamilyTreeGraph | null,
    width: number,
    height: number,
}

const FamilyTreeEntryGraph = forwardRef<FamilyTreeEntryGraphFunctions, FamilyTreeEntryGraphProps>(({graph, width, height}, ref)=>{
    const root = useRef<HTMLDivElement>(null);
    const [selectedNode, _selectNode] = useState<SimulationNode|null>(null);
    const [selectedNodePosition, selectNodePosition] = useState<[number, number]|null>(null);

    useImperativeHandle(ref, ()=>({
        reset() {
            const gNodes = select("svg").select("g.nodes");
            const gLinks = select("svg").select("g.links");
            gNodes.attr("transform", null);
            gLinks.attr("transform", null);
        },
    }));

    function selectNode(nodeToSelect: SimulationNode | null, allNodes?: SimulationNode[], allLinks?: SimulationLink[]) {
        // set state
        _selectNode(nodeToSelect);
        if (!nodeToSelect) {
            if (allNodes) {
                allNodes.forEach((node)=>{
                    node.state = "normal";
                })
            }
            return;
        }
        if (allNodes && allLinks) {
            // highlight lineage nodes
            allNodes.forEach((node)=>{
                // unhighlight existing 
                if (node.identity === nodeToSelect.identity) {
                    node.state = "selected";
                } else {
                    node.state = "normal";
                }
                // highlight those associated with the lineage of this node
                if (!nodeToSelect.patrilineage) {
                    return;
                } else {
                    const isLineageNode = nodeToSelect.patrilineage.nodes.includes(node.identity);
                    if (isLineageNode) {
                        node.state = "highlighted";
                    }
                }
            });
            // highlight lineage links
            allLinks.forEach((link)=>{
                // unhighlight existing 
                link.state = "normal";
                // highlight those associated with the lineage of this node
                if (!nodeToSelect.patrilineage) {
                    return
                } else {
                    const isLineageLink = nodeToSelect.patrilineage.links.find((lineageLink)=>(
                        link.type === lineageLink.type &&
                        link.fromNodeIdentity === lineageLink.fromNodeIdentity &&
                        link.toNodeIdentity === lineageLink.toNodeIdentity
                    ));
                    if (isLineageLink) {
                        link.state = "highlighted";
                    }
                }
            })
        }
    }

    // render graph elements and start forces simulation
    useEffect(()=>{
        const svgWidth = width;
        const svgHeight = height;
        const div = select(root.current);
        let svg = div.select<SVGElement>("svg");

        if (!graph) {
            console.debug("No graph, therefore nothing to draw.");
            svg.remove();
            selectNode(null);
            selectNodePosition(null);
            return;
        } else {
            console.debug("Drawing graph...");
        }

        const numOfGenerations = Math.max(...graph.nodes.map((node)=>node.generationInTree));
        const pxPerGenerationHeight = 250;
        const pxGenerationsHeight = (numOfGenerations * pxPerGenerationHeight) + pxPerGenerationHeight;

        if (svg.empty()) {
            div.append('svg')
                .attr("width", svgWidth)
                .attr("height", pxGenerationsHeight)
                .attr("viewBox", [0, 0, svgWidth, pxGenerationsHeight])
                // .attr("style", "max-width: 100%;")
                .attr("style", "max-width: 100%; height: auto;")
            svg = div.select("svg");            
            svg.append("g").classed("nodes", true);
            svg.append("g").classed("links", true);
            svg.append("g").classed("y-guide", true);
        } else {
            svg.selectChildren().remove();
            svg
                .attr("width", svgWidth)
                .attr("height", pxGenerationsHeight)
                .attr("viewBox", [0, 0, svgWidth, pxGenerationsHeight])
                // .attr("style", "max-width: 100%;")
                .attr("style", "max-width: 100%; height: auto;")
            svg.append("g").classed("nodes", true);
            svg.append("g").classed("links", true);
            svg.append("g").classed("y-guide", true);
        }

        const gNodes = svg.select("g.nodes");
        const gLinks = svg.select("g.links");
        const gY = svg.select("g.y-guide");

        function handleZoom(event: D3ZoomEvent<SVGElement, unknown>) {
            gNodes.attr("transform", event.transform.toString());
            gLinks.attr("transform", event.transform.toString());
            selectNode(null);
        }
    
        const zoom = _zoom<SVGElement, unknown>()
            .on("zoom", handleZoom);

        svg.call(zoom);
            
        function updateNodeStyles() {
            const nodeSelectGroup = gNodes.selectAll("g.node");
            const nodeSelectCircle = nodeSelectGroup.selectAll<SVGCircleElement, SimulationNode>("circle");
            const nodeSelectText = nodeSelectGroup.selectAll<SVGTextElement, SimulationNode>("text");

            nodeSelectCircle
                .attr("r", (d)=>getNodeStyle(d).r)
                .attr("fill", (d)=>getNodeStyle(d).fill)
                .attr("stroke", (d)=>getNodeStyle(d).stroke)
                .attr("stroke-width", (d)=>getNodeStyle(d)["stroke-width"]);

            nodeSelectText
                .attr("font-size", (d)=>getNodeStyle(d)["font-size"])
                .attr("font-weight", (d)=>getNodeStyle(d)["font-weight"])
                .attr("fill", (d)=>getNodeStyle(d)["text-colour"])
                .text((d)=>getNodeStyle(d).text)
        }

        function updateLinkStyles() {
            const linkLines = gLinks.selectAll<SVGLineElement, SimulationLink>("line.link");
            linkLines
                .attr("stroke", (d)=>getLinkStyle(d).stroke)
                .attr("stroke-width", (d)=>getLinkStyle(d)["stroke-width"])
                .attr("stroke-dasharray", (d)=>getLinkStyle(d)["stroke-dasharray"])
                .attr("marker-start", (d)=>getLinkStyle(d)["marker-start"])
                .attr("marker-end", (d)=>getLinkStyle(d)["marker-end"])
        }
        
        function updateStyles() {
            updateNodeStyles();
            updateLinkStyles();
        }

        // See https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker
            const filledArrowMarkerBoxSize = 3.5;
            const filledArrowRefX = filledArrowMarkerBoxSize/2;
            const filledArrowRefY = filledArrowMarkerBoxSize/2;
            const filledArrowPoints = [[filledArrowMarkerBoxSize, filledArrowMarkerBoxSize/2], [0, 0], [0, filledArrowMarkerBoxSize]] satisfies [number, number][];
            svg
                .on("click", (event: MouseEvent)=>{
                    event.stopPropagation();
                    nodes.forEach((node)=>{
                        node.state = "normal";
                    });
                    links.forEach((link)=>{
                        link.state = "normal"
                    })
                    selectNode(null, nodes, links);
                    updateStyles();
                })
                .append('defs')
                .append('marker')
                .attr('id', 'filledArrow')
                .attr('viewBox', [0, 0, filledArrowMarkerBoxSize, filledArrowMarkerBoxSize])
                .attr('refX', filledArrowRefX)
                .attr('refY', filledArrowRefY)
                .attr('markerWidth', filledArrowMarkerBoxSize)
                .attr('markerHeight', filledArrowMarkerBoxSize)
                .attr('orient', 'auto-start-reverse')
                .attr('fill', 'context-stroke')
                .append('path')
                .attr('d', line()(filledArrowPoints))

        const yLines = new Array<number>(numOfGenerations);
        for (let i = 0; i<numOfGenerations; i++) {
            yLines[i]=(i+1)*pxPerGenerationHeight;
        }
        const _yLines = gY.selectAll("line.y-guide")
            .data(yLines)
            .join(
                (enter) => {
                    const line = enter.append("line")
                        .classed("y-guide", true)
                        .attr("x1", 0)
                        .attr("x2", svgWidth)
                        .attr("y1", (d)=>d)
                        .attr("y2", (d)=>d)
                        .attr("stroke", gridLineColour.hex)
                        .attr("stroke-width", 2)
                    return line;
                },
                (update) => {
                    return update;
                },
                (exit) => {
                    return exit.remove();
                }
        )

        const nodes : SimulationNode[] = graph.nodes.map((node)=>({
            ...node,
            index: undefined,
            x: undefined,
            y: undefined,
            vx: undefined,
            vy: undefined,
            fx: undefined,
            fy: undefined,
            state: "normal"
        }));

        const links = graph.links.map((link)=>({
            ...link, 
            index: undefined,
            source: link.fromNodeIdentity as unknown as SimulationNode,
            target: link.toNodeIdentity as unknown as SimulationNode,
            state: "normal"
        })) satisfies SimulationLink[];

        const _forceManyBody = forceManyBody();
        const _forceCentre = forceCenter(svgWidth/2, svgHeight/2);
        const _forceCollide = forceCollide<SimulationNode>((d)=>((d.type === "Marriage") ? 0 : (getNodeStyle(d).r as number) * 1.5));
        const _forceLink = forceLink(links)
                                .strength((d)=>{
                                    switch (d.type) {
                                        case "Bride":
                                            return 1;
                                        case "Groom":
                                            return 1;
                                        case "MaritalProgeny":
                                            return 1/100;
                                        case "AdoptedMaritalProgeny":
                                            return 1/100;
                                        default:
                                            return 1/100;
                                    }   
                                })
                                .distance((d)=>{
                                    switch (d.type) {
                                        case "Bride":
                                            return 0;
                                        case "Groom":
                                            return 0;
                                        case "MaritalProgeny":
                                            return 30;
                                        case "AdoptedMaritalProgeny":
                                            return 30;
                                        default:
                                            return 30;
                                    }
                                });
        const _forceY = forceY<SimulationNode>((d) => (d.generationInTree * pxPerGenerationHeight)).strength(2);
        
        const rootAncestors = nodes.reduce<string[]>((prev, curr) => {
            const identity = curr.rootAncestor?.identity;
            if (identity && !prev.includes(identity)) {
                prev.push(identity);
            }
            return prev;
        }, []);
        const rootAncestor = (node: SimulationNode) => {
            if (node.generationInClan === 1) {
                return rootAncestors.indexOf(node.identity) + 1;
            } else if (node.rootAncestor) {
                return rootAncestors.indexOf(node.rootAncestor.identity) + 1;
            } else {
                return 0;
            }
        }
        const _forceX = forceX<SimulationNode>((d) => rootAncestor(d) * svgWidth/rootAncestors.length).strength((d) => d.type === "Male" ? 1 : 1/100);

        const simulation = forceSimulation(nodes)
                            .force("link", _forceLink.id((node)=>(node as typeof nodes[0]).identity))
                            .force("charge", _forceManyBody)
                            // .force("centre", _forceCentre)
                            .force("collide", _forceCollide)
                            .force("y", _forceY)
                            .force("x", _forceX)
                            .on("tick", onSimulationTick);

        const _nodes = gNodes.selectAll("g.node")
            .data(nodes)
            .join(
                (enter)=>{
                    const group = enter.append("g").classed("node", true);

                    group.append("circle")
                        .attr("pointer-events", "visibleFill")
                        .attr("cursor", (d)=>(d.type === "Male" || d.type === "Female") ? "pointer" : null)
                        .on("mouseenter", (_event, d) => {
                            if ((d.state === "normal") && (d.type === "Male" || d.type === "Female")) {
                                d.state = "hovered";
                            }
                            updateStyles();
                        })
                        .on("mouseleave", (_event, d) => {
                            if (d.type === "Male" || d.type === "Female") {
                                if (d.state === "hovered") {
                                    d.state = "normal";
                                }
                            }
                            updateStyles();
                        })
                        .on("click", (event: MouseEvent, d) => {
                            event.stopPropagation();
                            if (d.type === "Male" || d.type === "Female") {
                                selectNode(d, nodes, links);
                                const position = [event.pageX, event.pageY] as [number, number];
                                /*
                                    Below, we need to adjust the x position such that the popup does not start from a position
                                    where it would exceed the svgWidth. If this happens, the popup will automatically be squeezed
                                    to fit the svg dimensions - which does not look good!

                                    300px is the max-width of the popup (see the corresponding FamilyTreeGraph.module.css file)
                                    the additional 15px is used as an arbitrary margin that seems to work well.
                                */
                                position[0] = ((position[0] + 300) > svgWidth) ? (svgWidth - 300 - 15) : position[0];
                                selectNodePosition(position);
                            }
                            updateStyles();
                        })

                    group.append("text")
                        .style("user-select", "none")
                        .style("user-drag", "none")
                        .attr("pointer-events", "none")
                        .attr("text-anchor", "middle")
                        .attr("dominant-baseline", "middle");

                    group.call(updateStyles);
                    return group;
                },
                (update)=>{
                    return update;
                },
                (exit)=>{
                    return exit.remove()
                },
            )

        const _links = gLinks.selectAll("line.link")
            .data(links)
            .join(
                (enter)=>{
                    const line = enter.append("line")
                        .classed("link", true)
                        .attr("pointer-events", "none");
                    updateStyles();
                    return line;
                },
                (update)=>{
                    return update
                },
                (exit)=>{
                    return exit.remove()
                }
        )    
        


        function onSimulationTick() {
            scrollToSvg();

            _nodes
                .select("circle")
                .attr("cx", (d) => d.x ?? null)
                .attr("cy", (d) => d.y ?? null);

            _nodes.select("text")
                .attr("x", (d) => d.x ?? null)
                .attr("y", (d) => d.y ?? null);

            _links
                .attr("x1", (d) => {
                    if (!d.target.x || !d.target.y || !d.source.x || !d.source.y) return null;
                    const dx = d.target.x - d.source.x;
                    const dy = d.target.y - d.source.y;
                    const angle = Math.atan2(dy, dx); // calculate angle between source and target nodes
                    return d.source.x + Math.cos(angle) * (getNodeStyle(d.source).r as number);
                })
                .attr("y1", (d) => {
                    if (!d.target.x || !d.target.y || !d.source.x || !d.source.y) return null;
                    const dx = d.target.x - d.source.x;
                    const dy = d.target.y - d.source.y;
                    const angle = Math.atan2(dy, dx); // calculate angle between source and target nodes
                    return d.source.y + Math.sin(angle) * (getNodeStyle(d.source).r as number);
                })
                .attr("x2", (d) => {
                    if (!d.target.x || !d.target.y || !d.source.x || !d.source.y) return null;
                    const dx = d.source.x - d.target.x;
                    const dy = d.source.y - d.target.y;
                    const angle = Math.atan2(dy, dx); // calculate angle between source and target nodes
                    return d.target.x + Math.cos(angle) * (getNodeStyle(d.target).r as number);
                })
                .attr("y2", (d) => {
                    if (!d.target.x || !d.target.y || !d.source.x || !d.source.y) return null;
                    const dx = d.source.x - d.target.x;
                    const dy = d.source.y - d.target.y;
                    const angle = Math.atan2(dy, dx); // calculate angle between source and target nodes
                    return d.target.y + Math.sin(angle) * (getNodeStyle(d.target).r as number);
                })
        }

        let scrolledIntoView = false;

        function scrollToSvg() {
            const el = svg.node();
            if (el && !scrolledIntoView) {
                el.scrollIntoView({behavior: "smooth"});
                scrolledIntoView = true;
            }
        }
    }, [graph, width, height]);

    return <div ref={root} className={styles.graph} style={{height: "fit-content", overflowX: "auto"}}>
        <FamilyTreeGraphPopup
            node={selectedNode}
            left={selectedNodePosition?.[0]}
            top={selectedNodePosition?.[1]}
        />
    </div>    
})

export default FamilyTreeEntryGraph;