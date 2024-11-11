import Image from 'next/image'
import { Heart, Users, Camera } from 'lucide-react'

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Our Story</h1>
        </div>
      </header>
      <main className="pb-8">
        <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:py-12 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Weaving Threads of Remembrance
              </h2>
              <p className="mt-3 max-w-3xl text-base sm:text-lg text-gray-600">
                At MemoriesLived.com, we believe that every life tells a unique and beautiful story. Our platform is a digital tapestry where the threads of cherished memories, shared laughter, and enduring love come together to create a lasting tribute to those who have touched our hearts.
              </p>
              <div className="mt-8 space-y-4">
                <Feature icon={<Heart className="h-5 w-5 sm:h-6 sm:w-6 text-pink-600" />} title="Honoring Legacies">
                  Create a digital sanctuary where the essence of your loved ones lives on, vibrant and ever-present.
                </Feature>
                <Feature icon={<Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />} title="Connecting Hearts">
                  Bridge distances and generations, allowing family and friends to come together in remembrance and celebration.
                </Feature>
                <Feature icon={<Camera className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />} title="Capturing Moments">
                  Preserve the fleeting instants that defined a life, from milestone achievements to quiet, everyday joys.
                </Feature>
              </div>
            </div>
            <div className="mt-10 lg:mt-0 flex justify-center">
              <Image
                src="https://media.discordapp.net/attachments/1193183717548638301/1303773117335994438/1729527829262.jpg?ex=672cf8d6&is=672ba756&hm=49e690dffb56c0bf4307e92af730e2427e7d504da589294c91045686b5a58397&=&format=webp"
                alt="A mosaic of cherished memories"
                width={300}
                height={200}
                className="rounded-lg shadow-lg object-cover"
              />
            </div>
          </div>
          <div className="mt-12 sm:mt-16">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Our Heartfelt Mission</h3>
            <p className="mt-3 text-base sm:text-lg text-gray-600">
              We&apos;re on a journey to transform the way we remember and celebrate lives. MemoriesLived.com is more than a platform; it&apos;s a compassionate space where grief finds solace, where joy resurfaces in shared stories, and where the legacy of those we&apos;ve lost continues to inspire and guide us. Our mission is to make the act of remembering as beautiful, personal, and enduring as the lives we honor.
            </p>
          </div>
          <div className="mt-8 sm:mt-12 bg-white shadow-sm rounded-lg p-4 sm:p-6">
            <h4 className="text-lg sm:text-xl font-semibold text-gray-900">A Labor of Love</h4>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              MemoriesLived.com is lovingly crafted by CJM Ashton LLC, based in the heart of Austin, TX. We pour our passion into creating a platform that respects the delicate nature of loss while celebrating the enduring power of memory. Every feature, every pixel is designed with care, understanding that we&apos;re not just building a website, but a home for your most treasured recollections.
            </p>
          </div>
          <div className="mt-8 sm:mt-16 border-t border-gray-200 pt-6 sm:pt-8">
            <p className="text-sm sm:text-base text-gray-500 italic text-center">
              &ldquo;To live in hearts we leave behind is not to die.&rdquo; - Thomas Campbell
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

function Feature({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
  return (
    <div className="flex">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-gray-100 text-white">
          {icon}
        </div>
      </div>
      <div className="ml-4">
        <h3 className="text-base sm:text-lg font-medium text-gray-900">{title}</h3>
        <p className="mt-2 text-sm sm:text-base text-gray-600">{children}</p>
      </div>
    </div>
  )
}