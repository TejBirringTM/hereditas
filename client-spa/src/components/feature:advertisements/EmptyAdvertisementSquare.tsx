import { Anchor, Flex, Paper } from "@mantine/core";
import { GOLDEN_RATIO } from "../../libs/constants";
import { useResizeObserver } from '@mantine/hooks';

export default function EmptyAdvertisementSquare() {
    const [ref, rect] = useResizeObserver();

    return <Paper ref={ref} bg="neutral.1" c="softer-warm.9" shadow="xs" h={{base: rect.width/(2*GOLDEN_RATIO)}} >
        <Flex direction="column" align="center" h="100%" justify="center">
            <Anchor size="xs" fw="bold" c="inherit" href="#" p="sm">Advertise Here</Anchor>
        </Flex>
    </Paper>
}