import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.is_verified) {
    redirect('/onboarding')
  }

  // Fetch courses
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .order('last_updated_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="text-xl font-bold tracking-tight">Synapse</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium">{profile.full_name}</span>
              <span className="text-xs text-gray-500">Score: {profile.contribution_score} 🌟</span>
            </div>
            <img
              src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name}`}
              alt="Avatar"
              className="w-10 h-10 rounded-full border border-gray-200"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">My Courses</h2>
          <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
            + Add Course
          </button>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses && courses.length > 0 ? (
            courses.map((course) => (
              <Link key={course.id} href={`/course/${course.id}`} className="group">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-6 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-lg">
                      {course.code.substring(0, 3)}
                    </div>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {course.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {course.description || 'No description available.'}
                  </p>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center text-xs text-gray-400">
                    <span>Last update: {new Date(course.last_updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">No courses found. Start by adding one!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
