"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { PostData } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";
import { Media } from "@prisma/client";
import { MessageSquare, Globe, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import Comments from "../comments/Comments";
import Linkify from "../Linkify";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import BookmarkButton from "./BookmarkButton";
import LikeButton from "./LikeButton";
import PostMoreButton from "./PostMoreButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import OpenAI from 'openai';

interface PostProps {
  post: PostData;
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const translateText = async (text: string, targetLang: string): Promise<string> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        { role: "system", content: "You are a helpful assistant that translates text." },
        { role: "user", content: `Translate the following text to ${targetLang}:\n\n${text}` }
      ],
      max_tokens: 30
    });
    return response.choices[0].message.content || "Translation failed";
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error("Translation failed");
  }
};

const askAboutContent = async (content: string, query: string): Promise<string> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        { role: "system", content: "You are a helpful assistant that answers questions about given content." },
        { role: "user", content: `Content: ${content}\n\nQuestion: ${query}` }
      ],
      max_tokens: 20
    });
    return response.choices[0].message.content || "Failed to get an answer";
  } catch (error) {
    console.error("Query error:", error);
    throw new Error("Failed to get an answer");
  }
};

interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
}

function Popover({ trigger, content }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute z-10 w-64 mt-2 bg-white rounded-md shadow-lg"
        >
          {content}
        </div>
      )}
    </div>
  );
}

function ExpandingSearchBar({ onSearch, isLoading }: { onSearch: (query: string) => void, isLoading: boolean }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSearch(query);
    }
  };

  return (
    <div className="relative mt-2">
      <textarea
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask AI about this post..."
        className="w-full p-2 pr-10 border rounded-md resize-none overflow-hidden min-h-[40px] max-h-[200px]"
        rows={1}
      />
      <Button
        onClick={() => onSearch(query)}
        disabled={isLoading}
        className="absolute right-2 top-1/2 transform -translate-y-1/2"
      >
        {isLoading ? <span className="loading loading-spinner loading-sm"></span> : <Search className="h-4 w-4" />}
      </Button>
    </div>
  );
}

export default function Post({ post }: PostProps) {
  const { user } = useSession();
  const [showComments, setShowComments] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLang, setTargetLang] = useState('es');
  const [showAskAI, setShowAskAI] = useState(false);
  const [queryResult, setQueryResult] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  const handleTranslate = async () => {
    if (isTranslating) return;
    setIsTranslating(true);
    try {
      const translated = await translateText(post.content, targetLang);
      setTranslatedContent(translated);
    } catch (error) {
      console.error("Translation failed:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleQuery = async (query: string) => {
    if (isQuerying || !query) return;
    setIsQuerying(true);
    try {
      const result = await askAboutContent(post.content, query);
      setQueryResult(result);
    } catch (error) {
      console.error("Query failed:", error);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <article className="group/post space-y-3 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <UserTooltip user={post.user}>
            <Link href={`/users/${post.user.username}`}>
              <UserAvatar avatarUrl={post.user.avatarUrl} />
            </Link>
          </UserTooltip>
          <div>
            <UserTooltip user={post.user}>
              <Link
                href={`/users/${post.user.username}`}
                className="block font-medium hover:underline"
              >
                {post.user.displayName}
              </Link>
            </UserTooltip>
            <Link
              href={`/posts/${post.id}`}
              className="block text-sm text-muted-foreground hover:underline"
              suppressHydrationWarning
            >
              {formatRelativeDate(post.createdAt)}
            </Link>
          </div>
        </div>
        {post.user.id === user.id && (
          <PostMoreButton
            post={post}
            className="opacity-0 transition-opacity group-hover/post:opacity-100"
          />
        )}
      </div>
      <Linkify>
        <div className="whitespace-pre-line break-words">
          {translatedContent || post.content}
        </div>
      </Linkify>
      <div className="flex flex-wrap items-center gap-2">
        <Popover
          trigger={
            <Button variant="outline" size="sm">
              <Globe className="mr-2 h-4 w-4" />
              Translate
            </Button>
          }
          content={
            <div className="p-2">
              <Input
                type="text"
                placeholder="Target language (e.g., es, fr, de)"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="mb-2"
              />
              <Button onClick={handleTranslate} disabled={isTranslating} className="w-full">
                {isTranslating ? "Translating..." : "Translate"}
              </Button>
            </div>
          }
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAskAI(!showAskAI)}
        >
          <Search className="mr-2 h-4 w-4" />
          Ask AI
        </Button>
      </div>
      {showAskAI && (
        <ExpandingSearchBar onSearch={handleQuery} isLoading={isQuerying} />
      )}
      {queryResult && (
        <div className="mt-2 p-3 bg-secondary rounded-lg">
          <h4 className="font-semibold mb-1">AI Response:</h4>
          <p className="text-sm">{queryResult}</p>
        </div>
      )}
      {!!post.attachments.length && (
        <MediaPreviews attachments={post.attachments} />
      )}
      <hr className="text-muted-foreground" />
      <div className="flex justify-between gap-5">
        <div className="flex items-center gap-5">
          <LikeButton
            postId={post.id}
            initialState={{
              likes: post._count.likes,
              isLikedByUser: post.likes.some((like) => like.userId === user.id),
            }}
          />
          <CommentButton
            post={post}
            onClick={() => setShowComments(!showComments)}
          />
        </div>
        <BookmarkButton
          postId={post.id}
          initialState={{
            isBookmarkedByUser: post.bookmarks.some(
              (bookmark) => bookmark.userId === user.id,
            ),
          }}
        />
      </div>
      {showComments && <Comments post={post} />}
    </article>
  );
}

interface MediaPreviewsProps {
  attachments: Media[];
}

function MediaPreviews({ attachments }: MediaPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2",
      )}
    >
      {attachments.map((m) => (
        <MediaPreview key={m.id} media={m} />
      ))}
    </div>
  );
}

interface MediaPreviewProps {
  media: Media;
}

function MediaPreview({ media }: MediaPreviewProps) {
  if (media.type === "IMAGE") {
    return (
      <Image
        src={media.url}
        alt="Attachment"
        width={500}
        height={500}
        className="mx-auto size-fit max-h-[30rem] rounded-2xl"
      />
    );
  }

  if (media.type === "VIDEO") {
    return (
      <div>
        <video
          src={media.url}
          controls
          className="mx-auto size-fit max-h-[30rem] rounded-2xl"
        />
      </div>
    );
  }

  return <p className="text-destructive">Unsupported media type</p>;
}

interface CommentButtonProps {
  post: PostData;
  onClick: () => void;
}

function CommentButton({ post, onClick }: CommentButtonProps) {
  return (
    <button onClick={onClick} className="flex items-center gap-2">
      <MessageSquare className="size-5" />
      <span className="text-sm font-medium tabular-nums">
        {post._count.comments}{" "}
        <span className="hidden sm:inline">comments</span>
      </span>
    </button>
  );
}