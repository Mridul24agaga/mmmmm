import signupImage from "@/assets/sign-up.jpg";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function Page() {
  return (
    <main className="flex h-screen bg-white">
      {/* Left side: Sign Up Form */}
      <div className="flex flex-col justify-center w-full max-w-[20rem] p-5 md:w-[50%] space-y-8 mx-auto">
        {/* Company Logo */}
        <div className="text-center">
          <Image
            src="https://media.discordapp.net/attachments/1193183717548638301/1297950957669187658/Black_Gold_White_Luxury_Royal_Crown_Logo_1_2.png?ex=672edcc7&is=672d8b47&hm=2e1f1d20a0b3e38132b93e7fc4e83d5c1045ec5b53dfb82303d298ec995b2dfd&=&format=webp&quality=lossless" // Replace with your logo URL
            alt="Company Logo"
            width={250} // Adjust width as needed
            height={50} // Adjust height as needed
            className="mx-auto"
          />
        </div>
        <div className="space-y-5">
          <SignUpForm />
          <Link href="/login" className="block text-center text-blue-600 hover:underline">
            Already have an account? Log in
          </Link>
        </div>
      </div>

      {/* Right side: Image */}
      <div className="hidden md:block md:w-[30%]">
        <Image
          src={signupImage}
          alt="Sign Up Image"
          className="object-cover w-full h-full"
        />
      </div>
    </main>
  );
}
