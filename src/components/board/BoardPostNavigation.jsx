import Link from "next/link";

function PostLink({ post, direction }) {
  if (!post)
    return <div className="post-navigation-card is-empty" aria-hidden="true" />;
  const isPrevious = direction === "previous";
  return (
    <Link className="post-navigation-card" href={`/boards/${post.id}`}>
      <span>{isPrevious ? "이전 글" : "다음 글"}</span>
      <strong>
        {isPrevious ? "← " : ""}
        {post.title}
        {isPrevious ? "" : " →"}
      </strong>
    </Link>
  );
}

export default function BoardPostNavigation({ previousPost, nextPost }) {
  if (!previousPost && !nextPost) return null;
  return (
    <nav className="post-navigation" aria-label="이전 글과 다음 글">
      <PostLink post={previousPost} direction="previous" />
      <PostLink post={nextPost} direction="next" />
    </nav>
  );
}
