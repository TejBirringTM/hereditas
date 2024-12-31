import { Anchor, Flex, Paper } from "@mantine/core";
import { GOLDEN_RATIO } from "../../libs/constants";
import { useResizeObserver } from '@mantine/hooks';

interface AdvertisementSlotProps {
    slotNumber: number
}

export default function EmptyAdvertisementSlot({slotNumber}: AdvertisementSlotProps) {
    const [ref, rect] = useResizeObserver();

    return <Paper ref={ref} bg="neutral.1" c="softer-warm.9" h={{base: rect.width/(2*GOLDEN_RATIO)}} radius={0} >
        <Flex direction="column" align="center" h="100%" justify="center">
            <Anchor size="xs" fw="bold" c="inherit" href={`/advertise/slot/${slotNumber}`} p="sm">Advertise Here</Anchor>
        </Flex>
    </Paper>
}
