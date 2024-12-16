import { useEffect } from 'react';
import { useRemark } from 'react-remark';
import styles from "./MarkdownContent.module.css";

interface MarkdownContentProps {
    content: string | Promise<{default: string}>
}

export default function MarkdownContent({content}: MarkdownContentProps) {
    const [reactContent, setMarkdownSource] = useRemark();
      
    useEffect(() => {
      if (typeof content === "string") {
        setMarkdownSource(content);
      } else {
        content.then(({default: _content})=>{
            setMarkdownSource(_content);
        });
      }
    }, [content, setMarkdownSource]);
  
    return <div className={styles['markdown-content']}>
        {reactContent}
    </div>;
}
