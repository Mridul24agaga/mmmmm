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
            src="https://media.discordapp.net/attachments/1193183717548638301/1292820769419825222/Black_Gold_White_Luxury_Royal_Crown_Logo_1_2.png?ex=673d286a&is=673bd6ea&hm=840fa605d352c3236ddc545e6022b8761adae3d890e21dfd13c895c355d1bd81&=&format=webp&quality=lossless"
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