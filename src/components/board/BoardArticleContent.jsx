import Image from "next/image";
import MarkdownPreview from "./MarkdownPreview";

export default function BoardArticleContent({ post }) {
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
      <MarkdownPreview content={post.content} variant="article" />
    </div>
  );
}
