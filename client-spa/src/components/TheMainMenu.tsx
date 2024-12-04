import { Button, Divider, Flex, NavLink } from '@mantine/core';
import TheAdvertisementsSection from './feature:advertisements/TheAdvertisementsSection';

export default function TheMenuMain() {
    return (
            <Flex direction="column" justify="space-between" h="100%" p="sm" styles={{root: {overflowY: "auto"}}}>
                <div>
                    <NavLink label="The Atelier (Home)" href="/" />
                    <NavLink label="User's Guide" href="/users-guide" />

                    <Divider my="sm" />

                    <NavLink label="About">
                        <NavLink label="What is Tapestry•Family?" href="/about/what-is-tapestry•family" />
                        <NavLink label="Our Mission" href="/about/our-mission" />
                        <NavLink label="Our Story" href="/about/our-story" />
                        <NavLink label="Product Roadmap" href="/about/product-roadmap" />
                    </NavLink>

                    <Button w="100%" mt="sm" color='navy.6'>Become a Patron</Button>

                    <Divider my="sm" />

                    <TheAdvertisementsSection />

                </div>

                <div></div>

                <div>
                    <Divider mb="sm" />
                    <NavLink label="Contact Us" />
                </div>
            </Flex>
    )
}