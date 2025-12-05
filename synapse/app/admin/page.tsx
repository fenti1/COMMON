'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { createCourse, updateCourse, deleteCourse } from '@/app/actions'
import { Loader2, Plus, Pencil, Trash2, X, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState<string | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        fetchCourses()
    }, [])

    const [enrollments, setEnrollments] = useState<any[]>([])

    useEffect(() => {
        fetchCourses()
        fetchEnrollments()
    }, [])

    const fetchCourses = async () => {
        const { data } = await supabase.from('courses').select('*').order('code')
        setCourses(data || [])
        setLoading(false)
    }

    const fetchEnrollments = async () => {
        const { data } = await supabase
            .from('enrollments')
            .select('*, profiles(full_name, email), courses(name, code)')
            .eq('status', 'pending')
        setEnrollments(data || [])
    }

    const handleApprove = async (userId: string, courseId: string) => {
        const { approveEnrollment } = await import('@/app/actions')
        await approveEnrollment(userId, courseId)
        fetchEnrollments()
    }

    const handleReject = async (userId: string, courseId: string) => {
        if (!confirm('¿Rechazar esta solicitud?')) return
        const { rejectEnrollment } = await import('@/app/actions')
        await rejectEnrollment(userId, courseId)
        fetchEnrollments()
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este curso?')) return
        await deleteCourse(id)
        fetchCourses()
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Panel de Administración</h1>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-4 py-2 bg-green-600 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Añadir Curso
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="px-4 py-2 bg-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-600 transition-colors ml-2"
                    >
                        Volver al Panel
                    </button>
                </div>

                {/* Enrollment Requests */}
                {enrollments.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-xl font-bold mb-4 text-yellow-500">Solicitudes de Acceso Pendientes</h2>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-700/50">
                                    <tr>
                                        <th className="p-4">Estudiante</th>
                                        <th className="p-4">Curso</th>
                                        <th className="p-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {enrollments.map((req) => (
                                        <tr key={`${req.user_id}-${req.course_id}`} className="border-t border-gray-700">
                                            <td className="p-4">
                                                <div className="font-medium">{req.profiles.full_name}</div>
                                                <div className="text-sm text-gray-400">{req.profiles.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-blue-400">{req.courses.code}</div>
                                                <div className="text-sm text-gray-400">{req.courses.name}</div>
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleApprove(req.user_id, req.course_id)}
                                                    className="px-3 py-1 bg-green-600/20 text-green-400 border border-green-600/50 rounded hover:bg-green-600/30"
                                                >
                                                    Aprobar
                                                </button>
                                                <button
                                                    onClick={() => handleReject(req.user_id, req.course_id)}
                                                    className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-600/50 rounded hover:bg-red-600/30"
                                                >
                                                    Rechazar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <h2 className="text-xl font-bold mb-4">Gestionar Cursos</h2>

                {isCreating && (
                    <div className="mb-8 p-6 bg-gray-800 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">Nuevo Curso</h2>
                        <form action={async (formData) => {
                            await createCourse(formData)
                            setIsCreating(false)
                            fetchCourses()
                        }} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="code" placeholder="Sigla (ej. IIC2233)" className="bg-gray-900 border border-gray-700 p-2 rounded text-white" required />
                                <input name="name" placeholder="Nombre del Curso" className="bg-gray-900 border border-gray-700 p-2 rounded text-white" required />
                            </div>
                            <textarea name="description" placeholder="Descripción" className="w-full bg-gray-900 border border-gray-700 p-2 rounded text-white h-24" />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">Crear Curso</button>
                            </div>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
                ) : (
                    <div className="grid gap-4">
                        {courses.map(course => (
                            <div key={course.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                {isEditing === course.id ? (
                                    <form action={async (formData) => {
                                        await updateCourse(course.id, formData)
                                        setIsEditing(null)
                                        fetchCourses()
                                    }} className="w-full flex flex-col md:flex-row gap-4 items-start md:items-center">
                                        <input name="code" defaultValue={course.code} className="bg-gray-900 border border-gray-700 p-2 rounded text-white w-32" />
                                        <input name="name" defaultValue={course.name} className="bg-gray-900 border border-gray-700 p-2 rounded text-white flex-1" />
                                        <input name="description" defaultValue={course.description} className="bg-gray-900 border border-gray-700 p-2 rounded text-white flex-1" />
                                        <div className="flex gap-2">
                                            <button type="submit" className="p-2 bg-blue-600 rounded hover:bg-blue-700"><Save className="w-4 h-4" /></button>
                                            <button type="button" onClick={() => setIsEditing(null)} className="p-2 bg-gray-600 rounded hover:bg-gray-700"><X className="w-4 h-4" /></button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-blue-400">{course.code}</span>
                                                <h3 className="font-semibold">{course.name}</h3>
                                            </div>
                                            <p className="text-sm text-gray-400">{course.description}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setIsEditing(course.id)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded"><Pencil className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(course.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
