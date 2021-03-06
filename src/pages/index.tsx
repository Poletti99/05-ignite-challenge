import pt from 'date-fns/locale/pt';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import next, { GetStaticProps } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';
import styles from './home.module.scss';
import ExitPreviewButton from '../components/ExitPreviewButton';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  function handleLoadMorePosts(nextPageUrl: string): void {
    fetch(nextPageUrl)
      .then(response => response.json())
      .then(response => {
        setNextPage(response.next_page);
        setPosts(lastPosts => [
          ...lastPosts,
          ...response.results.map(post => ({
            uid: post.uid || '',
            first_publication_date: format(
              new Date(post.first_publication_date),
              'dd MMM yyyy'
            ),
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          })),
        ]);
      });
  }

  return (
    <>
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div>
                  <time>
                    <FiCalendar size={20} />
                    <span>
                      {format(
                        new Date(post.first_publication_date),
                        'dd MMM yyyy',
                        { locale: pt }
                      )}
                    </span>
                  </time>
                  <p>
                    <FiUser size={20} />
                    <span>{post.data.author}</span>
                  </p>
                </div>
              </a>
            </Link>
          ))}
        </div>
        {nextPage && (
          <button type="button" onClick={() => handleLoadMorePosts(nextPage)}>
            Carregar mais posts
          </button>
        )}

        {preview && (
          <aside>
            <ExitPreviewButton>Sair do modo preview</ExitPreviewButton>
          </aside>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      ref: previewData?.ref ?? null,
    }
  );

  const posts: Post[] = postsResponse.results.map(post => ({
    uid: post.uid || '',
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  }));

  // TODO
  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: postsResponse.next_page,
      },
      preview,
    },
  };
};
