# Common

**Democratizando el conocimiento universitario mediante inteligencia colectiva.**

---

## 1. El Problema: Silos de Conocimiento y Redundancia

La toma de apuntes tradicional es un proceso ineficiente, desigual y redundante. Aunque existen herramientas modernas de digitalización, ninguna ha resuelto el problema estructural de la **fragmentación del conocimiento**.

**El Contexto en Cifras (Chile):**

- Existen aproximadamente **1.2 millones de estudiantes universitarios** (Mineduc, 2020).
- Estimamos que cada estudiante genera cerca de **30 documentos académicos** por año.
- Resultado: **~45 millones de documentos anuales** con información de alto valor quedan aislados en discos duros personales o nubes privadas, perdiéndose para siempre.

**Las Fricciones Actuales:**

1. **Ineficiencia Crónica:** Los estudiantes invierten horas transcribiendo la misma información de manera aislada.
2. **Variabilidad de Calidad:** La calidad del apunte depende de la velocidad de escritura y la capacidad de retención individual. "Basura entra, basura sale".
3. **Desventaja por Asistencia:** Perder una clase implica perder el hilo conductor, generando brechas de aprendizaje.
4. **El Fracaso de los Repositorios Estáticos:** Las wikis o carpetas compartidas (Drives) acumulan archivos desactualizados y redundantes. El uso de IA generativa individual (ChatGPT/Gemini) es rápido, pero propenso a alucinaciones por falta de contexto específico del curso.

---

## 2. La Solución: Apuntes Vivos Asistidos por LLM

**Common** no es un repositorio de archivos estáticos; es un **sistema activo de gestión del conocimiento**. Introducimos el concepto de **"Apuntes Vivos"**.

En lugar de una carpeta llena de PDFs repetidos, Common funciona como una red social académica donde los estudiantes colaboran para crear **un único documento maestro por asignatura**, actualizado, verificado y accesible.

Actuamos como un **Agente Editor Autónomo**. Utilizamos la API de **Google Gemini 2.0 Flash** para orquestar el caos de los aportes individuales y transformarlos en una base de conocimiento colaborativa y en constante evolución.

---

## 3. Arquitectura y Funcionamiento (The Mechanics)

El corazón de Common es su motor de procesamiento: **Synapse Engine**. Este motor transforma notas crudas en conocimiento estructurado mediante un flujo de tres etapas:

### A. Ingesta de Datos (Input)

Los estudiantes autenticados (actualmente restringido a dominio `@uc.cl` y gestionado por roles de ayudantes/admin) envían sus aportes al repositorio del curso.

- **Formatos Soportados:** Texto crudo, PDFs (con extracción robusta vía `pdfjs-dist`).

### B. El Filtro de Razonamiento ("The Gatekeeper")

Utilizamos Google Gemini no solo para resumir, sino para **razonar**. El modelo evalúa cada nuevo *input* contra el contexto actual del "Documento Maestro":

- **Verificación:** ¿La información es consistente con el material del curso?
- **Redundancia:** ¿Este concepto ya fue explicado anteriormente?
- **Filtrado:** Detección de vandalismo, ruido o información irrelevante.

### C. Síntesis y Evolución (Output)

Si el aporte supera al *Gatekeeper*, la IA no lo anexa simplemente al final. El motor:

1. **Reescribe** la sección pertinente del documento para integrar el nuevo concepto orgánicamente.
2. **Mejora** la claridad, la sintaxis y la profundidad del material para toda la comunidad.
3. **Itera** el documento, manteniéndolo "vivo" y libre de fragmentación.

---

## 4. Incentivos y Gamificación

Para garantizar la sostenibilidad de la Inteligencia Colectiva, Common implementa un sistema de **Reputación Académica**:

- **Ranking Histórico:** Se otorgan puntos de contribución a cada usuario cuyo aporte sea validado e integrado por el *Gatekeeper*.
- **Reconocimiento:** Visibilidad destacada para aquellos estudiantes que más valor real aportan a la comunidad, fomentando una competencia sana por la calidad académica.

---

## 5. Documentación Técnica

### Stack Tecnológico

* **Frontend & Backend:** [Next.js 14](https://nextjs.org/) (App Router)
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
* **Base de Datos & Auth:** [Supabase](https://supabase.com/) (PostgreSQL)
* **Inteligencia Artificial:** [Google Gemini API](https://ai.google.dev/) (`@google/generative-ai`)
* **Procesamiento de PDF:** `pdfjs-dist`

### Instalación y Ejecución

1. **Clonar el repositorio:**

   ```bash
   cd synapse
   ```
2. **Instalar dependencias:**

   ```bash
   npm install
   ```
3. **Configurar variables de entorno:**
   Crea un archivo `.env.local` con:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
   GEMINI_API_KEY=tu_api_key
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```
4. **Ejecutar en desarrollo:**

   ```bash
   npm run dev
   ```

---

*Common - Diciembre 2025*
