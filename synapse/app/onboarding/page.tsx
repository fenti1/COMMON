'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'

export default function OnboardingPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        // Regex validation
        const ucEmailRegex = /^[a-zA-Z0-9._%+-]+@uc\.cl$/
        if (!ucEmailRegex.test(email)) {
            setError('Please enter a valid @uc.cl email address.')
            setLoading(false)
            return
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No user found')

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    university_email: email,
                    is_verified: true // In a real app, we would send a verification email. Here we trust the regex + login.
                })
                .eq('id', user.id)

            if (updateError) throw updateError

            router.push('/')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-2xl border border-gray-800">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white">Verify your Identity</h2>
                    <p className="mt-2 text-gray-400">
                        To access Synapse, please verify your university email.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                            UC Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="username@uc.cl"
                            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {error && (
                        <div className="flex items-center p-3 text-sm text-red-400 bg-red-900/20 rounded-md">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Verify Access'}
                    </button>
                </form>
            </div>
        </div>
    )
}
