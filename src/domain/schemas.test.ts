import { describe, expect, it } from "vitest";
import { homeworkSchema, mistakeSchema, studentSchema } from "@/domain/schemas";

describe("domain validators", () => {
  it("accepts a valid student profile", () => {
    expect(
      studentSchema.parse({
        name: "Denis",
        subject: "UX research",
        level: "Beginner",
        notes: "",
        goals: "Understand product interviews",
      }),
    ).toMatchObject({ name: "Denis" });
  });

  it("rejects missing homework status", () => {
    expect(() =>
      homeworkSchema.parse({
        title: "Essay",
        dueDate: "2026-06-12",
        status: "done",
        notes: "",
      }),
    ).toThrow();
  });

  it("requires a correction for mistake notes", () => {
    expect(() =>
      mistakeSchema.parse({
        topic: "Grammar",
        type: "tense",
        example: "I seen",
        correction: "",
        severity: "medium",
      }),
    ).toThrow();
  });
});
