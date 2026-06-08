import { useId, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BaseFieldProps = {
  label: string;
  error?: string;
};

export function Input({ label, error, id, className, ...props }: BaseFieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const generatedId = useId();
  const controlId = id ?? `field-${generatedId}`;
  const errorId = `${controlId}-error`;

  return (
    <div className="grid gap-1.5 text-sm font-medium text-stone-700">
      <label htmlFor={controlId}>{label}</label>
      <input
        id={controlId}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        className={cn(
          "rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-sage-500 focus:ring-4 focus:ring-sage-100",
          error && "border-rose-300 focus:border-rose-500 focus:ring-rose-100",
          className,
        )}
        {...props}
      />
      {error ? <span id={errorId} role="alert" className="text-xs text-rose-600">{error}</span> : null}
    </div>
  );
}

export function Textarea({ label, error, id, className, ...props }: BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const generatedId = useId();
  const controlId = id ?? `field-${generatedId}`;
  const errorId = `${controlId}-error`;

  return (
    <div className="grid gap-1.5 text-sm font-medium text-stone-700">
      <label htmlFor={controlId}>{label}</label>
      <textarea
        id={controlId}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        className={cn(
          "min-h-24 rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-sage-500 focus:ring-4 focus:ring-sage-100",
          error && "border-rose-300 focus:border-rose-500 focus:ring-rose-100",
          className,
        )}
        {...props}
      />
      {error ? <span id={errorId} role="alert" className="text-xs text-rose-600">{error}</span> : null}
    </div>
  );
}

export function Select({ label, error, id, className, children, ...props }: BaseFieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const generatedId = useId();
  const controlId = id ?? `field-${generatedId}`;
  const errorId = `${controlId}-error`;

  return (
    <div className="grid gap-1.5 text-sm font-medium text-stone-700">
      <label htmlFor={controlId}>{label}</label>
      <select
        id={controlId}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        className={cn(
          "rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm outline-none transition focus:border-sage-500 focus:ring-4 focus:ring-sage-100",
          error && "border-rose-300 focus:border-rose-500 focus:ring-rose-100",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <span id={errorId} role="alert" className="text-xs text-rose-600">{error}</span> : null}
    </div>
  );
}
