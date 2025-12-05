import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { ArrowLeft, BookOpen, Users, History, Trophy } from 'lucide-react'
import Link from 'next/link'
import ContributionModal from '@/components/ContributionModal'

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

    // Fetch contributors (increased limit for accurate leaderboard)
    const { data: contributors } = await supabase
        .from('contributions')
        .select('user_id, score_awarded, profiles(full_name)')
        .eq('course_id', id)
        .order('score_awarded', { ascending: false })
        .limit(50)

    // Group contributions by user to calculate total score per user for this course
    const leaderboard = contributors?.reduce((acc: any[], curr: any) => {
        const existing = acc.find(c => c.user_id === curr.user_id)
        if (existing) {
            existing.score += curr.score_awarded
            existing.count += 1
        } else {
            acc.push({
                user_id: curr.user_id,
                name: curr.profiles?.full_name || 'Anonymous',
                score: curr.score_awarded,
                count: 1
            })
        }
        return acc
    }, []).sort((a, b) => b.score - a.score) || []

    // Fetch recent versions
    const { data: versions } = await supabase
        .from('document_versions')
        .select('*, profiles(full_name)')
        .eq('document_id', masterDoc?.id)
        .order('created_at', { ascending: false })
        .limit(5)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white font-sans flex">
            {/* Sidebar */}
            <aside className="w-80 bg-black/20 backdrop-blur-xl border-r border-white/10 fixed h-full hidden md:flex flex-col z-10">
                <div className="p-6 border-b border-white/10">
                    <Link href="/" className="flex items-center text-gray-400 hover:text-white transition-colors mb-4 text-sm font-medium group">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-white tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">{course.code}</h1>
                    <p className="text-sm text-gray-400 mt-1">{course.name}</p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-6">
                        <div className="mb-8">
                            <h3 className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                                <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                                Top Contributors
                            </h3>
                            <div className="space-y-4">
                                {leaderboard.slice(0, 5).map((contributor, index) => (
                                    <div key={contributor.user_id} className="flex items-center bg-white/5 p-2 rounded-lg border border-white/5">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold mr-3 shadow-lg ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                                                index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' : 'bg-white/10 text-gray-300'
                                            }`}>
                                            {contributor.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{contributor.name}</p>
                                            <p className="text-xs text-gray-400">{contributor.score} points</p>
                                        </div>
                                    </div>
                                ))}
                                {leaderboard.length === 0 && (
                                    <p className="text-sm text-gray-500 italic">No contributions yet.</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                                <History className="w-4 h-4 mr-2 text-blue-500" />
                                Recent Updates
                            </h3>
                            <div className="space-y-4">
                                {versions && versions.length > 0 ? versions.map((version: any) => (
                                    <div key={version.id} className="relative pl-4 border-l-2 border-white/10">
                                        <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                        <p className="text-xs text-gray-500 mb-1">
                                            {new Date(version.created_at).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm font-medium text-gray-300 line-clamp-2 hover:text-white transition-colors">
                                            {version.change_summary || 'Content update'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            by <span className="text-blue-400">{version.profiles?.full_name || 'Unknown'}</span>
                                        </p>
                                    </div>
                                )) : (
                                    <p className="text-sm text-gray-500 italic">No history available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-white/10 bg-black/20">
                    <ContributionModal courseId={id} />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-80 p-8 overflow-y-auto h-screen custom-scrollbar">
                <div className="max-w-4xl mx-auto">
                    {/* Paper Container */}
                    <div className="bg-gray-900/50 backdrop-blur-sm shadow-2xl rounded-2xl min-h-[800px] p-12 md:p-16 relative border border-white/10">
                        {/* Paper Header */}
                        <div className="border-b border-white/10 pb-8 mb-8">
                            <h1 className="text-4xl font-serif font-bold text-white mb-4 tracking-tight">
                                {course.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mb-6">
                                <div className="flex items-center">
                                    <BookOpen className="w-4 h-4 mr-2 text-blue-400" />
                                    <span>Living Document</span>
                                </div>
                                <span className="hidden sm:inline text-gray-600">&bull;</span>
                                <span>Version {masterDoc?.version || 1}</span>
                                <span className="hidden sm:inline text-gray-600">&bull;</span>
                                <span>Last updated {masterDoc?.last_updated_at ? new Date(masterDoc.last_updated_at).toLocaleDateString() : 'Never'}</span>
                            </div>


                        </div>

                        {/* Markdown Content */}
                        <article className="prose prose-lg prose-invert max-w-none font-serif prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-code:text-blue-300 prose-a:text-blue-400 hover:prose-a:text-blue-300">
                            {masterDoc?.content ? (
                                <ReactMarkdown
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                >
                                    {masterDoc.content}
                                </ReactMarkdown>
                            ) : (
                                <div className="text-center py-20 text-gray-500 italic bg-white/5 rounded-xl border border-dashed border-white/10">
                                    <p className="mb-2">This document is currently empty.</p>
                                    <p className="text-sm">Use the "Contribute Notes" button to start building the knowledge base!</p>
                                </div>
                            )}
                        </article>
                    </div>
                </div>
            </main>
        </div>
    )
}
