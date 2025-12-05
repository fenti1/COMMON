# Plan de Implementación: Synapse 🧠

Este documento detalla la hoja de ruta técnica para construir **Synapse** durante el Hackathon. El enfoque es **Velocidad, Impacto Visual y Funcionalidad Core**.

> **Nota sobre el Stack:** Aunque se mencionó Python, utilizaremos **Next.js (TypeScript)** para todo el stack (Frontend + Backend API Routes). Esto permite un despliegue inmediato en Vercel y una integración nativa con la API de Gemini y Supabase sin configurar servidores adicionales.

---

## 🛠 Fase 0: Configuración del Entorno (Inmediato)

### 1. Inicialización del Proyecto
- [ ] Crear proyecto Next.js con App Router y Tailwind CSS.
  ```bash
  npx create-next-app@latest synapse --typescript --tailwind --eslint
  ```
- [ ] Instalar dependencias clave:
  ```bash
  npm install @supabase/supabase-js @google/generative-ai react-markdown rehype-katex remark-math framer-motion lucide-react clsx tailwind-merge
  ```

### 2. Configuración de Supabase
- [ ] Crear proyecto en Supabase.
- [ ] Configurar tablas en SQL Editor (ver sección Schema).
- [ ] Habilitar Google Auth en Authentication > Providers.
- [ ] **IMPORTANTE:** Guardar credenciales en `.env.local` (No subir al repo).
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GEMINI_API_KEY`

---

## 🗄 Fase 1: Arquitectura de Datos (Supabase)

### Schema Propuesto
Ejecutar este script SQL en Supabase para levantar la estructura rápidamente:

```sql
-- Usuarios (Extiende la tabla auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  role text default 'student', -- 'student', 'admin'
  university_email text, -- Para validación UC
  is_verified boolean default false,
  contribution_score int default 0,
  primary key (id)
);

-- Cursos
create table public.courses (
  id uuid default gen_random_uuid() primary key,
  code text unique, -- Ej: IIC2233
  name text,
  description text,
  last_updated_at timestamp with time zone default now()
);

-- Documentos Maestros (Uno por curso)
create table public.master_documents (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses,
  content text, -- Markdown gigante
  version int default 1
);

-- Contribuciones (Input de estudiantes)
create table public.contributions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles,
  course_id uuid references public.courses,
  raw_content text, -- Lo que mandó el usuario
  status text default 'pending', -- 'pending', 'approved', 'rejected'
  ai_analysis text, -- Feedback de Gemini
  created_at timestamp with time zone default now()
);
```

---

## 🔐 Fase 2: Autenticación y "Portería Digital"

### 1. Login & Middleware
- [ ] Implementar botón "Sign in with Google" usando Supabase Auth.
- [ ] Crear Middleware en Next.js (`middleware.ts`) que intercepte rutas protegidas (`/dashboard`, `/course/*`).
- [ ] Lógica del Middleware:
  - Si no hay sesión -> `/login`
  - Si hay sesión pero `!profile.is_verified` -> `/onboarding`
  - Si todo ok -> Dejar pasar.

### 2. Onboarding (Validación UC)
- [ ] Crear página `/onboarding`.
- [ ] Formulario que pide correo `@uc.cl`.
- [ ] Validación Regex: `^[a-zA-Z0-9._%+-]+@uc\.cl$`.
- [ ] Al guardar, actualizar `profiles` set `university_email` y `is_verified = true`.

---

## 💻 Fase 3: Frontend Core (UI/UX)

### 1. Dashboard (Home)
- [ ] **Header:** Logo Synapse + Avatar Usuario + Score.
- [ ] **Grid de Cursos:** Tarjetas con efecto hover (Glassmorphism).
- [ ] **Estado:** Mostrar "Última actualización" en tiempo real.

### 2. Vista de "Cuaderno Vivo" (`/course/[id]`)
- [ ] **Layout:** Sidebar izquierda (Herramientas) + Centro (Documento).
- [ ] **Componente Markdown:** Renderizar el `master_document.content` usando `react-markdown`.
  - Configurar estilos CSS para que parezca un "Paper" académico (fuente Serif, márgenes amplios).
  - Soporte para fórmulas matemáticas (`rehype-katex`).

### 3. Sidebar de Herramientas
- [ ] **Ranking:** Mostrar Top 3 contribuidores del curso.
- [ ] **Botón "Aportar":** Abre el Modal de Ingesta.

---

## 🧠 Fase 4: Integración IA (Gemini 1.5) - "The Gatekeeper"

Esta es la parte crítica para ganar el premio de innovación.

### 1. API Route: `/api/contribute`
- [ ] Recibe: `text` (o archivo) + `course_id`.
- [ ] **Paso 1 - Validación (Gemini):**
  - Prompt: "Evalúa si este texto es relevante para el curso X. Responde JSON { valid: boolean, reason: string }".
- [ ] **Paso 2 - Fusión (Si es válido):**
  - Recuperar el `master_document` actual.
  - Prompt de Fusión: "Eres un editor experto. Integra esta NUEVA información en el DOCUMENTO EXISTENTE. No lo añadas al final, mézclalo donde tenga sentido semántico. Mantén formato Markdown."
- [ ] **Paso 3 - Guardado:**
  - Actualizar `master_documents`.
  - Crear registro en `contributions`.
  - Sumar puntos al usuario en `profiles`.

### 2. Funcionalidad "Smart Selection"
- [ ] Frontend: Detectar selección de texto -> Mostrar tooltip flotante.
- [ ] API Route: `/api/refine`.
- [ ] Prompt: "Reescribe este fragmento para que sea más [simple/técnico/resumido]".

---

## 🚀 Fase 5: Pulido y Entrega

- [ ] **Admin Panel:** Tabla simple para ver usuarios y contribuciones recientes.
- [ ] **Seed Data:** Crear 2 o 3 cursos con contenido inicial para que la demo no se vea vacía.
- [ ] **README:** Copiar la descripción técnica provista.
- [ ] **Deploy:** Push a GitHub + Vercel.

---

### ⏱ Cronograma Sugerido

| Hora | Objetivo |
|------|----------|
| 12:00 - 13:00 | Setup Proyecto, BD y Auth (Fases 0 y 1) |
| 13:00 - 14:30 | Frontend: Dashboard y Vista de Documento (Fase 2) |
| 14:30 - 16:00 | Backend AI: Integración Gemini y Lógica de Fusión (Fase 3) |
| 16:00 - 16:30 | Pulido Visual y Gamificación |
| 16:30 - 17:00 | Preparar Pitch y Demo |
