import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-active)] shadow-sm",
  secondary:
    "bg-[var(--color-surface-elevated)] text-[var(--color-text)] hover:bg-[var(--color-border)] border border-[var(--color-border)]",
  outline:
    "bg-transparent text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface)]",
  ghost: "bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]",
  danger: "bg-[var(--color-error)] text-white hover:opacity-90",
  success: "bg-[var(--color-success)] text-white hover:opacity-90",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[12px] gap-1.5 rounded-[var(--radius-md)]",
  md: "h-9 px-3.5 text-[13px] gap-2 rounded-[var(--radius-md)]",
  lg: "h-11 px-5 text-[14px] gap-2 rounded-[var(--radius-lg)]",
  icon: "h-9 w-9 p-0 justify-center rounded-[var(--radius-md)]",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", size = "md", loading, disabled, leftIcon, rightIcon, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center font-medium transition-[background,transform,opacity,box-shadow] duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]",
        "disabled:pointer-events-none disabled:opacity-45",
        "active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
});
