import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { ArrowLeft, Clock, MapPin } from 'lucide-react';
import { PostCard, categoryLabel, formatPostDate } from './BlogPage.jsx';

const shimmer =
  'animate-shimmer bg-[linear-gradient(90deg,#0f172a_25%,#1e293b_50%,#0f172a_75%)] bg-size-[200%_100%]';

const EASE = [0.22, 1, 0.36, 1];

const stagger = (gap = 0.1, delayChildren = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren: gap, delayChildren } },
});

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

function ReadingProgress({ targetRef }) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end'],
  });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-60 h-1 origin-left bg-amber-400"
      aria-hidden="true"
    />
  );
}

function CoverImage({ src }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  // Image drifts slower than the page; it is scaled up so edges never show.
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: EASE }}
      className="h-72 overflow-hidden rounded-3xl bg-slate-900 sm:h-96"
    >
      <motion.img
        src={src}
        alt=""
        style={{ y, scale: 1.2 }}
        className="h-full w-full object-cover"
      />
    </motion.div>
  );
}

function Paragraph({ children }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      {children}
    </motion.p>
  );
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const articleRef = useRef(null);
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setNotFound(false);
    axios
      .get(`/api/v1/blogs/${slug}`, { signal: controller.signal })
      .then((res) => {
        setPost(res.data.data.post);
        setRelated(res.data.data.related || []);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) setNotFound(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [slug]);

  const isMissing = notFound || !post;
  const paragraphs = post ? post.content.split(/\n{2,}/).filter(Boolean) : [];
  const minutes = post
    ? Math.max(1, Math.round(post.content.split(/\s+/).length / 200))
    : 0;

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false}>
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mx-auto max-w-3xl px-4 pt-10"
          >
            <div className={`h-72 rounded-3xl ${shimmer}`} />
            <div className={`mt-8 h-12 w-3/4 rounded-xl ${shimmer}`} />
            <div className={`mt-4 h-40 rounded-xl ${shimmer}`} />
          </motion.div>
        )}

        {!loading && isMissing && (
          <motion.div
            key="not-found"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="mx-auto flex max-w-md flex-col items-center px-6 py-32 text-center"
          >
            <h1 className="font-display text-3xl">Story not found</h1>
            <p className="mt-3 text-white/60">
              It may have been removed, or the link is wrong.
            </p>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/blog"
                className="mt-8 inline-block rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400"
              >
                Back to all stories
              </Link>
            </motion.div>
          </motion.div>
        )}

        {!loading && !isMissing && (
          <motion.div
            key={post._id}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mx-auto max-w-3xl px-4 pb-24 pt-10 md:px-8"
          >
            <ReadingProgress targetRef={articleRef} />

            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <Link
                to="/blog"
                className="group inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                All stories
              </Link>
            </motion.div>

            <article ref={articleRef} className="mt-6">
              {post.coverImage && <CoverImage src={post.coverImage} />}

              <motion.div
                variants={stagger(0.1, 0.25)}
                initial="hidden"
                animate="visible"
              >
                <motion.p
                  variants={fadeUp}
                  className="mt-8 text-sm capitalize text-amber-300"
                >
                  {categoryLabel(post.category)}
                </motion.p>
                <motion.h1
                  variants={fadeUp}
                  className="mt-2 font-display text-4xl leading-tight sm:text-5xl"
                >
                  {post.title}
                </motion.h1>

                <motion.div
                  variants={fadeUp}
                  className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/55"
                >
                  <span>
                    {post.author?.fullName ||
                      post.author?.username ||
                      'Drimora'}{' '}
                    · {formatPostDate(post.publishedAt)}
                  </span>
                  {post.destination && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-amber-400" />
                      {post.destination}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-amber-400" />
                    {minutes} min read
                  </span>
                </motion.div>
              </motion.div>

              <div className="mt-10 space-y-6 text-lg leading-relaxed text-white/80">
                {paragraphs.map((p, i) => (
                  <Paragraph key={i}>{p}</Paragraph>
                ))}
              </div>
            </article>

            {related.length > 0 && (
              <section className="mt-20">
                <motion.h2
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.8 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="font-display text-2xl"
                >
                  More like this
                </motion.h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  {related.slice(0, 2).map((r, i) => (
                    <PostCard key={r._id} post={r} index={i} standalone />
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
