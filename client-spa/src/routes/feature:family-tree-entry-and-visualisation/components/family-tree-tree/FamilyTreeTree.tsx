import { useEffect, useState } from "react";
import { Graph } from "../../libs/parse-family-tree";
import { TreeMale, Tree, TreeMarriage, TreeFemale } from "../../libs/parse-family-tree/graph-schema";
import { Box, Text, Title, PolymorphicComponentProps, BoxComponentProps } from "@mantine/core";
import appendOrdinalSuffix from "../../../../libs/append-ordinal-suffix";
import { Colour } from "../../../../libs/colour";

const defaultMaleNodeColour = new Colour(0.3801, 0.2079, 280.58);
const defaultFemaleNodeColour = new Colour(0.5413, 0.1337, 45.59);

type PersonNodeProps = {
    node: TreeMale | TreeFemale,
    adopted?: boolean
} & PolymorphicComponentProps<"div", BoxComponentProps>;

function PersonNode(props: PersonNodeProps) {
    const node = props.node;
    const adopted = props.adopted;
    const name = node.title.trim();
    return (
        <Box {...props}>
            <Title order={3} c={ node.gender === "Male" ? defaultMaleNodeColour.hex : defaultFemaleNodeColour.hex}>
                <Text span c="navy.5" inherit>{appendOrdinalSuffix(node.generationInClan ?? 1)} Gen&nbsp;</Text>
                {name || (adopted ? '(No name recorded; adopted.)' : '(No name recorded.)')}
                { adopted && name.length > 0 && <span>&nbsp;(adopted.)</span>}
            </Title>
            {
                node.text && node.text.length > 0 &&    
                node.text.map((txt, idx)=>(
                    <Text size="xs" key={`${node.identity}-paragraph-#${idx+1}`} pb={(node.text.length > 1 && idx < node.text.length - 1) ? 'xs' : undefined}>{txt}</Text>
                ))
            }
            {
                node.marriages.length > 0 ?
                <Box>
                    <Title order={4}>Marriages</Title>
                    {
                        node.marriages.map((mrg, idx)=><MarriageNode node={mrg} highlight={node.gender === 'Male' ? 'bride' : 'husband'} key={`${node.identity}-mrg-#${idx+1}`} count={node.marriages.length > 1 ? idx+1 : undefined} />)
                    }
                </Box> :
                <Box>
                    <Title order={4}><em>No marriages recorded.</em></Title>
                </Box>
            }

        </Box>
    )
}

interface MarriageNodeProps {
    node: TreeMarriage,
    highlight: "bride" | "husband",
    count?: number,
}
function MarriageNode({node, highlight, count}: MarriageNodeProps) {
    if (highlight === "bride") {
        const nProgeny = node.progeny.length;
        const nAdoptedProgeny = node.adoptedProgeny.length;
        const nTotalProgeny = nProgeny + nAdoptedProgeny;
        const name = node.bride.title.trim();
        return (
            <Box mt={ (count && count > 1) ? 'sm' : undefined}>
                <Title order={5} c={defaultFemaleNodeColour.hex}>
                    <em>Wife{count ? ` ${count}` : null},&nbsp;</em>
                    { name || "no name recorded."}
                </Title>
                {
                    nTotalProgeny > 0 ?
                        <>
                            <Title order={6}><em>Progeny from { name || (count ? `Wife ${count}` : 'Wife')}:</em></Title>
                            <Box bd="1px dotted navy.5" pl="sm" py="xs" pr="xs">
                                {
                                    node.progeny.map((prog)=>{
                                        return <PersonNode node={prog} key={prog.identity} />
                                    })
                                }
                                {
                                    node.adoptedProgeny.map((prog)=>{
                                        return <PersonNode node={prog} key={prog.identity} adopted />
                                    })
                                }
                            </Box>
                        </> :
                        <Title order={6}><em>No progeny recorded from { name || `Wife ${count}`}.</em></Title>
                }
            </Box>
        )
    } else {
        const name = node.groom.title.trim();
        return (
            <Title order={6} c={defaultMaleNodeColour.hex}>
                <em>Husband{count ? ` ${count}` : null},&nbsp;</em>
                { name || "no name recorded."}
            </Title>
        )
    }
}

interface FamilyTreeTreeProps {
    graph?: Graph | null,
}
export default function FamilyTreeEntryTree(props: FamilyTreeTreeProps) {
    const [state, setState] = useState<Tree>();

    useEffect(()=>{
        if (props.graph?.tree) {
            setState(props.graph.tree);
        } else {
            setState(undefined);
        }
    }, [props.graph]);

    return (
        <Box miw="800px" style={{overflowX: "scroll"}}>
            {
                state?.map((node)=><PersonNode node={node} key={node.identity} mb="xl" />)
            }
        </Box>
    )
}