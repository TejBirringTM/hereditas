import type { ComponentType, PropsWithChildren } from "react";
import { MarkdownHeading } from "./MarkdownHeading";

type ElementType = keyof JSX.IntrinsicElements;

export type RenderComponentMap = Partial<Record<ElementType, ComponentType<PropsWithChildren>>>

export const renderComponentMap : RenderComponentMap = {
    h1: (props) => <MarkdownHeading {...props} order={1} />,
    h2: (props) => <MarkdownHeading {...props} order={2} />,
    h3: (props) => <MarkdownHeading {...props} order={3} />,
    h4: (props) => <MarkdownHeading {...props} order={4} />,
    h5: (props) => <MarkdownHeading {...props} order={5} />,
    h6: (props) => <MarkdownHeading {...props} order={6} />
};

