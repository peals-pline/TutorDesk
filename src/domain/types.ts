export type HomeworkStatus = "assigned" | "submitted" | "reviewed" | "missed";
export type MistakeSeverity = "low" | "medium" | "high";
export type ProgressStatus =
  | "not_started"
  | "learning"
  | "needs_review"
  | "mastered";

export type Student = {
  id: string;
  name: string;
  subject: string;
  level: string;
  notes: string;
  goals: string;
  createdAt: string;
  updatedAt: string;
};

export type Lesson = {
  id: string;
  studentId: string;
  date: string;
  topic: string;
  summary: string;
  materials: string;
  tutorNotes: string;
};

export type Homework = {
  id: string;
  studentId: string;
  title: string;
  dueDate: string;
  status: HomeworkStatus;
  notes: string;
};

export type Mistake = {
  id: string;
  studentId: string;
  topic: string;
  type: string;
  example: string;
  correction: string;
  severity: MistakeSeverity;
};

export type TopicProgress = {
  id: string;
  studentId: string;
  topic: string;
  status: ProgressStatus;
  notes: string;
};

export type TutorDeskData = {
  version: 1;
  students: Student[];
  lessons: Lesson[];
  homework: Homework[];
  mistakes: Mistake[];
  progress: TopicProgress[];
};
