import { Button, Flex, Textarea } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { RootState } from "../../store";
import { setTextEntry, setErrorMessage, setGraph, reset, } from "./slice";
import parseFamilyTreeEntry from "./parse-family-tree-entry.ts";
import { Alert } from '@mantine/core';
import ErrorIcon from "../../assets/icons/uicons-thin-straight/fi-ts-octagon-xmark.svg?react"
import UndoIcon from "../../assets/icons/uicons-thin-straight/fi-ts-undo.svg?react"
import { rem } from '@mantine/core';

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

   function resetRequest() {
    dispatch(reset());
   }

    return (<>
         <p>
            Enter your family tree below using the syntax described <NavLink to="users-guide">here</NavLink> and then press the 'Visualise' button.
         </p>
         <Flex direction="column" gap="lg">
            <Textarea autosize onChange={(event)=>dispatch(setTextEntry(event.currentTarget.value))} value={text} />
            
            <Flex
                justify="end"
                gap="md"
            >
                <Button 
                    size="lg" 
                    disabled={!text || !!graph} 
                    onClick={submitRequest}
                >
                    Visualise
                </Button>
                <Button 
                    size="lg" 
                    disabled={!graph} 
                    leftSection={<UndoIcon style={{ width: "fit-content", height: rem(16), fill: "currentColor" }} />}
                    onClick={resetRequest} 
                >
                    Reset
                </Button>
            </Flex>

            { error &&
                <Alert variant="light" color="red" title="Error" icon={<ErrorIcon style={{fill: "var(--mantine-color-red-light-color)"}} />}>
                    { error }
                </Alert>
            }


         </Flex>
    </>)
}