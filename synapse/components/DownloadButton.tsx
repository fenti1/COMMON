'use client'

import { Download } from 'lucide-react'

interface DownloadButtonProps {
    content: string
    filename: string
}

export default function DownloadButton({ content, filename }: DownloadButtonProps) {
    const handleDownload = () => {
        const blob = new Blob([content], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${filename}.md`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
            title="Descargar apuntes"
        >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Descargar</span>
        </button>
    )
}
