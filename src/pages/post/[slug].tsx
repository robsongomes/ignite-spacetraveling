import {
  GetStaticPaths,
  GetStaticPathsContext,
  GetStaticProps,
  GetStaticPropsContext,
} from 'next';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import PrismicDOM from 'prismic-dom';

import { getPrismicClient } from '../../services/prismic';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { locale } from 'yargs';

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
  const [readingTime, setReadingTime] = useState(0);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!router.isFallback) {
      let body = [];
      const words = post.data.content
        .map(value => {
          body = [
            ...body,
            `<h1>${value.heading}</h1>` +
              PrismicDOM.RichText.asHtml(value.body),
          ];

          return (
            value.heading.split(' ').length +
            PrismicDOM.RichText.asText(value.body).split(' ').length
          );
        })
        .reduce((acc, curr) => acc + curr);

      setContent(body.join(''));

      setReadingTime(Math.ceil(words / 200));
    }
  }, [post]);

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <main className={styles.container}>
        <img src={post.data.banner.url} alt="banner" />
        <article className={styles.posts}>
          <h1>{post.data.title}</h1>
          <div className={styles.info}>
            <p className={styles.publicationDate}>
              <FiCalendar />
              <span>
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </span>
            </p>
            <p className={styles.author}>
              <FiUser />
              <span>{post.data.author}</span>
            </p>
            <p className={styles.readingTime}>
              <FiClock />
              <span>{`${readingTime} min`}</span>
            </p>
          </div>
          <section
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    { pageSize: 2 }
  );

  const postsPaths = postsResponse.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    paths: postsPaths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async (
  context: GetStaticPropsContext
) => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: response.data.banner,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 30,
  };
};
