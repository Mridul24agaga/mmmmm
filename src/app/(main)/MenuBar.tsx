import { validateRequest } from "@/auth";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { Bookmark, Home, Clock, Bot, Users, UserCircle } from "lucide-react";
import Link from "next/link";
import MessagesButton from "./MessagesButton";
import NotificationsButton from "./NotificationsButton";

interface MenuBarProps {
  className?: string;
}

export default async function MenuBar({ className }: MenuBarProps) {
  const { user } = await validateRequest();

  if (!user) return null;

  const [unreadNotificationsCount, unreadMessagesCount] = await Promise.all([
    prisma.notification.count({
      where: {
        recipientId: user.id,
        read: false,
      },
    }),
    (await streamServerClient.getUnreadCount(user.id)).total_unread_count,
  ]);

  const menuItems = [
    { href: "/", icon: Home, title: "Home" },
    { href: "/bookmarks", icon: Bookmark, title: "Bookmarks" },
    { href: "/memories", icon: Clock, title: "Memories" },
    { href: "/ai", icon: Bot, title: "AI Chatbot" },
    { href: "/forum", icon: Users, title: "Forum" },
    { href: "/profile", icon: UserCircle, title: "Profile" },
  ];

  return (
    <div className={className}>
      {menuItems.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          className="flex items-center justify-start gap-2 p-2 sm:p-3"
          title={item.title}
          asChild
        >
          <Link href={item.href}>
            <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden lg:inline">{item.title}</span>
          </Link>
        </Button>
      ))}
      <div className="scale-[0.85] sm:scale-100 origin-left">
        <NotificationsButton
          initialState={{ unreadCount: unreadNotificationsCount }}
        />
      </div>
      <div className="scale-[0.85] sm:scale-100 origin-left">
        <MessagesButton initialState={{ unreadCount: unreadMessagesCount }} />
      </div>
    </div>
  );
}