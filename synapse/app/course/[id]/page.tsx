import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { ArrowLeft, BookOpen, Users, Upload } from 'lucide-react'
import Link from 'next/link'

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch course details
    const { data: course } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single()

    if (!course) notFound()

    // Fetch master document
    const { data: masterDoc } = await supabase
        .from('master_documents')
        .select('*')
        .eq('course_id', id)
        .single()

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 fixed h-full hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <Link href="/" className="flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">{course.code}</h1>
                    <p className="text-sm text-gray-500 mt-1">{course.name}</p>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="mb-8">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Top Contributors
                        </h3>
                        <div className="space-y-3">
                            {/* Placeholder for contributors */}
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 text-xs font-bold mr-3">
                                    JD
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">John Doe</p>
                                    <p className="text-xs text-gray-500">15 contributions</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100">
                    <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Contribute
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8 overflow-y-auto h-screen">
                <div className="max-w-4xl mx-auto">
                    {/* Paper Container */}
                    <div className="bg-white shadow-xl rounded-xl min-h-[800px] p-12 md:p-16 relative">
                        {/* Paper Header */}
                        <div className="border-b border-gray-100 pb-8 mb-8">
                            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
                                {course.name}
                            </h1>
                            <div className="flex items-center text-gray-500 text-sm">
                                <BookOpen className="w-4 h-4 mr-2" />
                                <span>Living Document &bull; Version {masterDoc?.version || 1}</span>
                                <span className="mx-2">&bull;</span>
                                <span>Last updated {new Date(course.last_updated_at).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* Markdown Content */}
                        <article className="prose prose-lg prose-slate max-w-none font-serif">
                            {masterDoc?.content ? (
                                <ReactMarkdown
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                >
                                    {masterDoc.content}
                                </ReactMarkdown>
                            ) : (
                                <div className="text-center py-20 text-gray-400 italic">
                                    This document is empty. Be the first to contribute!
                                </div>
                            )}
                        </article>
                    </div>
                </div>
            </main>
        </div>
    )
}
