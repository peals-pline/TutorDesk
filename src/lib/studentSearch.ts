import type { Student } from "@/domain/types";

export function filterStudents(students: Student[], query: string): Student[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (!normalizedQuery) {
    return students;
  }

  return students.filter((student) =>
    [student.name, student.subject, student.level, student.goals]
      .join(" ")
      .toLocaleLowerCase()
      .includes(normalizedQuery),
  );
}
