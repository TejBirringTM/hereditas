import { Flex } from "@mantine/core";
import EmptyAdvertisementSquare from "./EmptyAdvertisementSquare";

export default function TheAdvertisementsSection() {
    return (
        <Flex direction="column" gap="md" my="lg" opacity={0.65}>
            <EmptyAdvertisementSquare />
            <EmptyAdvertisementSquare />
            <EmptyAdvertisementSquare />
        </Flex>
    )
}
