"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertCircle } from "lucide-react";

type BaseProps = {
  label: string;
  hint?: string;
  error?: string;
  icon?: LucideIcon;
  required?: boolean;
};

type FormInputProps = BaseProps & InputHTMLAttributes<HTMLInputElement>;
type FormTextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

function FieldShell({
  label,
  hint,
  error,
  required,
  children,
}: Pick<BaseProps, "label" | "hint" | "error" | "required"> & { children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-semibold text-panel-ink tracking-wide">
          {label}
          {required && <span className="text-amber ml-0.5">*</span>}
        </span>
        {hint && !error && (
          <span className="text-[11px] text-panel-ink-soft">{hint}</span>
        )}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-red text-xs mt-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, hint, error, icon: Icon, required, className, ...props }, ref) => {
    return (
      <FieldShell label={label} hint={hint} error={error} required={required}>
        <div className="relative">
          {Icon && (
            <Icon className="w-4 h-4 text-panel-ink-soft absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
          <input
            ref={ref}
            {...props}
            className={`w-full ${Icon ? "pl-9" : "pl-3"} pr-3 py-2.5 rounded-lg border bg-panel-bg text-sm text-panel-ink placeholder:text-panel-ink-soft/60 transition-colors focus:outline-none focus:ring-2 focus:bg-panel-surface ${
              error
                ? "border-red/50 focus:ring-red/20"
                : "border-panel-border focus:ring-brown-dark/20 focus:border-brown-dark/40"
            } ${className || ""}`}
          />
        </div>
      </FieldShell>
    );
  }
);
FormInput.displayName = "FormInput";

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, hint, error, required, className, ...props }, ref) => {
    return (
      <FieldShell label={label} hint={hint} error={error} required={required}>
        <textarea
          ref={ref}
          {...props}
          className={`w-full px-3 py-2.5 rounded-lg border bg-panel-bg text-sm text-panel-ink placeholder:text-panel-ink-soft/60 transition-colors focus:outline-none focus:ring-2 focus:bg-panel-surface resize-none ${
            error
              ? "border-red/50 focus:ring-red/20"
              : "border-panel-border focus:ring-brown-dark/20 focus:border-brown-dark/40"
          } ${className || ""}`}
        />
      </FieldShell>
    );
  }
);
FormTextarea.displayName = "FormTextarea";
