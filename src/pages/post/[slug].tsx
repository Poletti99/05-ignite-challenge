import { format } from 'date-fns';
import Prismic from '@prismicio/client';
import pt from 'date-fns/locale/pt';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../../services/prismic';
// import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { Comments } from '../../components/Comments';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | Ignews</title>
      </Head>

      <main className={styles.container}>
        <img src={post.data.banner.url} alt="Aoba" />

        <article className={styles.content}>
          <header>
            <h1>{post.data.title}</h1>
            <div className={styles.postInfo}>
              <div>
                <FiCalendar size={20} />
                <time>
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    { locale: pt }
                  )}
                </time>
              </div>

              <div>
                <FiUser size={20} />
                <p>{post.data.author}</p>
              </div>

              <div>
                <FiCalendar size={20} />
                <p>4 min</p>
              </div>
            </div>
          </header>

          {post.data.content.map(content => (
            <div key={content.heading} className={styles.postContent}>
              <h2>{content.heading}</h2>

              <div
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </div>
          ))}
        </article>

        <Comments id="comments-container" />
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts')
  );

  return {
    paths: posts.results.map(post => ({ params: { slug: post.uid } })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const postData = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: postData.uid,
    first_publication_date: postData.first_publication_date,
    data: {
      title: postData.data.title,
      subtitle: postData.data.subtitle,
      banner: { url: postData.data.banner.url },
      author: postData.data.author,
      content: postData.data.content.map(content => {
        return {
          heading: content.heading,
          body: content.body,
        };
      }),
    },
  };

  return {
    props: { post },
    redirect: 60 * 30, //30 minutes
  };
};
