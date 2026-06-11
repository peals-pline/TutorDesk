import type { Homework, Lesson, Mistake, ProgressStatus, Student, TopicProgress } from "@/domain/types";
import { formatDate } from "@/lib/utils";

const progressLabels: Record<ProgressStatus, string> = {
  not_started: "Not started",
  learning: "Learning",
  needs_review: "Needs review",
  mastered: "Mastered",
};

type ReportInput = {
  student: Student;
  lessons: Lesson[];
  homework: Homework[];
  mistakes: Mistake[];
  progress: TopicProgress[];
};

export type ReportTemplate = "concise" | "detailed";

export function getMistakeFrequency(mistakes: Mistake[]) {
  return mistakes.reduce<Record<string, number>>((acc, mistake) => {
    acc[mistake.topic] = (acc[mistake.topic] ?? 0) + 1;
    return acc;
  }, {});
}

function generateConciseReport({ student, lessons, homework, progress }: ReportInput) {
  const latestLesson = lessons.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
  const homeworkCounts = homework.reduce<Record<string, number>>((counts, item) => {
    counts[item.status] = (counts[item.status] ?? 0) + 1;
    return counts;
  }, {});
  const homeworkSummary = Object.entries(homeworkCounts)
    .map(([status, count]) => `${count} ${status}`)
    .join(", ");
  const mastered = progress.filter((item) => item.status === "mastered").length;
  const nextStep = progress.find((item) => item.status === "needs_review")
    ?? progress.find((item) => item.status === "learning");

  return [
    `# Progress update: ${student.name}`,
    "",
    `**Subject:** ${student.subject} (${student.level})`,
    `**Goal:** ${student.goals || "No goal recorded yet."}`,
    `**Recent focus:** ${latestLesson ? `${latestLesson.topic} - ${latestLesson.summary}` : "No lessons recorded yet."}`,
    `**Homework:** ${homeworkSummary || "No homework recorded yet."}`,
    `**Progress:** ${mastered} of ${progress.length} tracked topics mastered`,
    `**Next step:** ${nextStep ? `${nextStep.topic} - ${nextStep.notes || "Continue focused practice."}` : "Maintain the current practice rhythm."}`,
  ].join("\n");
}

function generateDetailedReport({ student, lessons, homework, mistakes, progress }: ReportInput) {
  const recentLessons = lessons
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);
  const commonMistakes = Object.entries(getMistakeFrequency(mistakes))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const nextSteps = progress
    .filter((item) => item.status === "needs_review" || item.status === "learning")
    .slice(0, 4);

  return [
    `# Progress report: ${student.name}`,
    "",
    `**Subject:** ${student.subject}`,
    `**Level:** ${student.level}`,
    `**Goals:** ${student.goals || "No goals recorded yet."}`,
    "",
    "## Recent lessons",
    recentLessons.length
      ? recentLessons
          .map((lesson) => `- **${formatDate(lesson.date)}:** ${lesson.topic} - ${lesson.summary}`)
          .join("\n")
      : "- No lessons recorded yet.",
    "",
    "## Homework status",
    homework.length
      ? homework
          .map((item) => `- **${item.title}** (${item.status}, due ${formatDate(item.dueDate)}): ${item.notes || "No notes."}`)
          .join("\n")
      : "- No homework recorded yet.",
    "",
    "## Common mistakes",
    commonMistakes.length
      ? commonMistakes.map(([topic, count]) => `- ${topic}: ${count} recurring note${count > 1 ? "s" : ""}`).join("\n")
      : "- No recurring mistakes recorded yet.",
    "",
    "## Topic progress",
    progress.length
      ? progress.map((item) => `- **${item.topic}:** ${progressLabels[item.status]} - ${item.notes || "No notes."}`).join("\n")
      : "- No progress topics recorded yet.",
    "",
    "## Suggested next steps",
    nextSteps.length
      ? nextSteps.map((item) => `- Review ${item.topic}: ${item.notes || "continue practice."}`).join("\n")
      : "- Maintain current practice rhythm and add new target topics after the next lesson.",
  ].join("\n");
}

export function generateProgressReport(input: ReportInput, template: ReportTemplate = "detailed") {
  return template === "concise" ? generateConciseReport(input) : generateDetailedReport(input);
}
