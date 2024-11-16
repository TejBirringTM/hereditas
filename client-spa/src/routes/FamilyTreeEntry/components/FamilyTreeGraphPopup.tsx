import { Text } from "@mantine/core";
import { Node } from "../libs/parse-family-tree-entry";
import styles from "./FamilyTreeGraph.module.css"
import appendOrdinalSuffix from "../../../libs/append-ordinal-suffix";

interface FamilyTreeGraphPopupProps {
    node?: Node | null,
    top?: number | null,
    left?: number | null,
}

export default function FamilyTreeGraphPopup({node, top, left}: FamilyTreeGraphPopupProps) {
    if (!node || !top || !left) {
        return null;
    } else {
        const generation = node.generation;
        const numOfMarriages = node.numOfMarriages ?? 0;
        const numOfChildren = node.numOfChildren ?? 0;
        const numOfAdoptedHeirs = node.numOfAdoptedHeirs ?? 0;
        return <div
            className={styles.popup}
            style={{top, left}}
        >
            <Text fz="lg" fw="bold">{node.title}</Text>
            
            {
                (generation && (node.type === "Male")) && 
                <Text>{appendOrdinalSuffix(node.generation)} generation of clan, as recorded.</Text>
            }

            {
                (numOfMarriages === 1) ?
                    <Text>Married.</Text> :
                (numOfMarriages > 1) ? 
                    <Text>{numOfMarriages} marriages.</Text> :
                    <Text>Unmarried or no marriage(s) recorded.</Text>
            }

            {
                (numOfChildren === 1) ?
                    <Text>1 child recorded.</Text> : 
                (numOfChildren > 1) ?
                    <Text>{numOfChildren} children recorded.</Text> :
                (numOfMarriages > 0) ?
                    <Text>No children recorded.</Text> :
                    null
            }

            {
                (numOfAdoptedHeirs === 1) ?
                    <Text>1 heir by adoption <em>(mutabannā)</em>.</Text> : 
                (numOfAdoptedHeirs > 1) ?
                    <Text>{numOfChildren} heirs by adoption <em>(mutabannā)</em>.</Text> :
                    null
            }
        </div>
    }
}
