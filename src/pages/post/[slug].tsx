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
import ExitPreviewButton from '../../components/ExitPreviewButton';
import Link from 'next/link';
import { OtherPost } from '../../components/OtherPost';

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

interface AnotherPosts {
  title: string;
  uid: string;
}

interface PostProps {
  post: Post;
  preview: boolean;
  prevPost: AnotherPosts;
  nextPost: AnotherPosts;
}

export default function Post({ post, preview, nextPost, prevPost }: PostProps) {
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

          <hr />
        </article>
        <div className={styles.otherPosts}>
          <OtherPost post={prevPost} orientation="left" />
          <OtherPost post={nextPost} orientation="right" />
        </div>

        <Comments id="comments-container" />

        {preview && <ExitPreviewButton>Sair do modo preview</ExitPreviewButton>}
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

export const getStaticProps: GetStaticProps<PostProps> = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const postData = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const nextPostData = (
    await prismic.query(Prismic.predicates.at('document.type', 'posts'), {
      pageSize: 1,
      after: `${postData.id}`,
      orderings: '[document.first_publication_date]',
    })
  ).results[0];

  const prevPostData = (
    await prismic.query(Prismic.predicates.at('document.type', 'posts'), {
      pageSize: 1,
      after: `${postData.id}`,
      orderings: '[document.first_publication_date desc]',
    })
  ).results[0];

  const prevPost = prevPostData
    ? {
        title: prevPostData.data.title,
        uid: prevPostData.uid,
      }
    : null;

  const nextPost = nextPostData
    ? {
        title: nextPostData.data.title,
        uid: nextPostData.uid,
      }
    : null;

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
    props: { post, preview, prevPost, nextPost },
    redirect: 60 * 30, //30 minutes
  };
};
