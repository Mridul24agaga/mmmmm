import TrendsSidebar from "@/components/TrendsSidebar";
import { Metadata } from "next";
import Memories from "./Memories";

export const metadata: Metadata = {
  title: "Memories",
};

export default function Page() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h1 className="text-center text-2xl font-bold">Memories</h1>
        </div>
        <Memories />
      </div>
    </main>
  );
}
