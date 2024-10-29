import SearchField from "@/components/SearchField";
import UserButton from "@/components/UserButton";
import Link from "next/link";
import Image from "next/image"; // Import the Image component

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 bg-card shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-5 px-5 py-3">
        <Link href="/">
          <Image
            src="https://media.discordapp.net/attachments/1193183717548638301/1297950957669187658/Black_Gold_White_Luxury_Royal_Crown_Logo_1_2.png?ex=6721adc7&is=67205c47&hm=f03dbe63cda465a6cdee0e7af4055f397cabd9d01d89807af0680fdb78875ec5&=&format=webp&quality=lossless" // Replace with your logo URL
            alt="Memories Lived Logo"
            width={150} // Adjust the width
            height={50} // Adjust the height
            priority // Optional: for optimized loading
          />
        </Link>
        <SearchField />
        <UserButton className="sm:ms-auto" />
      </div>
    </header>
  );
}
