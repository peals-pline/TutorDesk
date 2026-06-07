"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  GraduationCap,
  HardDrive,
  LayoutDashboard,
  LineChart,
  NotebookPen,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  homeworkSchema,
  lessonSchema,
  mistakeSchema,
  progressSchema,
  studentSchema,
  type HomeworkInput,
  type LessonInput,
  type MistakeInput,
  type ProgressInput,
  type StudentInput,
} from "@/domain/schemas";
import type { HomeworkStatus, ProgressStatus } from "@/domain/types";
import { useTutorDesk } from "@/hooks/useTutorDesk";
import { generateProgressReport, getMistakeFrequency } from "@/lib/report";
import { filterStudents } from "@/lib/studentSearch";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { BrandMark } from "@/components/BrandMark";

const navItems = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["students", "Students", GraduationCap],
  ["lessons", "Lessons", CalendarDays],
  ["homework", "Homework", ClipboardList],
  ["mistakes", "Mistake Journal", NotebookPen],
  ["progress", "Progress", LineChart],
  ["reports", "Reports", FileText],
  ["backup", "Backup", HardDrive],
] as const;

type View = (typeof navItems)[number][0];

const progressLabels: Record<ProgressStatus, string> = {
  not_started: "Not started",
  learning: "Learning",
  needs_review: "Needs review",
  mastered: "Mastered",
};

export function TutorDeskApp() {
  const [view, setView] = useState<View>("dashboard");
  const [copied, setCopied] = useState(false);
  const [studentQuery, setStudentQuery] = useState("");
  const studentSearchRef = useRef<HTMLInputElement>(null);
  const store = useTutorDesk();
  const { selectedStudent, scoped } = store;

  const report = selectedStudent
    ? generateProgressReport({ student: selectedStudent, ...scoped })
    : "";

  const mistakeFrequency = useMemo(() => getMistakeFrequency(scoped.mistakes), [scoped.mistakes]);
  const filteredStudents = useMemo(
    () => filterStudents(store.data.students, studentQuery),
    [store.data.students, studentQuery],
  );

  useEffect(() => {
    function focusStudentSearch(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "k") {
        event.preventDefault();
        studentSearchRef.current?.focus();
      }
    }

    window.addEventListener("keydown", focusStudentSearch);
    return () => window.removeEventListener("keydown", focusStudentSearch);
  }, []);

  async function copyReport() {
    await navigator.clipboard.writeText(report);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="min-h-screen bg-[#fdfcf9] text-stone-950">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-stone-200/80 bg-white px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:px-4 lg:py-6">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold tracking-tight">TutorDesk</p>
              <p className="text-xs text-stone-500">Local-first tutor workspace</p>
            </div>
            <span className="hidden rounded-lg bg-sage-50 px-3 py-1 text-xs font-semibold text-sage-800 lg:inline-flex">
              Local-first
            </span>
          </div>

          <div className="mt-5 rounded-2xl border border-sage-200 bg-sage-50 p-4 text-sm text-sage-950 lg:hidden">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <ShieldCheck size={16} />
              Private by default
            </div>
            <p className="leading-6 text-sage-900/80">
              Student data stays in this browser. Export a JSON backup whenever you need portability.
            </p>
          </div>

          <label className="mt-5 grid gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 lg:hidden">
            Current view
            <select
              value={view}
              onChange={(event) => setView(event.target.value as View)}
              className="h-11 rounded-2xl border border-stone-200 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-stone-800 shadow-sm outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100"
            >
              {navItems.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <nav className="mt-5 hidden gap-2 lg:grid">
            {navItems.map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={cn(
                  "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                  view === id ? "bg-sage-50 text-sage-900 shadow-sm ring-1 ring-sage-100" : "text-stone-600 hover:bg-stone-50",
                )}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </nav>
          <div className="mt-auto hidden space-y-4 pt-8 lg:block">
            <div className="rounded-2xl border border-sage-100 bg-sage-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-sage-900">
                <ShieldCheck size={17} />
                Your data stays local
              </div>
              <p className="text-sm leading-6 text-sage-900/75">
                All student data is stored in this browser. No accounts. No servers. No tracking.
              </p>
              <Button variant="secondary" className="mt-4 w-full">Learn more</Button>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Sparkles size={17} className="text-sage-700" />
                Demo mode
              </div>
              <p className="text-sm leading-6 text-stone-500">
                You are using seed data. Feel free to explore the workspace.
              </p>
              <Button variant="secondary" className="mt-4 w-full" onClick={store.resetDemoData}>
                Reset demo data
              </Button>
            </div>
          </div>
        </aside>

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-7 lg:py-7">
          <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{view === "dashboard" ? "Dashboard" : navItems.find(([id]) => id === view)?.[1]}</h1>
              <p className="mt-1 text-sm text-stone-500">
                {view === "dashboard" ? "Overview of your teaching workspace" : "TutorDesk keeps this workspace local to your browser."}
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto">
              <div className="flex h-11 min-w-0 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-500 shadow-sm focus-within:border-sage-400 focus-within:ring-2 focus-within:ring-sage-100 sm:w-72">
                <Search size={16} />
                <input
                  ref={studentSearchRef}
                  aria-label="Search students"
                  className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-stone-400"
                  placeholder="Search students..."
                  value={studentQuery}
                  onChange={(event) => setStudentQuery(event.target.value)}
                />
                {studentQuery ? (
                  <button
                    type="button"
                    className="rounded-md px-1.5 py-0.5 text-xs font-semibold text-stone-600 hover:bg-stone-100"
                    onClick={() => setStudentQuery("")}
                  >
                    Clear
                  </button>
                ) : (
                  <span className="hidden rounded-md border border-stone-200 px-1.5 py-0.5 text-xs sm:inline">Ctrl K</span>
                )}
              </div>
              <Button onClick={() => setView("students")} className="w-full gap-2 rounded-xl sm:w-auto">
                <Plus size={16} />
                Add student
              </Button>
            </div>
          </header>

          {!selectedStudent ? (
            <EmptyWorkspace onAdd={() => setView("students")} />
          ) : view === "dashboard" ? (
            <Dashboard store={store} students={filteredStudents} studentQuery={studentQuery} onNavigate={setView} />
          ) : (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <section className="space-y-6">
                {view === "students" ? <StudentsPanel store={store} /> : null}
                {view === "lessons" ? <LessonsPanel studentId={selectedStudent.id} store={store} /> : null}
                {view === "homework" ? <HomeworkPanel studentId={selectedStudent.id} store={store} /> : null}
                {view === "mistakes" ? <MistakesPanel studentId={selectedStudent.id} store={store} mistakeFrequency={mistakeFrequency} /> : null}
                {view === "progress" ? <ProgressPanel studentId={selectedStudent.id} store={store} /> : null}
                {view === "reports" ? <ReportsPanel report={report} copied={copied} onCopy={copyReport} /> : null}
                {view === "backup" ? <BackupPanel store={store} /> : null}
              </section>
              <StudentSidebar store={store} students={filteredStudents} studentQuery={studentQuery} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function EmptyWorkspace({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white p-10 text-center">
      <h2 className="text-2xl font-bold">Start with your first student</h2>
      <p className="mx-auto mt-2 max-w-lg text-stone-600">
        Add a profile, record one lesson, and TutorDesk will turn your notes into a simple progress report.
      </p>
      <Button onClick={onAdd} className="mt-5">Create student</Button>
    </div>
  );
}

type Store = ReturnType<typeof useTutorDesk>;

function Panel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-stone-600">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Dashboard({
  store,
  students,
  studentQuery,
  onNavigate,
}: {
  store: Store;
  students: Store["data"]["students"];
  studentQuery: string;
  onNavigate: (view: View) => void;
}) {
  const { data, selectedStudent, selectedStudentId, setSelectedStudentId, scoped } = store;
  const reviewedHomework = data.homework.filter((item) => item.status === "reviewed").length;
  const topicsToReview = data.progress.filter((item) => item.status === "needs_review").length;
  const upcomingLessons = data.lessons.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const progressCounts = scoped.progress.reduce<Record<ProgressStatus, number>>(
    (acc, item) => ({ ...acc, [item.status]: acc[item.status] + 1 }),
    { not_started: 0, learning: 0, needs_review: 0, mastered: 0 },
  );
  const totalProgress = Math.max(1, scoped.progress.length);
  const masteredPercent = Math.round((progressCounts.mastered / totalProgress) * 100);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Users} label="Students" value={data.students.length} helper="Active learners" tone="sage" />
        <Metric icon={CalendarDays} label="Lessons" value={data.lessons.length} helper="Recorded sessions" tone="blue" />
        <Metric icon={ClipboardList} label="Homework reviewed" value={reviewedHomework} helper="Ready for follow-up" tone="amber" />
        <Metric icon={LineChart} label="Topics to review" value={topicsToReview} helper="Across all students" tone="violet" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_1fr_1.45fr]">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_12px_40px_rgba(28,25,23,0.04)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Students</h2>
            <Button variant="secondary" className="rounded-xl px-3 py-1.5 text-xs" onClick={() => onNavigate("students")}>View all</Button>
          </div>
          <div className="space-y-2">
            {students.map((student) => {
              const progress = data.progress.filter((item) => item.studentId === student.id);
              const mastered = progress.filter((item) => item.status === "mastered").length;
              const percent = Math.round((mastered / Math.max(1, progress.length)) * 100);
              return (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={cn(
                    "w-full rounded-xl border px-3 py-3 text-left transition",
                    selectedStudentId === student.id ? "border-sage-200 bg-sage-50" : "border-transparent hover:bg-stone-50",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold">{student.name}</p>
                      <p className="mt-1 text-xs text-stone-500">{student.subject} - {student.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{percent}%</p>
                      <p className="text-xs text-stone-500">Progress</p>
                    </div>
                  </div>
                </button>
              );
            })}
            {!students.length ? (
              <div className="rounded-xl border border-dashed border-stone-200 px-4 py-6 text-center">
                <p className="text-sm font-semibold text-stone-700">No students match “{studentQuery.trim()}”.</p>
                <p className="mt-1 text-xs text-stone-500">Try a name, subject, level, or learning goal.</p>
              </div>
            ) : null}
          </div>
          <Button variant="secondary" className="mt-4 w-full rounded-xl" onClick={() => onNavigate("students")}>
            <Plus size={15} />
            Add student
          </Button>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_12px_40px_rgba(28,25,23,0.04)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Upcoming lessons</h2>
              <Button variant="secondary" className="rounded-xl px-3 py-1.5 text-xs" onClick={() => onNavigate("lessons")}>Open</Button>
            </div>
            <div className="space-y-4">
              {upcomingLessons.map((lesson) => (
                <div key={lesson.id} className="border-b border-stone-100 pb-4 last:border-0 last:pb-0">
                  <p className="text-xs font-bold text-sage-700">{formatDate(lesson.date)}</p>
                  <p className="mt-1 font-bold">{data.students.find((student) => student.id === lesson.studentId)?.name}</p>
                  <p className="mt-1 text-sm text-stone-500">{lesson.topic}</p>
                </div>
              ))}
            </div>
          </div>
          <HomeworkOverview homework={data.homework} />
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_12px_40px_rgba(28,25,23,0.04)]">
            <div className="flex items-start gap-4">
              <div className="grid size-16 shrink-0 place-items-center rounded-full bg-sage-100 text-xl font-bold text-sage-800">
                {selectedStudent?.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">{selectedStudent?.name}</h2>
                    <p className="mt-1 text-sm text-stone-500">{selectedStudent?.subject} - {selectedStudent?.level}</p>
                  </div>
                  <span className="rounded-full bg-sage-50 px-3 py-1 text-xs font-bold text-sage-800">Active</span>
                </div>
                <p className="mt-2 text-sm text-stone-500">Goal: {selectedStudent?.goals || "No goal recorded yet."}</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-stone-100 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold">Progress overview</h3>
                <span className="text-sm font-bold">{masteredPercent}%</span>
              </div>
              <div className="flex h-2 overflow-hidden rounded-full bg-stone-100">
                <div className="bg-sage-700" style={{ width: `${(progressCounts.mastered / totalProgress) * 100}%` }} />
                <div className="bg-sage-300" style={{ width: `${(progressCounts.learning / totalProgress) * 100}%` }} />
                <div className="bg-amber-300" style={{ width: `${(progressCounts.needs_review / totalProgress) * 100}%` }} />
                <div className="bg-stone-200" style={{ width: `${(progressCounts.not_started / totalProgress) * 100}%` }} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-stone-500 sm:grid-cols-4">
                <span>Mastered {progressCounts.mastered}</span>
                <span>Learning {progressCounts.learning}</span>
                <span>Review {progressCounts.needs_review}</span>
                <span>New {progressCounts.not_started}</span>
              </div>
            </div>
          </div>

          <Timeline lessons={scoped.lessons} compact />
          <CommonMistakes mistakes={scoped.mistakes} />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_12px_40px_rgba(28,25,23,0.04)]">
          <h2 className="text-lg font-bold">Quick actions</h2>
          <p className="mt-1 text-sm text-stone-600">Jump into the records tutors update after every session.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ActionTile icon={CalendarDays} label="Add lesson" onClick={() => onNavigate("lessons")} />
            <ActionTile icon={ClipboardList} label="Assign homework" onClick={() => onNavigate("homework")} />
            <ActionTile icon={NotebookPen} label="Log mistake" onClick={() => onNavigate("mistakes")} />
            <ActionTile icon={LineChart} label="Update progress" onClick={() => onNavigate("progress")} />
          </div>
        </div>
        <div className="rounded-2xl border border-sage-200 bg-sage-50 p-5 text-sage-950 shadow-[0_12px_40px_rgba(76,99,64,0.08)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Generate report</h2>
              <p className="mt-2 text-sm leading-6 text-sage-900/80">
                Turn recent lessons, homework, mistakes, and topic progress into a Markdown update.
              </p>
            </div>
            <FileText className="text-sage-700" size={28} />
          </div>
          <Button className="mt-5" onClick={() => onNavigate("reports")}>Open reports</Button>
        </div>
      </div>
    </div>
  );
}

function ActionTile({ icon: Icon, label, onClick }: { icon: typeof CalendarDays; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="grid min-h-24 place-items-center rounded-2xl border border-stone-200 bg-stone-50 px-3 py-4 text-center text-sm font-bold leading-5 text-stone-700 transition hover:border-sage-300 hover:bg-sage-50 hover:text-sage-900"
    >
      <span className="grid size-10 place-items-center rounded-2xl bg-white text-sage-700 shadow-sm">
        <Icon size={20} />
      </span>
      {label}
    </button>
  );
}

function Metric({ icon: Icon, label, value, helper, tone }: { icon: typeof Users; label: string; value: number; helper: string; tone: "sage" | "amber" | "blue" | "violet" }) {
  const tones = {
    sage: "bg-sage-50 text-sage-900 border-sage-100",
    amber: "bg-amber-50 text-amber-950 border-amber-100",
    blue: "bg-sky-50 text-sky-950 border-sky-100",
    violet: "bg-violet-50 text-violet-950 border-violet-100",
  };
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_12px_40px_rgba(28,25,23,0.04)]">
      <div className="flex items-center gap-4">
        <span className={cn("grid size-12 place-items-center rounded-2xl border", tones[tone])}>
          <Icon size={22} />
        </span>
        <div>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-sm font-semibold text-stone-700">{label}</p>
          <p className="mt-1 text-xs text-stone-500">{helper}</p>
        </div>
      </div>
    </div>
  );
}

function StudentSidebar({
  store,
  students,
  studentQuery,
}: {
  store: Store;
  students: Store["data"]["students"];
  studentQuery: string;
}) {
  const { selectedStudentId, setSelectedStudentId, selectedStudent, scoped } = store;
  return (
    <aside className="space-y-4">
      <div className="rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm">
        <h2 className="font-bold">Students</h2>
        <div className="mt-3 space-y-2">
          {students.map((student) => (
            <button
              key={student.id}
              onClick={() => setSelectedStudentId(student.id)}
              className={cn(
                "w-full rounded-2xl px-3 py-3 text-left transition",
                selectedStudentId === student.id ? "bg-sage-700 text-white" : "bg-stone-50 text-stone-700 hover:bg-stone-100",
              )}
            >
              <span className="block text-sm font-bold">{student.name}</span>
              <span className="text-xs opacity-75">{student.subject} - {student.level}</span>
            </button>
          ))}
          {!students.length ? (
            <p className="rounded-xl border border-dashed border-stone-200 px-3 py-5 text-center text-sm text-stone-500">
              No students match “{studentQuery.trim()}”.
            </p>
          ) : null}
        </div>
      </div>
      {selectedStudent ? (
        <div className="rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm">
          <h3 className="font-bold">{selectedStudent.name}</h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">{selectedStudent.goals}</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <MiniStat label="Lessons" value={scoped.lessons.length} />
            <MiniStat label="Mistakes" value={scoped.mistakes.length} />
            <MiniStat label="Homework" value={scoped.homework.length} />
            <MiniStat label="Topics" value={scoped.progress.length} />
          </div>
        </div>
      ) : null}
    </aside>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-3">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function StudentsPanel({ store }: { store: Store }) {
  const form = useForm<StudentInput>({
    resolver: zodResolver(studentSchema),
    defaultValues: { name: "", subject: "", level: "", notes: "", goals: "" },
  });
  const selected = store.selectedStudent;

  return (
    <Panel title="Students" description="Create a profile for every learner you work with.">
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={form.handleSubmit((values) => {
          store.addStudent(values);
          form.reset();
        })}
      >
        <Input label="Name" {...form.register("name")} error={form.formState.errors.name?.message} placeholder="Ava Brooks" />
        <Input label="Subject" {...form.register("subject")} error={form.formState.errors.subject?.message} placeholder="English, math, chemistry" />
        <Input label="Level" {...form.register("level")} error={form.formState.errors.level?.message} placeholder="B1, Grade 8, beginner" />
        <Input label="Goals" {...form.register("goals")} error={form.formState.errors.goals?.message} placeholder="Improve speaking confidence" />
        <div className="md:col-span-2">
          <Textarea label="Notes" {...form.register("notes")} error={form.formState.errors.notes?.message} placeholder="Learning preferences, parent context, recurring blockers..." />
        </div>
        <div className="flex gap-3 md:col-span-2">
          <Button type="submit">Add student</Button>
          {selected ? (
            <Button type="button" variant="danger" onClick={() => store.deleteStudent(selected.id)} className="gap-2">
              <Trash2 size={16} />
              Delete selected
            </Button>
          ) : null}
        </div>
      </form>
    </Panel>
  );
}

function LessonsPanel({ studentId, store }: { studentId: string; store: Store }) {
  const form = useForm<LessonInput>({
    resolver: zodResolver(lessonSchema),
    defaultValues: { date: new Date().toISOString().slice(0, 10), topic: "", summary: "", materials: "", tutorNotes: "" },
  });
  return (
    <Panel title="Lessons" description="Record what happened, what materials you used, and what to remember next time.">
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit((values) => {
          store.addLesson(studentId, values);
          form.reset({ date: new Date().toISOString().slice(0, 10), topic: "", summary: "", materials: "", tutorNotes: "" });
        })}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Date" type="date" {...form.register("date")} error={form.formState.errors.date?.message} />
          <Input label="Topic" {...form.register("topic")} error={form.formState.errors.topic?.message} placeholder="Essay planning" />
        </div>
        <Textarea label="Summary" {...form.register("summary")} error={form.formState.errors.summary?.message} placeholder="What did you cover?" />
        <Textarea label="Materials used" {...form.register("materials")} error={form.formState.errors.materials?.message} placeholder="Worksheets, pages, links..." />
        <Textarea label="Tutor notes" {...form.register("tutorNotes")} error={form.formState.errors.tutorNotes?.message} placeholder="Private notes for next lesson" />
        <Button type="submit">Add lesson</Button>
      </form>
      <Timeline lessons={store.scoped.lessons} />
    </Panel>
  );
}

function HomeworkPanel({ studentId, store }: { studentId: string; store: Store }) {
  const form = useForm<HomeworkInput>({
    resolver: zodResolver(homeworkSchema),
    defaultValues: { title: "", dueDate: new Date().toISOString().slice(0, 10), status: "assigned", notes: "" },
  });
  return (
    <Panel title="Homework" description="Assign work, review status, and keep follow-up notes close to the lesson record.">
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={form.handleSubmit((values) => {
          store.addHomework(studentId, values);
          form.reset({ title: "", dueDate: new Date().toISOString().slice(0, 10), status: "assigned", notes: "" });
        })}
      >
        <Input label="Title" {...form.register("title")} error={form.formState.errors.title?.message} placeholder="Write one paragraph" />
        <Input label="Due date" type="date" {...form.register("dueDate")} error={form.formState.errors.dueDate?.message} />
        <label className="grid gap-1.5 text-sm font-medium text-stone-700">
          Status
          <select className="rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm" {...form.register("status")}>
            {["assigned", "submitted", "reviewed", "missed"].map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <Input label="Notes" {...form.register("notes")} error={form.formState.errors.notes?.message} placeholder="What should you check?" />
        <div className="md:col-span-2">
          <Button type="submit">Assign homework</Button>
        </div>
      </form>
      <HomeworkList homework={store.scoped.homework} onStatus={store.updateHomeworkStatus} />
    </Panel>
  );
}

function MistakesPanel({ studentId, store, mistakeFrequency }: { studentId: string; store: Store; mistakeFrequency: Record<string, number> }) {
  const form = useForm<MistakeInput>({
    resolver: zodResolver(mistakeSchema),
    defaultValues: { topic: "", type: "", example: "", correction: "", severity: "medium" },
  });
  return (
    <Panel title="Mistake Journal" description="Capture recurring mistakes so every lesson can target patterns, not isolated errors.">
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={form.handleSubmit((values) => {
          store.addMistake(studentId, values);
          form.reset({ topic: "", type: "", example: "", correction: "", severity: "medium" });
        })}
      >
        <Input label="Topic" {...form.register("topic")} error={form.formState.errors.topic?.message} placeholder="Grammar" />
        <Input label="Mistake type" {...form.register("type")} error={form.formState.errors.type?.message} placeholder="tense choice" />
        <Input label="Example" {...form.register("example")} error={form.formState.errors.example?.message} placeholder="Original mistake" />
        <Input label="Correction" {...form.register("correction")} error={form.formState.errors.correction?.message} placeholder="Correct version" />
        <label className="grid gap-1.5 text-sm font-medium text-stone-700">
          Severity
          <select className="rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm" {...form.register("severity")}>
            {["low", "medium", "high"].map((severity) => <option key={severity}>{severity}</option>)}
          </select>
        </label>
        <div className="flex items-end">
          <Button type="submit">Add mistake</Button>
        </div>
      </form>
      <MistakeFrequency frequency={mistakeFrequency} />
      <div className="mt-4 space-y-2">
        {store.scoped.mistakes.map((mistake) => (
          <div key={mistake.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-3 text-sm">
            <p className="font-bold">{mistake.topic} - {mistake.type}</p>
            <p className="mt-1 text-stone-600">
              {mistake.example} {"->"} {mistake.correction}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ProgressPanel({ studentId, store }: { studentId: string; store: Store }) {
  const form = useForm<ProgressInput>({
    resolver: zodResolver(progressSchema),
    defaultValues: { topic: "", status: "learning", notes: "" },
  });
  return (
    <Panel title="Progress" description="Track topic mastery with clear states that are easy to explain to parents or students.">
      <form
        className="grid gap-4 md:grid-cols-3"
        onSubmit={form.handleSubmit((values) => {
          store.addProgress(studentId, values);
          form.reset({ topic: "", status: "learning", notes: "" });
        })}
      >
        <Input label="Topic" {...form.register("topic")} error={form.formState.errors.topic?.message} placeholder="Linear equations" />
        <label className="grid gap-1.5 text-sm font-medium text-stone-700">
          Status
          <select className="rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm" {...form.register("status")}>
            {Object.entries(progressLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <Input label="Notes" {...form.register("notes")} error={form.formState.errors.notes?.message} placeholder="What should happen next?" />
        <div className="md:col-span-3">
          <Button type="submit">Add topic progress</Button>
        </div>
      </form>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {store.scoped.progress.map((item) => (
          <div key={item.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold">{item.topic}</p>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-stone-600">{progressLabels[item.status]}</span>
            </div>
            <p className="mt-2 text-sm text-stone-600">{item.notes || "No notes yet."}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ReportsPanel({ report, copied, onCopy }: { report: string; copied: boolean; onCopy: () => void }) {
  return (
    <Panel title="Reports" description="Generate a clean Markdown progress report from the selected student's local records.">
      <div className="mb-4 flex flex-wrap gap-3">
        <Button onClick={onCopy} className="gap-2">
          <CheckCircle2 size={16} />
          {copied ? "Copied" : "Copy Markdown"}
        </Button>
      </div>
      <pre className="max-h-[520px] overflow-auto rounded-3xl border border-stone-200 bg-stone-950 p-5 text-sm leading-6 text-stone-100">
        {report}
      </pre>
    </Panel>
  );
}

function BackupPanel({ store }: { store: Store }) {
  const [raw, setRaw] = useState("");
  const [message, setMessage] = useState("");
  return (
    <Panel title="Backup" description="Export or import JSON. TutorDesk does not need an account for the MVP.">
      <div className="grid gap-4">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setRaw(store.exportData())}>Export JSON</Button>
          <Button variant="secondary" onClick={() => {
            try {
              store.importData(raw);
              setMessage("Backup imported successfully.");
            } catch {
              setMessage("Import failed. Check that this is a TutorDesk v1 JSON backup.");
            }
          }}>Import JSON</Button>
          <Button variant="ghost" onClick={store.resetDemoData}>Reset demo data</Button>
        </div>
        <textarea
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          className="min-h-80 rounded-3xl border border-stone-200 bg-white p-4 font-mono text-xs text-stone-800 shadow-sm"
          placeholder="Exported TutorDesk JSON will appear here. Paste a backup here to import."
        />
        {message ? <p className="text-sm font-semibold text-sage-800">{message}</p> : null}
      </div>
    </Panel>
  );
}

function Timeline({ lessons, compact }: { lessons: Store["scoped"]["lessons"]; compact?: boolean }) {
  return (
    <div className={cn("rounded-2xl p-4", compact ? "border border-stone-200 bg-white shadow-[0_12px_40px_rgba(28,25,23,0.04)]" : "bg-stone-50")}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold">Recent lessons</h3>
        {compact ? <Button variant="secondary" className="rounded-xl px-3 py-1.5 text-xs">View all</Button> : null}
      </div>
      <div className="mt-3 space-y-1">
        {lessons.length ? lessons.slice(0, compact ? 3 : 5).map((lesson) => (
          <div key={lesson.id} className="grid gap-3 rounded-xl px-1 py-3 text-sm sm:grid-cols-[92px_1fr_auto]">
            <p className="text-xs text-stone-500">{formatDate(lesson.date)}</p>
            <p className="font-bold">{lesson.topic}</p>
            <span className="rounded-full bg-sage-50 px-2.5 py-1 text-xs font-bold text-sage-800">
              Good progress
            </span>
            {!compact ? <p className="sm:col-start-2 sm:col-span-2 text-sm leading-6 text-stone-600">{lesson.summary}</p> : null}
          </div>
        )) : <p className="text-sm text-stone-500">No lessons yet. Add the first note after today&apos;s session.</p>}
      </div>
    </div>
  );
}

function HomeworkOverview({ homework }: { homework: Store["data"]["homework"] }) {
  const statuses: HomeworkStatus[] = ["assigned", "submitted", "reviewed", "missed"];
  const colors: Record<HomeworkStatus, string> = {
    assigned: "bg-sky-300",
    submitted: "bg-sage-300",
    reviewed: "bg-violet-300",
    missed: "bg-rose-300",
  };
  const max = Math.max(1, ...statuses.map((status) => homework.filter((item) => item.status === status).length));
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_12px_40px_rgba(28,25,23,0.04)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Homework overview</h2>
        <Button variant="secondary" className="rounded-xl px-3 py-1.5 text-xs">View all</Button>
      </div>
      <div className="space-y-3">
        {statuses.map((status) => {
          const count = homework.filter((item) => item.status === status).length;
          return (
            <div key={status} className="grid grid-cols-[92px_1fr_24px] items-center gap-3 text-sm">
              <span className="capitalize text-stone-600">{status}</span>
              <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                <div className={cn("h-2 rounded-full", colors[status])} style={{ width: `${(count / max) * 100}%` }} />
              </div>
              <span className="text-right font-bold">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CommonMistakes({ mistakes }: { mistakes: Store["scoped"]["mistakes"] }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_12px_40px_rgba(28,25,23,0.04)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Common mistakes</h2>
        <Button variant="secondary" className="rounded-xl px-3 py-1.5 text-xs">View journal</Button>
      </div>
      <div className="space-y-2">
        {mistakes.length ? mistakes.slice(0, 4).map((mistake, index) => (
          <div key={mistake.id} className="grid grid-cols-[34px_1fr_auto] items-center gap-3 rounded-xl py-2">
            <span className="grid size-8 place-items-center rounded-lg bg-rose-50 text-sm font-bold text-rose-700">{index + 1}</span>
            <p className="text-sm text-stone-700">{mistake.type} in {mistake.topic.toLowerCase()}</p>
            <span className={cn(
              "rounded-full px-2.5 py-1 text-xs font-bold capitalize",
              mistake.severity === "high" && "bg-rose-50 text-rose-700",
              mistake.severity === "medium" && "bg-amber-50 text-amber-700",
              mistake.severity === "low" && "bg-sage-50 text-sage-700",
            )}>
              {mistake.severity}
            </span>
          </div>
        )) : <p className="text-sm text-stone-500">No recurring mistakes yet.</p>}
      </div>
    </div>
  );
}

function HomeworkList({ homework, compact, onStatus }: { homework: Store["scoped"]["homework"]; compact?: boolean; onStatus?: (id: string, status: HomeworkStatus) => void }) {
  return (
    <div className="rounded-3xl bg-stone-50 p-4">
      <h3 className="font-bold">Homework</h3>
      <div className="mt-3 space-y-2">
        {homework.length ? homework.slice(0, compact ? 4 : undefined).map((item) => (
          <div key={item.id} className="rounded-2xl border border-stone-200 bg-white p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold">{item.title}</p>
                <p className="text-xs text-stone-500">Due {formatDate(item.dueDate)}</p>
              </div>
              {onStatus ? (
                <select
                  value={item.status}
                  onChange={(event) => onStatus(item.id, event.target.value as HomeworkStatus)}
                  className="rounded-full border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-semibold"
                >
                  {["assigned", "submitted", "reviewed", "missed"].map((status) => <option key={status}>{status}</option>)}
                </select>
              ) : (
                <span className="rounded-full bg-sage-100 px-2 py-1 text-xs font-bold text-sage-900">{item.status}</span>
              )}
            </div>
            {!compact ? <p className="mt-2 text-sm text-stone-600">{item.notes}</p> : null}
          </div>
        )) : <p className="text-sm text-stone-500">No homework yet.</p>}
      </div>
    </div>
  );
}

function MistakeFrequency({ frequency }: { frequency: Record<string, number> }) {
  const rows = Object.entries(frequency).sort((a, b) => b[1] - a[1]);
  return (
    <div className="rounded-3xl bg-stone-50 p-4">
      <h3 className="font-bold">Mistake frequency</h3>
      <div className="mt-3 space-y-3">
        {rows.length ? rows.map(([topic, count]) => (
          <div key={topic}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-semibold">{topic}</span>
              <span className="text-stone-500">{count}</span>
            </div>
            <div className="h-2 rounded-full bg-stone-200">
              <div className="h-2 rounded-full bg-sage-600" style={{ width: `${Math.min(100, count * 34)}%` }} />
            </div>
          </div>
        )) : <p className="text-sm text-stone-500">No recurring mistakes yet.</p>}
      </div>
    </div>
  );
}
