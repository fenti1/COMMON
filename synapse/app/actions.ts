'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createRequire } from 'module'

export async function searchCourses(query: string) {
    const supabase = await createClient()

    if (!query) return []

    const { data, error } = await supabase
        .from('courses')
        .select('*')
        .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
        .limit(10)

    if (error) {
        console.error('Error searching courses:', error)
        return []
    }

    return data
}

export async function enrollInCourses(courseIds: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const records = courseIds.map(courseId => ({
        user_id: user.id,
        course_id: courseId,
        status: 'pending'
    }))

    const { error } = await supabase
        .from('enrollments')
        .upsert(records, { onConflict: 'user_id, course_id', ignoreDuplicates: true })
        .select()

    if (error) {
        console.error('Error enrolling:', error)
        throw error
    }

    revalidatePath('/')
}

export async function approveEnrollment(userId: string, courseId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error('Unauthorized')

    const { error } = await supabase
        .from('enrollments')
        .update({ status: 'approved' })
        .eq('user_id', userId)
        .eq('course_id', courseId)

    if (error) throw error
    revalidatePath('/admin')
}

export async function rejectEnrollment(userId: string, courseId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error('Unauthorized')

    const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('user_id', userId)
        .eq('course_id', courseId)

    if (error) throw error
    revalidatePath('/admin')
}

export async function createCourse(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error('Unauthorized')

    const code = formData.get('code') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string

    const { error } = await supabase.from('courses').insert({ code, name, description })
    if (error) throw error

    revalidatePath('/admin')
    revalidatePath('/')
}

export async function updateCourse(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error('Unauthorized')

    const code = formData.get('code') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string

    const { error } = await supabase.from('courses').update({ code, name, description }).eq('id', id)
    if (error) throw error

    revalidatePath('/admin')
    revalidatePath('/')
}

export async function deleteCourse(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error('Unauthorized')

    const { error } = await supabase.from('courses').delete().eq('id', id)
    if (error) throw error

    revalidatePath('/admin')
    revalidatePath('/')
}

export async function submitContribution(formData: FormData) {
    const courseId = formData.get('courseId') as string
    const content = formData.get('content') as string
    const file = formData.get('file') as File | null

    if (!courseId) throw new Error('Course ID is required')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    let noteContent = content || ''

    // Process file if present
    if (file && file.size > 0) {
        if (file.type === 'application/pdf') {
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            // Use pdfjs-dist for robust text extraction
            const require = createRequire(import.meta.url)
            const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js')
            const path = require('path')

            // Explicitly set worker to absolute path to avoid resolution errors
            try {
                // In Next.js server actions, we need to point to the actual file on disk
                const workerPath = path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.js')
                pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath
            } catch (e) {
                console.warn('Could not resolve pdf worker path, proceeding without explicit workerSrc', e)
            }

            // Disable worker for Node.js environment
            // @ts-ignore
            const loadingTask = pdfjsLib.getDocument({
                data: new Uint8Array(buffer),
                useSystemFonts: true,
                disableFontFace: true,
            })

            const doc = await loadingTask.promise
            let fullText = ''

            for (let i = 1; i <= doc.numPages; i++) {
                const page = await doc.getPage(i)
                const textContent = await page.getTextContent()
                const pageText = textContent.items
                    // @ts-ignore
                    .map((item) => item.str)
                    .join(' ')
                fullText += pageText + '\n\n'
            }

            noteContent = fullText
        } else {
            // Assume text/markdown
            noteContent = await file.text()
        }
    }

    if (!noteContent.trim()) {
        return { success: false, message: 'No content provided.' }
    }

    // 1. Get current Master Document
    let { data: masterDoc } = await supabase
        .from('master_documents')
        .select('*')
        .eq('course_id', courseId)
        .single()

    // Create if doesn't exist
    if (!masterDoc) {
        const { data: newDoc, error } = await supabase
            .from('master_documents')
            .insert({ course_id: courseId, content: '' })
            .select()
            .single()

        if (error) throw error
        masterDoc = newDoc
    }

    // 2. Process with Gemini
    const { analyzeAndMergeNotes } = await import('@/utils/gemini')
    const result = await analyzeAndMergeNotes(masterDoc.content, noteContent)

    if (!result.hasChanges) {
        return { success: false, message: 'No new information detected in your notes.' }
    }

    // 3. Update Master Document
    const { error: updateError } = await supabase
        .from('master_documents')
        .update({ content: result.updatedContent, last_updated_at: new Date().toISOString() })
        .eq('id', masterDoc.id)

    if (updateError) throw updateError

    // 4. Create Version History
    await supabase.from('document_versions').insert({
        document_id: masterDoc.id,
        content: result.updatedContent,
        contributor_id: user.id,
        change_summary: result.changeSummary
    })

    // 5. Record Contribution & Award Points
    const score = 10 // Base score for accepted contribution
    await supabase.from('contributions').insert({
        user_id: user.id,
        course_id: courseId,
        raw_content: noteContent,
        score_awarded: score,
        change_summary: result.changeSummary,
        status: 'accepted'
    })

    // 6. Update User Score
    // Fetch current score first to be safe, or use an RPC if concurrency is high (simple update for now)
    const { data: profile } = await supabase.from('profiles').select('contribution_score').eq('id', user.id).single()
    const newScore = (profile?.contribution_score || 0) + score
    await supabase.from('profiles').update({ contribution_score: newScore }).eq('id', user.id)

    revalidatePath(`/course/${courseId}`)
    return { success: true, message: 'Contribution accepted! +10 points', summary: result.changeSummary }
}
