import Image from "next/image";
import MarkdownPreview from "./MarkdownPreview";
import { sanitizeBoardDraft } from "./sanitizeBoardDraft";

export default function BoardArticleContent({ post }) {
  const safePost = sanitizeBoardDraft(post);
  return (
    <div className="board-article-content">
      {post.thumbnailUrl && (
        <div className="article-thumbnail">
          <Image
            src={post.thumbnailUrl}
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 820px"
          />
        </div>
      )}
      <MarkdownPreview content={safePost.content} variant="article" />
    </div>
  );
}
