import Link from "next/link";

export default function DashboardPage() {
  // TEMPORAL: Cursos falsos hasta que Supabase esté listo
  const mockCourses = [
    {
      id: "iic2233",
      code: "IIC2233",
      name: "Programación Avanzada",
      last_updated: "Hace 5 min",
    },
    {
      id: "fis1001",
      code: "FIS1001",
      name: "Física I",
      last_updated: "Hace 12 min",
    },
    {
      id: "mat1203",
      code: "MAT1203",
      name: "Cálculo III",
      last_updated: "Ayer",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-academic-blue">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCourses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className="block group"
          >
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-slate-800 group-hover:text-academic-blue">
                {course.code}
              </h2>
              <p className="text-slate-600 mt-1">{course.name}</p>

              <div className="mt-4 text-sm text-slate-500">
                Última actualización:{" "}
                <span className="font-medium text-slate-700">
                  {course.last_updated}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
