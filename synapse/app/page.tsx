import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import UserDropdown from '@/components/UserDropdown'
import AddCourseModal from '@/components/AddCourseModal'

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

  // Fetch enrolled courses
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      course_id,
      status,
      courses (
        *
      )
    `)
    .eq('user_id', user.id)
  // .order('created_at', { ascending: false }) // Enrollments might not have created_at if I didn't add it, but I did.

  // Extract courses from enrollments
  // @ts-ignore
  const approvedCourses = enrollments?.filter((e: any) => e.status === 'approved').map((e: any) => e.courses).filter(Boolean) || []
  // @ts-ignore
  const pendingCourses = enrollments?.filter((e: any) => e.status === 'pending').map((e: any) => e.courses).filter(Boolean) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white font-sans">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20">
              S
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Common</span>
          </div>

          <div className="flex items-center gap-4">
            {profile.role === 'admin' && (
              <Link href="/admin" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Panel de Admin
              </Link>
            )}
            <UserDropdown user={profile} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Mis Cursos</h2>
          <AddCourseModal />
        </div>

        {/* Pending Requests */}
        {pendingCourses.length > 0 && (
          <div className="mb-12">
            <h3 className="text-sm font-semibold text-yellow-500 uppercase tracking-wider mb-4">Pendiente de Aprobación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingCourses.map((course: any) => (
                <div key={course.id} className="bg-white/5 rounded-xl border border-yellow-500/30 p-6 opacity-75">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center text-yellow-500 font-bold text-lg border border-yellow-500/20">
                      {course.code.substring(0, 3)}
                    </div>
                    <span className="text-xs font-medium text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20">
                      Pendiente
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{course.name}</h3>
                  <p className="text-sm text-gray-400">Solicitud enviada. Esperando aprobación del admin.</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedCourses && approvedCourses.length > 0 ? (
            approvedCourses.map((course: any) => (
              <Link key={course.id} href={`/course/${course.id}`} className="group">
                <div className="bg-white/5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-200 p-6 h-full flex flex-col backdrop-blur-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-bold text-lg border border-blue-500/20">
                      {course.code.substring(0, 3)}
                    </div>
                    <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                      Activo
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {course.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    {course.description || 'Sin descripción disponible.'}
                  </p>

                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center text-xs text-gray-500">
                    <span>Última actualización: {new Date(course.last_updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white/5 rounded-xl border border-dashed border-white/10 backdrop-blur-sm">
              <p className="text-gray-400">No se encontraron cursos. ¡Comienza añadiendo uno!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
