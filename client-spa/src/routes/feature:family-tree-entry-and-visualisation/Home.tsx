import { Box, Button, Flex, rem, Textarea } from "@mantine/core";
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
import { usePostHog } from "posthog-js/react";
import defaultTheme from "../../assets/themes/default-theme";

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

   const { height: _viewportHeight, width: viewportWidth } = useViewportSize();
   const [svgHeight, setSvgHeight] = useState(0);

   const posthog = usePostHog();

   function updateTextEntry(event: ChangeEvent<HTMLTextAreaElement>) {
        dispatch(setFamilyTreeTextEntry({textEntry: event.currentTarget.value, persistToLocalStorage: false}));
        posthog.capture("set family tree text entry (from user input)");
   }

   function processEntry() {
        dispatch(processFamilyTreeTextEntry({persistTextEntryToLocalStorage: true}));
        posthog.capture("process (parse to graph and tokenise) family tree entry");
   }

   useEffect(()=>{
        if (state === "unknown") {
            posthog.capture("navigate to home page");
            dispatch(initialiseFamilyTreeEntry());
        }
   })

   useEffect(()=>{
    if (graph) {
        setSvgHeight(Math.max(...(graph as Graph).nodes.map((node)=>(node.generation))) * 350);
    }
   }, [graph])

    return (<Box px={{base: rem(10), sm: rem(20)}}>
         <p>
            Enter your family tree below using the syntax described <NavLink to="users-guide">here</NavLink> and then press the 'Visualise' button.
         </p>
         <Flex direction="column" gap="lg">
            <Textarea ref={refTextArea} autosize onChange={updateTextEntry} value={textEntry} disabled={state === "drawn"} fw={500} styles={{input: {fontFamily: defaultTheme.fontFamilyMonospace, fontSize: "1.05rem", lineHeight: 1.35, paddingTop: "0.85rem", paddingBottom: "0.85rem"}}} />
            
            <Flex direction={{base: "column-reverse", sm: "row"}} justify="end" gap="md">
                <ResetMenu />

                {/*  */}
                <ShareModal disabled={state !== "drawn"} />

                {/*  */}
                <Button 
                    size="lg" 
                    disabled={state !== "editing" || textEntry.length === 0} 
                    onClick={processEntry}
                    color="patina.6"
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
    </Box>)
}
