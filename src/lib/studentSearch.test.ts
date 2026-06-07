import { describe, expect, it } from "vitest";
import { filterStudents } from "@/lib/studentSearch";
import type { Student } from "@/domain/types";

const students: Student[] = [
  {
    id: "maya",
    name: "Maya Carter",
    subject: "English",
    level: "B1",
    notes: "Visual learner",
    goals: "Improve essay structure",
    createdAt: "2026-06-07T00:00:00.000Z",
    updatedAt: "2026-06-07T00:00:00.000Z",
  },
  {
    id: "leo",
    name: "Leo Martin",
    subject: "Mathematics",
    level: "Grade 8",
    notes: "Needs confidence",
    goals: "Master linear equations",
    createdAt: "2026-06-07T00:00:00.000Z",
    updatedAt: "2026-06-07T00:00:00.000Z",
  },
];

describe("filterStudents", () => {
  it("matches name, subject, level, and goals without case sensitivity", () => {
    expect(filterStudents(students, "maya")).toEqual([students[0]]);
    expect(filterStudents(students, "MATH")).toEqual([students[1]]);
    expect(filterStudents(students, "grade 8")).toEqual([students[1]]);
    expect(filterStudents(students, "essay")).toEqual([students[0]]);
  });

  it("returns every student for a blank query", () => {
    expect(filterStudents(students, "   ")).toEqual(students);
  });
});
