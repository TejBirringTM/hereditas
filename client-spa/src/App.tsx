import '@mantine/core/styles.css';
import { Flex, MantineProvider } from '@mantine/core';
import { AppShell, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export default function App() {
  const [menuOpened, { toggle: toggleMenu }] = useDisclosure();

  return (
    <MantineProvider>
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
            <div>
              Family Tree Visualiser
            </div>
          </Flex>
          
        </AppShell.Header>

        <AppShell.Navbar p="md">Navbar</AppShell.Navbar>

        <AppShell.Main>Main</AppShell.Main>
      </AppShell>
    </MantineProvider>
  )
}
