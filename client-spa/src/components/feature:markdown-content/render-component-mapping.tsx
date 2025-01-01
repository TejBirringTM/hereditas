import { Title, TitleOrder } from "@mantine/core";
import { ComponentType, PropsWithChildren } from "react";

type ElementType = keyof JSX.IntrinsicElements;

type RenderComponentMap = {
    [K in ElementType]?: ComponentType<PropsWithChildren<{}>>
}

interface MarkdownHeadingProps {
    children?: React.ReactNode,
    order: TitleOrder
}

function MarkdownHeading(props: MarkdownHeadingProps) {
    const children = props.children;
    const anchor = typeof children === 'string'
    ? children.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    : '';
    return <Title order={props.order} id={anchor}>
        { props.order > 1 && 
            // <Anchor href={`#${anchor}`} c="softer-warm.5" size="xl" mr="0.33rem">#</Anchor>
            <a href={`#${anchor}`} style={{color: "var(--mantine-color-neutral-4)", marginRight: "0.33rem"}}>#</a>
        }
        {children}
    </Title>
}

export const renderComponentMap : RenderComponentMap = {
    h1: (props) => <MarkdownHeading {...props} order={1} />,
    h2: (props) => <MarkdownHeading {...props} order={2} />,
    h3: (props) => <MarkdownHeading {...props} order={3} />,
    h4: (props) => <MarkdownHeading {...props} order={4} />,
    h5: (props) => <MarkdownHeading {...props} order={5} />,
    h6: (props) => <MarkdownHeading {...props} order={6} />
};

