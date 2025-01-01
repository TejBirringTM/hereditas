import React from 'react';
import styles from "./MarkdownPageLayout.module.css";

interface MarkdownContentProps {
    children?: React.ReactNode
}

export default function MarkdownPageLayout({children}: MarkdownContentProps) {
    return <div className={styles['markdown-pg-content']}>
        {children}
    </div>;
}
