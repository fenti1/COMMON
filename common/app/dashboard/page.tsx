import Link from "next/link";
import { CourseCard } from "@/components/CourseCard";

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
          <CourseCard
            key={course.id}
            id={course.id}
            code={course.code}
            name={course.name}
            last_updated={course.last_updated}
            />
        ))}
      </div>
    </div>
  );
}
