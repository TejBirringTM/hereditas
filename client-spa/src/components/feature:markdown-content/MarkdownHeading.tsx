import { Title, type TitleOrder } from "@mantine/core";

interface MarkdownHeadingProps {
    children?: React.ReactNode,
    order: TitleOrder
}

export function MarkdownHeading(props: MarkdownHeadingProps) {
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