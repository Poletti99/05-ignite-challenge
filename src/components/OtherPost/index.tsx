import Link, { LinkProps } from 'next/link';
import styles from './otherPost.module.scss';

interface OtherPostProps extends Omit<LinkProps, 'href'> {
  post: {
    uid: string;
    title: string;
  };
  orientation: 'left' | 'right';
}

export function OtherPost({ post, orientation, ...rest }: OtherPostProps) {
  if (!post) {
    return null;
  }

  return (
    <Link href={`/post/${post.uid}`} {...rest}>
      <a
        className={`${styles.otherPost} ${
          orientation === 'left' ? styles.left : styles.right
        }`}
      >
        <p>{post.title}</p>
        <strong>
          {orientation === 'left' ? 'Post anterior' : 'Próximo post'}
        </strong>
      </a>
    </Link>
  );
}
