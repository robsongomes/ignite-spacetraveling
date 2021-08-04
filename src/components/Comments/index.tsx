import { useEffect, useRef } from 'react';
import styles from './comments.module.scss';

interface CommentProps {
  url: string;
}

export function Comments({ url }: CommentProps) {
  const commentRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    console.log('Loading script utteranc');
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('id', 'comments');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('repo', 'robsongomes/ignite-spacetraveling');
    script.setAttribute('issue-term', 'url');
    script.setAttribute('theme', 'github-dark');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', 'true');
    commentRef.current.appendChild(script);

    return () => {
      //   document.body.removeChild(document.querySelector('#comments'));
      commentRef.current?.removeChild(commentRef.current.firstChild as Node);
    };
  }, [url]);

  return <div ref={commentRef}></div>;
}
