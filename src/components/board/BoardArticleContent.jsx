import Image from "next/image";
import MarkdownPreview from "./MarkdownPreview";

export default function BoardArticleContent({ post }) {
  // DB에 /histories?inspectionId=96 형태로 저장된 텍스트를 /histories/96 으로 자동 치환
  const fixedContent = post?.content?.replace(
    /\/histories\?inspectionId=(\d+)/g,
    "/histories/$1",
  );

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
      <MarkdownPreview
        content={fixedContent || post?.content}
        variant="article"
      />
    </div>
  );
}
