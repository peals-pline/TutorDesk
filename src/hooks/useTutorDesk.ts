"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  Homework,
  Lesson,
  Mistake,
  Student,
  TopicProgress,
  TutorDeskData,
} from "@/domain/types";
import { backupSchema, type HomeworkInput, type LessonInput, type MistakeInput, type ProgressInput, type StudentInput } from "@/domain/schemas";
import { seedData } from "@/data/seed";
import { uid } from "@/lib/utils";

const STORAGE_KEY = "tutordesk:v1";

function getInitialData(): TutorDeskData {
  if (typeof window === "undefined") return seedData;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return seedData;
  try {
    const parsed = backupSchema.parse(JSON.parse(saved));
    return parsed as TutorDeskData;
  } catch {
    return seedData;
  }
}

export function useTutorDesk() {
  const [data, setData] = useState<TutorDeskData>(seedData);
  const [selectedStudentId, setSelectedStudentId] = useState(seedData.students[0]?.id ?? "");

  useEffect(() => {
    queueMicrotask(() => {
      const initial = getInitialData();
      setData(initial);
      setSelectedStudentId(initial.students[0]?.id ?? "");
    });
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const selectedStudent = useMemo(
    () => data.students.find((student) => student.id === selectedStudentId) ?? data.students[0],
    [data.students, selectedStudentId],
  );

  const scoped = useMemo(() => {
    const studentId = selectedStudent?.id ?? "";
    return {
      lessons: data.lessons.filter((lesson) => lesson.studentId === studentId),
      homework: data.homework.filter((item) => item.studentId === studentId),
      mistakes: data.mistakes.filter((mistake) => mistake.studentId === studentId),
      progress: data.progress.filter((item) => item.studentId === studentId),
    };
  }, [data, selectedStudent]);

  function addStudent(input: StudentInput) {
    const date = new Date().toISOString();
    const student: Student = { id: uid("stu"), ...input, createdAt: date, updatedAt: date };
    setData((current) => ({ ...current, students: [student, ...current.students] }));
    setSelectedStudentId(student.id);
  }

  function updateStudent(studentId: string, input: StudentInput) {
    setData((current) => ({
      ...current,
      students: current.students.map((student) =>
        student.id === studentId ? { ...student, ...input, updatedAt: new Date().toISOString() } : student,
      ),
    }));
  }

  function deleteStudent(studentId: string) {
    setData((current) => {
      const students = current.students.filter((student) => student.id !== studentId);
      setSelectedStudentId(students[0]?.id ?? "");
      return {
        ...current,
        students,
        lessons: current.lessons.filter((lesson) => lesson.studentId !== studentId),
        homework: current.homework.filter((item) => item.studentId !== studentId),
        mistakes: current.mistakes.filter((mistake) => mistake.studentId !== studentId),
        progress: current.progress.filter((item) => item.studentId !== studentId),
      };
    });
  }

  function addLesson(studentId: string, input: LessonInput) {
    const lesson: Lesson = { id: uid("les"), studentId, ...input };
    setData((current) => ({ ...current, lessons: [lesson, ...current.lessons] }));
  }

  function addHomework(studentId: string, input: HomeworkInput) {
    const item: Homework = { id: uid("hw"), studentId, ...input };
    setData((current) => ({ ...current, homework: [item, ...current.homework] }));
  }

  function updateHomeworkStatus(homeworkId: string, status: Homework["status"]) {
    setData((current) => ({
      ...current,
      homework: current.homework.map((item) => (item.id === homeworkId ? { ...item, status } : item)),
    }));
  }

  function addMistake(studentId: string, input: MistakeInput) {
    const mistake: Mistake = { id: uid("mis"), studentId, ...input };
    setData((current) => ({ ...current, mistakes: [mistake, ...current.mistakes] }));
  }

  function addProgress(studentId: string, input: ProgressInput) {
    const item: TopicProgress = { id: uid("prog"), studentId, ...input };
    setData((current) => ({ ...current, progress: [item, ...current.progress] }));
  }

  function exportData() {
    return JSON.stringify(data, null, 2);
  }

  function importData(raw: string) {
    const parsed = backupSchema.parse(JSON.parse(raw)) as TutorDeskData;
    setData(parsed);
    setSelectedStudentId(parsed.students[0]?.id ?? "");
  }

  function resetDemoData() {
    setData(seedData);
    setSelectedStudentId(seedData.students[0]?.id ?? "");
  }

  return {
    data,
    selectedStudent,
    selectedStudentId,
    setSelectedStudentId,
    scoped,
    addStudent,
    updateStudent,
    deleteStudent,
    addLesson,
    addHomework,
    updateHomeworkStatus,
    addMistake,
    addProgress,
    exportData,
    importData,
    resetDemoData,
  };
}
