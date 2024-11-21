import { Button, Flex, Textarea } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { AppDispatch, RootState } from "../../store";
import { setFamilyTreeTextEntry, processFamilyTreeTextEntry, initialiseFamilyTreeEntry} from "./slice";
import { Graph } from "./libs/parse-family-tree-entry";
import { Alert } from '@mantine/core';
import ErrorIcon from "../../assets/icons/uicons-thin-straight/fi-ts-octagon-xmark.svg?react"
import FamilyTreeEntryGraph from "./components/FamilyTreeGraph";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useViewportSize } from "@mantine/hooks";
import ShareModal from "./components/ShareModal";
import ResetMenu from "./components/ResetMenu";

export default function Home() {
   const dispatch = useDispatch<AppDispatch>();

   const textEntry = useSelector((state: RootState)=>{
      return state.familyTreeEntry.textEntry;
   });

   const graph = useSelector((state: RootState)=>{
    return state.familyTreeEntry.graph;
   });

   const state = useSelector((state: RootState)=>{
    return state.familyTreeEntry.state;
   });

   const errorMessage = useSelector((state: RootState)=>{
    return state.familyTreeEntry.errorMessage;
   });

   const refTextArea = useRef<HTMLTextAreaElement>(null);

   const { height: viewportHeight, width: viewportWidth } = useViewportSize();
   const [svgHeight, setSvgHeight] = useState(0);

   function updateTextEntry(event: ChangeEvent<HTMLTextAreaElement>) {
        dispatch(setFamilyTreeTextEntry({textEntry: event.currentTarget.value, persistToLocalStorage: false}));
   }

   useEffect(()=>{
        if (state === "unknown") {
            dispatch(initialiseFamilyTreeEntry());
        }
   })

   useEffect(()=>{
    if (graph) {
        setSvgHeight(Math.max(...(graph as Graph).nodes.map((node)=>(node.generation))) * 350);
    }
   }, [graph])

    return (<>
         <p>
            Enter your family tree below using the syntax described <NavLink to="users-guide">here</NavLink> and then press the 'Visualise' button.
         </p>
         <Flex direction="column" gap="lg">
            <Textarea ref={refTextArea} autosize onChange={updateTextEntry} value={textEntry} disabled={state === "drawn"} />

            <Flex justify="end" gap="md">
                <ResetMenu />

                {/*  */}
                <ShareModal disabled={state !== "drawn"} />

                {/*  */}
                <Button 
                    size="lg" 
                    disabled={state !== "editing" || textEntry.length === 0} 
                    onClick={()=>dispatch(processFamilyTreeTextEntry({persistTextEntryToLocalStorage: true}))}
                >
                    Visualise
                </Button>
            </Flex>

            { state === "error" &&
                <Alert variant="light" color="red" title="Error" icon={<ErrorIcon style={{fill: "var(--mantine-color-red-light-color)"}} />}>
                    { errorMessage }
                </Alert>
            }

            <FamilyTreeEntryGraph graph={graph} width={viewportWidth} height={svgHeight} />
         </Flex>
    </>)
}
