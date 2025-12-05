'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'

interface UserDropdownProps {
    user: {
        full_name: string
        avatar_url: string | null
        contribution_score: number
    }
}

export default function UserDropdown({ user }: UserDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-4 focus:outline-none"
            >
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-medium text-white">{user.full_name}</span>
                    <span className="text-xs text-blue-200">Score: {user.contribution_score} 🌟</span>
                </div>
                <img
                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}`}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full border-2 border-white/20 hover:border-white/50 transition-colors"
                />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-xl z-20 py-1 overflow-hidden backdrop-blur-lg">
                        <div className="px-4 py-2 border-b border-white/10 md:hidden">
                            <p className="text-sm text-white font-medium truncate">{user.full_name}</p>
                            <p className="text-xs text-blue-200">Score: {user.contribution_score} 🌟</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2 transition-colors"
                        >
                            <LogOut size={16} />
                            Cerrar sesión
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
