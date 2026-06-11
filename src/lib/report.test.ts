import { describe, expect, it } from "vitest";
import { seedData } from "@/data/seed";
import { generateProgressReport, getMistakeFrequency, type ReportTemplate } from "@/lib/report";

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

  it("creates a detailed markdown progress report", () => {
    const template: ReportTemplate = "detailed";
    const report = generateProgressReport({ student, ...scoped }, template);
    expect(report).toContain("# Progress report: Maya Carter");
    expect(report).toContain("## Recent lessons");
    expect(report).toContain("## Homework status");
    expect(report).toContain("## Suggested next steps");
    expect(report).not.toContain("вЂ");
  });

  it("creates a concise update for quick sharing", () => {
    const report = generateProgressReport({ student, ...scoped }, "concise");

    expect(report).toContain("# Progress update: Maya Carter");
    expect(report).toContain("**Recent focus:** Opinion paragraph structure");
    expect(report).toContain("**Homework:**");
    expect(report).toContain("**Next step:**");
    expect(report).not.toContain("## Common mistakes");
  });
});
