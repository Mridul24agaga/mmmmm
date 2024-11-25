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
          I&apos;d like to welcome everyone to MemoriesLived.com! I created this site as a modern way to celebrate and share the lives of people we&apos;ve cared about and lost.
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

