import { getUser } from '@/app/(main)/profile/createUser'
import { notFound } from 'next/navigation'

export default async function SharedProfile({ params }: { params: { username: string } }) {
  const user = await getUser(params.username)

  if (!user) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.displayName}</h2>
              <p className="text-gray-600">@{user.username}</p>
            </div>
          </div>
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2 text-gray-900">Bio</h4>
            <p className="text-gray-700">{user.bio || 'No bio provided.'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}