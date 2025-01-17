import { Button, Divider, Flex, NavLink } from '@mantine/core';
import TheAdvertisementsSection from './feature:advertisements/TheAdvertisementsSection';
import { useLocation, matchPath } from 'react-router-dom';
import useWindowOpener from '../libs/window-opener';

export default function TheMenuMain() {
    const location = useLocation();
    const windowOpener = useWindowOpener();

    return (
            <Flex direction="column" justify="space-between" h="100%" p="sm" styles={{root: {overflowY: "auto"}}}>
                <div>
                    <NavLink label="Scribe ut..." description="Record a lineage here" active={!!matchPath("/codex", location.pathname) || !!matchPath("/sermo", location.pathname)} >
                        <NavLink label="Codex" description="Enter a lineage using precise notation" href="/codex" active={!!matchPath("/codex/*", location.pathname)} />
                        <NavLink label="Sermo" description="Enter a lineage using everyday words (EXPERIMENTAL)" href="/sermo" active={!!matchPath("/sermo/*", location.pathname)} />
                    </NavLink>
                    <NavLink label="Atrium Familiarum" description="Discover ancestral lineages" href="/atrium" active={!!matchPath("/atrium/*", location.pathname)} />
                    <Divider my="sm" />

                    <NavLink label="About Us" active={!!matchPath("/about/*", location.pathname)} >
                        <NavLink label="Principia" 
                        description="Our foundations and purpose"
                        href="/about/principia" 
                        active={!!matchPath("/about/principia", location.pathname)} 
                    />
                        <NavLink label="Auguria" 
                        description="Our vision for the future, including product roadmap, planned features, and more"
                        href="/about/auguria" 
                        active={!!matchPath("/about/auguria", location.pathname)} 
                    />
                    </NavLink>

                    <Button w="100%" mt="sm" color='navy.6' onClick={()=>windowOpener.openSecureWindow("https://buy.stripe.com/28o9BJ6Y15XT36wbIL")}>Support our Work</Button>

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
