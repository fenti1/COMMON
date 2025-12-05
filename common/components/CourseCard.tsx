import Link from "next/link";

interface CourseCardProps {
  id: string;
  code: string;
  name: string;
  last_updated: string;
}

export function CourseCard({ id, code, name, last_updated }: CourseCardProps) {
  // Simulación de estado (pronto reemplazado por IA)
  const isFresh = last_updated.includes("min");
  const color = isFresh ? "bg-green-500" : "bg-yellow-500";

  return (
    <Link href={`/courses/${id}`} className="block group">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800 group-hover:text-academic-blue">
            {code}
          </h2>

          {/* Smart Pin */}
          <span className={`h-3 w-3 rounded-full ${color}`}></span>
        </div>

        <p className="text-slate-600 mt-1">{name}</p>

        <div className="mt-4 text-sm text-slate-500">
          Última actualización:{" "}
          <span className="font-medium text-slate-700">{last_updated}</span>
        </div>
      </div>
    </Link>
  );
}
