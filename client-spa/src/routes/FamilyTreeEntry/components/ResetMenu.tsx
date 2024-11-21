import { Button, Menu, rem } from "@mantine/core";
import UndoIcon from "../../../assets/icons/uicons-thin-straight/fi-ts-undo.svg?react"
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { resetFamilyTreeEntry } from "../slice";

export default function ResetMenu() {
    const dispatch = useDispatch();
 
    const familyTreeTextEntry = useSelector((state: RootState)=>{
       return state.familyTreeEntry.textEntry;
    });
 
    const state = useSelector((state: RootState)=>{
     return state.familyTreeEntry.state;
    });
 
    function resetVisualisationOnly() {
        dispatch(resetFamilyTreeEntry({clearTextEntry: false}))
    }

    function resetEverything() {
        dispatch(resetFamilyTreeEntry({clearTextEntry: true}));
    }

    return (
        <Menu shadow="md" width={230}>
        <Menu.Target>
            <Button 
                size="lg" 
                disabled={familyTreeTextEntry.length === 0}
                leftSection={<UndoIcon style={{ width: "fit-content", height: rem(16), fill: "currentColor"}} />} 
            >
                Reset
            </Button>
        </Menu.Target>
  
        <Menu.Dropdown>
          <Menu.Item disabled={state !== "drawn"} onClick={resetVisualisationOnly}>
            Visualisation only (keep entry)
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item disabled={familyTreeTextEntry.length === 0} onClick={resetEverything}>
            Everything (start afresh)
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    )
}
