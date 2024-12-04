import { Flex } from "@mantine/core";
import EmptyAdvertisementSquare from "./EmptyAdvertisementSquare";

export default function TheAdvertisementsSection() {
    return (
        <Flex direction="column" gap="xl" my="xl">
            <EmptyAdvertisementSquare />
            <EmptyAdvertisementSquare />
            <EmptyAdvertisementSquare />
        </Flex>
    )
}