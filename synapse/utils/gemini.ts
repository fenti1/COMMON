import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function analyzeAndMergeNotes(currentContent: string, userNotes: string) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.5, // Lower temperature for more stable formatting
      maxOutputTokens: 8192,
    }
  })

  const prompt = `
    Eres un editor académico experto. Tu tarea es integrar nuevos apuntes de un estudiante en un "Documento Maestro" colaborativo.

    **Objetivo:** Crear un documento único, exhaustivo y bien estructurado que integre toda la información.

    **Entradas:**
    1. **Documento Maestro (Estado Actual):**
    ${currentContent || "(Documento vacío)"}

    2. **Apuntes del Estudiante (Nueva Contribución):**
    ${userNotes}

    **Instrucciones:**
    1. **Idioma:** Todo el contenido DEBE estar en **ESPAÑOL**.
    2. **Integrar:** Fusiona la nueva información en las secciones correspondientes del Documento Maestro.
    3. **Formato:** Usa Markdown limpio.
    4. **Filtrar:** Elimina redundancias y notas personales.

    **Formato de Salida (ESTRICTO):**
    Debes separar las partes de tu respuesta usando EXACTAMENTE estos separadores:

    <<<<CONTENT_START>>>>
    (Aquí va el contenido completo del documento en Markdown)
    <<<<CONTENT_END>>>>
    <<<<SUMMARY_START>>>>
    (Aquí va el resumen de cambios en una frase)
    <<<<SUMMARY_END>>>>
    <<<<HAS_CHANGES_START>>>>
    (Escribe "true" si hubo cambios relevantes, o "false" si no)
    <<<<HAS_CHANGES_END>>>>
  `

  const result = await model.generateContent(prompt)
  const response = result.response
  const text = response.text()

  console.log("Gemini Raw Response Length:", text.length)

  try {
    // Helper to extract content between separators
    const extract = (startTag: string, endTag: string) => {
      const startIndex = text.indexOf(startTag)
      const endIndex = text.indexOf(endTag)

      if (startIndex === -1 || endIndex === -1) {
        // Fallback for truncation or formatting errors
        if (startTag === '<<<<CONTENT_START>>>>' && startIndex !== -1) {
          // If we have the start of content but no end, return what we have
          return text.substring(startIndex + startTag.length).trim()
        }
        return null
      }
      return text.substring(startIndex + startTag.length, endIndex).trim()
    }

    const updatedContent = extract('<<<<CONTENT_START>>>>', '<<<<CONTENT_END>>>>')
    const changeSummary = extract('<<<<SUMMARY_START>>>>', '<<<<SUMMARY_END>>>>')
    const hasChangesStr = extract('<<<<HAS_CHANGES_START>>>>', '<<<<HAS_CHANGES_END>>>>')

    if (!updatedContent) {
      throw new Error("Failed to extract content from Gemini response")
    }

    return {
      updatedContent,
      changeSummary: changeSummary || "Se actualizó el documento con nueva información.",
      hasChanges: hasChangesStr === 'true'
    }

  } catch (e) {
    console.error("Error parsing Gemini response:", e)
    console.error("Raw text was:", text)
    // Fallback: if parsing fails completely, assume the whole text might be the content if it looks like markdown
    if (text.includes('#')) {
      return {
        updatedContent: text,
        changeSummary: "Actualización automática (error de formato)",
        hasChanges: true
      }
    }
    throw new Error("Failed to process notes with AI")
  }
}
