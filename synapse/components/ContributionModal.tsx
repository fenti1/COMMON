'use client'

import { useState } from 'react'
import { Upload, X, Loader2, FileText } from 'lucide-react'
import { submitContribution } from '@/app/actions'
import { useRouter } from 'next/navigation'

export default function ContributionModal({ courseId }: { courseId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [content, setContent] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message: string; summary?: string } | null>(null)
    const router = useRouter()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleSubmit = async () => {
        if (!content.trim() && !file) return
        setIsSubmitting(true)
        setResult(null)

        try {
            const formData = new FormData()
            formData.append('courseId', courseId)
            if (content) formData.append('content', content)
            if (file) formData.append('file', file)

            const res = await submitContribution(formData)
            setResult(res)
            if (res.success) {
                setContent('')
                setFile(null)
                router.refresh()
                setTimeout(() => {
                    setIsOpen(false)
                    setResult(null)
                }, 3000)
            }
        } catch (error) {
            console.error(error)
            setResult({ success: false, message: 'Error al enviar contribución. Por favor intenta de nuevo.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
            >
                <Upload className="w-4 h-4 mr-2" />
                Contribuir Apuntes
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-gray-900 border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                    <div>
                        <h2 className="text-xl font-bold text-white">Contribuir a Apuntes Vivos</h2>
                        <p className="text-sm text-gray-400">Comparte tu conocimiento para mejorar el documento maestro.</p>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    {result && (
                        <div className={`mb-4 p-4 rounded-lg border ${result.success ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            <p className="font-bold">{result.success ? '¡Éxito!' : 'Aviso'}</p>
                            <p>{result.message}</p>
                            {result.summary && (
                                <div className="mt-2 text-sm bg-black/20 p-2 rounded border border-white/5">
                                    <strong>Resumen IA:</strong> {result.summary}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Opción 1: Escribir Apuntes
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="# Mis Apuntes de Clase&#10;&#10;Hoy discutimos..."
                                className="w-full h-48 p-4 bg-black/20 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none text-white placeholder-gray-500"
                                disabled={!!file}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-gray-900 px-2 text-sm text-gray-500">O</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Opción 2: Subir Archivo (PDF, Texto, Markdown)
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/10 border-dashed rounded-lg hover:border-blue-500/50 hover:bg-white/5 transition-all group">
                                <div className="space-y-1 text-center">
                                    <Upload className="mx-auto h-12 w-12 text-gray-500 group-hover:text-blue-400 transition-colors" />
                                    <div className="flex text-sm text-gray-400">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                        >
                                            <span>Subir un archivo</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.txt,.md" />
                                        </label>
                                        <p className="pl-1">o arrastrar y soltar</p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        PDF, TXT, MD hasta 10MB
                                    </p>
                                    {file && (
                                        <div className="flex items-center justify-center gap-2 mt-2">
                                            <p className="text-sm font-semibold text-blue-600">
                                                Seleccionado: {file.name}
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    setFile(null)
                                                    // Reset the file input value if possible, though React state handles the logic
                                                    const input = document.getElementById('file-upload') as HTMLInputElement
                                                    if (input) input.value = ''
                                                }}
                                                className="text-red-500 hover:text-red-700 text-xs underline"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                            <h4 className="flex items-center text-sm font-bold text-blue-400 mb-2">
                                <FileText className="w-4 h-4 mr-2" />
                                Cómo funciona
                            </h4>
                            <ul className="text-xs text-blue-300 space-y-1 list-disc list-inside">
                                <li>Nuestra IA analiza tus apuntes contra el documento maestro actual.</li>
                                <li>Solo se añade información <strong>nueva y relevante</strong>.</li>
                                <li>El contenido redundante se filtra automáticamente.</li>
                                <li>¡Ganas puntos por cada contribución aceptada!</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-3">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={(!content.trim() && !file) || isSubmitting}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analizando y Fusionando...
                            </>
                        ) : (
                            'Enviar Contribución'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
