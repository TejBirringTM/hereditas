import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
import { Flex } from '@mantine/core';
import { AppShell, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet } from "react-router-dom";
import TheHeaderLogo from '../components/TheHeaderLogo';
import TheMenuMain from '../components/TheMainMenu';

export default function Root() {
    const [menuOpened, { toggle: toggleMenu }] = useDisclosure();

    return (
        <AppShell
          header={{ height: 60 }}
          navbar={{
            width: 300,
            breakpoint: 'sm',
            collapsed: { mobile: !menuOpened },
          }}
          padding="md"
        >
          <AppShell.Header
            px="md"
            py="xs"
            display="flex"
          >
            <Flex justify="start" align="center">
              <Burger
                opened={menuOpened}
                onClick={toggleMenu}
                hiddenFrom="sm"
                size="sm"
                mr="xs"
              />
                <TheHeaderLogo />
            </Flex>
            
          </AppShell.Header>
  
          <AppShell.Navbar>
            <TheMenuMain />
          </AppShell.Navbar>
  
          <AppShell.Main>
            <Outlet />
          </AppShell.Main>
        </AppShell>
    )
}