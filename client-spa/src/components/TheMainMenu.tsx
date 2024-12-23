import { Button, Divider, Flex, NavLink } from '@mantine/core';
import TheAdvertisementsSection from './feature:advertisements/TheAdvertisementsSection';

export default function TheMenuMain() {
    return (
            <Flex direction="column" justify="space-between" h="100%" p="sm" styles={{root: {overflowY: "auto"}}}>
                <div>
                    <NavLink label="Scribe ut..." description="Record a lineage here">
                        <NavLink label="Codex" description="Enter a lineage using precise notation" href="/codex" />
                        <NavLink label="Sermo" description="Enter a lineage using everyday words (EXPERIMENTAL)" href="/sermo" />
                    </NavLink>
                    <NavLink label="Atrium Familiarum" description="Discover ancestral lineages" href="/atrium" />
                    <Divider my="sm" />

                    <NavLink label="About Us">
                        <NavLink label="Principia" 
                        description="Our foundations and purpose"
                        href="/about/principia" 
                    />
                        <NavLink label="Auguria" 
                        description="Our vision for the future, including product roadmap, planned features, and more"
                        href="/about/auguria" 
                    />
                    </NavLink>

                    <Button w="100%" mt="sm" color='navy.6'>Support our Work</Button>

                    <Divider my="sm" />

                    <TheAdvertisementsSection />

                </div>

                <div></div>

                <div>
                    <Divider mb="sm" />
                    <NavLink label="Contact Us" href="https://airtable.com/apph4b8oGTIzV49FI/pag2MWYvUqluRA7fD/form" target='_blank' />
                </div>
            </Flex>
    )
}