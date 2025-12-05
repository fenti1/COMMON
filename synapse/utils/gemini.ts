import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function analyzeAndMergeNotes(currentContent: string, userNotes: string) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    }
  })

  const prompt = `
    Eres un editor académico experto y un especialista en la materia. Tu tarea es integrar nuevos apuntes de un estudiante en un "Documento Maestro" colaborativo para un curso universitario.

    **Objetivo:** Crear un documento único, exhaustivo, bien estructurado y explicativo que integre toda la información relevante de ambas fuentes.

    **Entradas:**
    1. **Documento Maestro (Estado Actual):**
    ${currentContent || "(Documento vacío)"}

    2. **Apuntes del Estudiante (Nueva Contribución):**
    ${userNotes}

    **Instrucciones:**
    1. **Idioma:** Todo el contenido DEBE estar en **ESPAÑOL**.
    2. **Analizar:** Lee cuidadosamente ambos textos. Identifica la información en los "Apuntes del Estudiante" que sea *nueva*, *relevante* y *correcta*.
    3. **Reestructurar e Integrar:** NO te limites a pegar la información al final.
       - **Integra** la nueva información orgánicamente en las secciones correspondientes del Documento Maestro.
       - **Reescribe** y **expande** las explicaciones existentes si los nuevos apuntes aportan mayor claridad o profundidad.
       - Si el Documento Maestro está vacío, crea una estructura lógica y académica basada en los apuntes.
       - Usa un tono **explicativo**, **didáctico** y **académico**.
    4. **Formato:** Usa Markdown (encabezados, viñetas, negritas, bloques de código) para organizar el contenido de manera clara y legible.
    5. **Filtrar:** Descarta información redundante, irrelevante o notas personales (ej: "tengo que estudiar esto").
    6. **Resumir:** Proporciona un resumen breve de una frase sobre los cambios realizados.

    **Formato de Salida:**
    Devuelve un objeto JSON con la siguiente estructura:
    {
      "updatedContent": "El contenido completo en markdown del documento fusionado...",
      "changeSummary": "Un resumen breve de los cambios...",
      "hasChanges": true/false (true si añadiste/modificaste algo, false si los apuntes eran redundantes)
    }
    
    IMPORTANTE: Devuelve SOLO el objeto JSON, sin bloques de código markdown alrededor.
  `

  const result = await model.generateContent(prompt)
  const response = result.response
  const text = response.text()

  console.log("Gemini Raw Response:", text)

  try {
    // Robust JSON extraction
    const startIndex = text.indexOf('{')
    const endIndex = text.lastIndexOf('}')

    if (startIndex === -1 || endIndex === -1) {
      throw new Error("No JSON object found in response")
    }

    const jsonString = text.substring(startIndex, endIndex + 1)
    return JSON.parse(jsonString)
  } catch (e) {
    console.error("Error parsing Gemini response:", e)
    console.error("Raw text was:", text)
    throw new Error("Failed to process notes with AI")
  }
}
