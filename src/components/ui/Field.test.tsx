import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input, Select, Textarea } from "@/components/ui/Field";

describe("form fields", () => {
  it("associates input labels and errors with the control", () => {
    render(<Input label="Student name" error="Name is required" />);

    const input = screen.getByLabelText("Student name");
    const error = screen.getByText("Name is required");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", error.id);
  });

  it("does not expose an invalid state when a textarea has no error", () => {
    render(<Textarea label="Tutor notes" />);

    expect(screen.getByLabelText("Tutor notes")).not.toHaveAttribute("aria-invalid");
  });

  it("gives select controls an accessible label", () => {
    render(
      <Select label="Status">
        <option>Learning</option>
      </Select>,
    );

    expect(screen.getByLabelText("Status")).toHaveTextContent("Learning");
  });
});
