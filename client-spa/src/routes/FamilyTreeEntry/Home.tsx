import { Button, Flex, Textarea } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { RootState } from "../../store";
import { setTextEntry, setErrorMessage, setGraph, reset, recoverTextEntry } from "./slice";
import parseFamilyTreeEntry, { Graph } from "./libs/parse-family-tree-entry";
import { Alert } from '@mantine/core';
import ErrorIcon from "../../assets/icons/uicons-thin-straight/fi-ts-octagon-xmark.svg?react"
import UndoIcon from "../../assets/icons/uicons-thin-straight/fi-ts-undo.svg?react"
import { rem } from '@mantine/core';
import FamilyTreeEntryGraph from "./components/FamilyTreeGraph";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useViewportSize } from "@mantine/hooks";

export default function Home() {
   const dispatch = useDispatch();

   const text = useSelector((state: RootState)=>{
      return state.familyTreeEntry.textEntry;
   });

   const error = useSelector((state: RootState)=>{
    return state.familyTreeEntry.errorMessage;
   });

   const graph = useSelector((state: RootState)=>{
    return state.familyTreeEntry.graph;
   });

   async function submitRequest() {
       try {
           const graph = await parseFamilyTreeEntry(text);
           dispatch(setErrorMessage(""));
           dispatch(setGraph(graph));
       } catch (e) {
           if (e instanceof Error) {
            dispatch(setErrorMessage(e.message));
           }
       }
   }

   const refTextArea = useRef<HTMLTextAreaElement>(null);
   function resetRequest() {
        dispatch(reset());
        refTextArea.current?.scrollTo();
   }

   function updateText(event: ChangeEvent<HTMLTextAreaElement>) {
        dispatch(setTextEntry(event.currentTarget.value));
   }

   const { height: viewportHeight, width: viewportWidth } = useViewportSize();

   const [svgHeight, setSvgHeight] = useState(0);

   dispatch(recoverTextEntry());

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
            <Textarea ref={refTextArea} autosize onChange={updateText} value={text} readOnly={!!graph} />

            <Flex
                justify="end"
                gap="md"
            >
                {/*  */}
                <Button 
                    size="lg" 
                    disabled={!graph} 
                    leftSection={<UndoIcon style={{ width: "fit-content", height: rem(16), fill: "currentColor"}} />}
                    onClick={resetRequest} 
                >
                    Reset
                </Button>
                {/*  */}
                <Button 
                    size="lg" 
                    disabled={!text || !!graph} 
                    onClick={submitRequest}
                >
                    Visualise
                </Button>
            </Flex>

            { error &&
                <Alert variant="light" color="red" title="Error" icon={<ErrorIcon style={{fill: "var(--mantine-color-red-light-color)"}} />}>
                    { error }
                </Alert>
            }

            <FamilyTreeEntryGraph graph={graph} width={viewportWidth} height={svgHeight} />
         </Flex>
    </>)
}