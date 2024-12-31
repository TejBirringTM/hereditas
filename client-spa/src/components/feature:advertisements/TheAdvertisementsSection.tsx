import { Flex } from "@mantine/core";
import EmptyAdvertisementSlot from "./EmptyAdvertisementSlot";

export default function TheAdvertisementsSection() {
    return (
        <Flex direction="column" gap="md" my="lg" opacity={0.65}>
            <EmptyAdvertisementSlot slotNumber={1} />
            <EmptyAdvertisementSlot slotNumber={2} />
            <EmptyAdvertisementSlot slotNumber={3} />
        </Flex>
    )
}
