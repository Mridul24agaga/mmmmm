'use client'

import { useState } from "react"
import SearchField from "@/components/SearchField"
import UserButton from "@/components/UserButton"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, Bookmark, Home, Clock, Bot, Users, UserCircle, Info, Scale } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const menuItems = [
    { href: "/", icon: Home, title: "Home" },
    { href: "/bookmarks", icon: Bookmark, title: "Bookmarks" },
    { href: "/memories", icon: Clock, title: "Memories" },
    { href: "/ai", icon: Bot, title: "Virtual Companion" },
    { href: "/forum", icon: Users, title: "Forum" },
    { href: "/profile", icon: UserCircle, title: "Memories Page" },
    { href: "/about", icon: Info, title: "About Us" },
    { href: "/legal", icon: Scale, title: "Legal" },
  ]

  return (
    <>
      <header className="sticky top-0 z-20 bg-card shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link href="/" className="flex-shrink-0">
              <Image
                src="https://media.discordapp.net/attachments/1193183717548638301/1297950957669187658/Black_Gold_White_Luxury_Royal_Crown_Logo_1_2.png?ex=673eaec7&is=673d5d47&hm=19b0adbce5531d326051f6b02ccfb47e460093292539f999bce6db0a25d6a7fb&=&format=webp&quality=lossless"
                alt="Memories Lived Logo"
                width={120}
                height={40}
                priority
                className="h-8 w-auto"
              />
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center px-6">
            <SearchField className="max-w-md w-full" />
          </div>

          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="hidden sm:flex">
              <Link href="/profile">Add a Memorial Page</Link>
            </Button>
            <UserButton />
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 z-40 w-64 bg-card shadow-lg"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <Image
                    src="https://media.discordapp.net/attachments/1193183717548638301/1297950957669187658/Black_Gold_White_Luxury_Royal_Crown_Logo_1_2.png?ex=673eaec7&is=673d5d47&hm=19b0adbce5531d326051f6b02ccfb47e460093292539f999bce6db0a25d6a7fb&=&format=webp&quality=lossless"
                    alt="Memories Lived Logo"
                    width={100}
                    height={32}
                    priority
                    className="h-6 w-auto"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(false)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <ul className="flex-grow overflow-y-auto py-4">
                  {menuItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center px-4 py-2.5 text-sm hover:bg-accent"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <item.icon className="h-4 w-4 mr-3" />
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="p-4 border-t">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/profile" onClick={() => setIsSidebarOpen(false)}>
                      Add a Memorial Page
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

