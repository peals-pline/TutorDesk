import { describe, expect, it } from "vitest";
import { seedData } from "@/data/seed";
import { generateProgressReport, getMistakeFrequency } from "@/lib/report";

describe("report generation", () => {
  const student = seedData.students[0];
  const scoped = {
    lessons: seedData.lessons.filter((item) => item.studentId === student.id),
    homework: seedData.homework.filter((item) => item.studentId === student.id),
    mistakes: seedData.mistakes.filter((item) => item.studentId === student.id),
    progress: seedData.progress.filter((item) => item.studentId === student.id),
  };

  it("counts recurring mistakes by topic", () => {
    expect(getMistakeFrequency(scoped.mistakes)).toEqual({
      Grammar: 1,
      Writing: 1,
    });
  });

  it("creates a markdown progress report", () => {
    const report = generateProgressReport({ student, ...scoped });
    expect(report).toContain("# Progress report: Maya Carter");
    expect(report).toContain("## Recent lessons");
    expect(report).toContain("## Suggested next steps");
  });
});
