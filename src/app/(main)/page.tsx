import Image from 'next/image';
import PostEditor from "@/components/posts/editor/PostEditor";
import TrendsSidebar from "@/components/TrendsSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FollowingFeed from "./FollowingFeed";
import ForYouFeed from "./ForYouFeed";
import Chris from "@/assets/chris.jpg";

function WelcomeMessage() {
  return (
    <div className="bg-yellow-100 p-4 rounded-lg mb-4 flex items-center space-x-4">
      <Image
        src={Chris}
        alt="Avatar"
        width={50}
        height={50}
        className="rounded-full"
      />
      <div>
        <h2 className="font-bold text-lg">Welcome to MemoriesLived.com!</h2>
        <p className="text-sm">
          Welcome to MemoriesLived.com
          This idea came to me after my father-in-law, Larry Knoll, was cremated, leaving us no physical place to remember him. Combined with my family being buried too far away to visit, I wanted to create a thoughtful space where anyone could grieve, laugh, love, and celebrate those they have lost—anytime, anywhere.
          I encourage you to create a Memorial Page, add Memories pictures and stories, and follow others. You can also take advantage of topic-based public Forums, write directly to another user with Messages, exchange personally with a self-designed Virtual Companion, or convert to Diary mode to record private thoughts and feelings.
          I hope this site brings you comfort in your time of loss.
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <PostEditor />
        <Tabs defaultValue="for-you">
          <TabsList>
            <TabsTrigger value="for-you">For you</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          <TabsContent value="for-you">
            <WelcomeMessage />
            <ForYouFeed />
          </TabsContent>
          <TabsContent value="following">
            <WelcomeMessage />
            <FollowingFeed />
          </TabsContent>
        </Tabs>
      </div>
      <TrendsSidebar />
    </main>
  );
}

