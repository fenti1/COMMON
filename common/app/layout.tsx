import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "COMMON",
  description: "Inteligencia Colectiva Universitaria",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-100 text-slate-900">
        <div className="flex min-h-screen">

          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-slate-200 p-6">
            <h1 className="text-2xl font-bold text-academic-blue mb-6">
              COMMON
            </h1>

            <nav className="space-y-3">
              <Link className="block text-slate-700 hover:text-academic-blue" href="/dashboard">
                Dashboard
              </Link>
              <Link className="block text-slate-700 hover:text-academic-blue" href="/courses">
                Cursos
              </Link>
              <Link className="block text-slate-700 hover:text-academic-blue" href="/profile">
                Perfil
              </Link>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
