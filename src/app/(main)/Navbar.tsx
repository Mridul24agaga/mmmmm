import SearchField from "@/components/SearchField"
import UserButton from "@/components/UserButton"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 bg-card shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-3">
        <Link href="/" className="flex-shrink-0">
          <Image
            src="https://media.discordapp.net/attachments/1193183717548638301/1297950957669187658/Black_Gold_White_Luxury_Royal_Crown_Logo_1_2.png?ex=6732d147&is=67317fc7&hm=68f20bf4275d9a80350461671577478d74bbeca3a98ffd1078138dfc83f95639&=&format=webp&quality=lossless"
            alt="Memories Lived Logo"
            width={150}
            height={50}
            priority
          />
        </Link>
        <SearchField />
        <div className="flex items-center gap-4">
          <Button asChild variant="outline">
            <Link href="/profile">Add a Memorial Page</Link>
          </Button>
          <UserButton className="sm:ms-auto" />
        </div>
      </div>
    </header>
  )
}