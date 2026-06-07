import { z } from "zod";

const requiredText = z.string().trim().min(1, "Required");
const optionalText = z.string().trim();

export const studentSchema = z.object({
  name: requiredText.max(80),
  subject: requiredText.max(60),
  level: requiredText.max(60),
  notes: optionalText,
  goals: optionalText,
});

export const lessonSchema = z.object({
  date: requiredText,
  topic: requiredText.max(100),
  summary: requiredText.max(1000),
  materials: optionalText,
  tutorNotes: optionalText,
});

export const homeworkSchema = z.object({
  title: requiredText.max(120),
  dueDate: requiredText,
  status: z.enum(["assigned", "submitted", "reviewed", "missed"]),
  notes: optionalText,
});

export const mistakeSchema = z.object({
  topic: requiredText.max(100),
  type: requiredText.max(80),
  example: requiredText.max(400),
  correction: requiredText.max(400),
  severity: z.enum(["low", "medium", "high"]),
});

export const progressSchema = z.object({
  topic: requiredText.max(100),
  status: z.enum(["not_started", "learning", "needs_review", "mastered"]),
  notes: optionalText,
});

export const backupSchema = z.object({
  version: z.literal(1),
  students: z.array(z.any()),
  lessons: z.array(z.any()),
  homework: z.array(z.any()),
  mistakes: z.array(z.any()),
  progress: z.array(z.any()),
});

export type StudentInput = z.infer<typeof studentSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
export type HomeworkInput = z.infer<typeof homeworkSchema>;
export type MistakeInput = z.infer<typeof mistakeSchema>;
export type ProgressInput = z.infer<typeof progressSchema>;
