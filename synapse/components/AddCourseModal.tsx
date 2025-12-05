'use client'

import { useState } from 'react'
import { Search, X, Plus, Check, Loader2 } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'
import { searchCourses, enrollInCourses } from '@/app/actions'
import { useRouter } from 'next/navigation'

export default function AddCourseModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [selected, setSelected] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [enrolling, setEnrolling] = useState(false)
    const router = useRouter()

    const handleSearch = useDebouncedCallback(async (term) => {
        if (!term) {
            setResults([])
            return
        }
        setLoading(true)
        const data = await searchCourses(term)
        setResults(data || [])
        setLoading(false)
    }, 300)

    const toggleSelection = (id: string) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    const handleEnroll = async () => {
        if (selected.length === 0) return
        setEnrolling(true)
        try {
            await enrollInCourses(selected)
            setIsOpen(false)
            setQuery('')
            setResults([])
            setSelected([])
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Failed to enroll')
        } finally {
            setEnrolling(false)
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
            >
                <Plus className="w-4 h-4" />
                Solicitar Acceso
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-gray-900 border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">Add Courses</h2>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 border-b border-white/10">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or code (e.g. IIC2233)..."
                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => {
                                setQuery(e.target.value)
                                handleSearch(e.target.value)
                            }}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[200px]">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                        </div>
                    ) : results.length > 0 ? (
                        results.map(course => (
                            <div
                                key={course.id}
                                onClick={() => toggleSelection(course.id)}
                                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${selected.includes(course.id)
                                    ? 'bg-blue-500/20 border-blue-500/50'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div>
                                    <div className="font-bold text-white">{course.code}</div>
                                    <div className="text-sm text-gray-400">{course.name}</div>
                                </div>
                                {selected.includes(course.id) && (
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                        ))
                    ) : query ? (
                        <div className="text-center py-8 text-gray-500">No courses found.</div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">Search to find courses.</div>
                    )}
                </div>

                <div className="p-4 border-t border-white/10 flex justify-end gap-3">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleEnroll}
                        disabled={selected.length === 0 || enrolling}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Add {selected.length > 0 ? `(${selected.length})` : ''}
                    </button>
                </div>
            </div>
        </div>
    )
}
