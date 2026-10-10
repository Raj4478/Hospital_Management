/* eslint-disable react-refresh/only-export-components */
import { forwardRef, useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, ChevronLeft, ChevronRight, Inbox, Loader2, Search, X } from "lucide-react";
import { initials } from "../lib/format";

export const cx = (...classes) => classes.filter(Boolean).join(" ");

/* ── Buttons ─────────────────────────────────────────────────────────── */

const BUTTON_VARIANTS = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm disabled:bg-brand-300",
  secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm disabled:text-slate-400",
  ghost: "text-slate-600 hover:bg-slate-100 disabled:text-slate-300",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm disabled:bg-red-300",
  subtle: "bg-brand-50 text-brand-700 hover:bg-brand-100 disabled:opacity-50",
};
const BUTTON_SIZES = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
  icon: "h-9 w-9 justify-center",
};

export const Button = forwardRef(function Button(
  { variant = "primary", size = "md", loading = false, icon: Icon, className, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      className={cx(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed",
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      {children}
    </button>
  );
});

/* ── Form controls ───────────────────────────────────────────────────── */

const controlBase =
  "block w-full rounded-lg border bg-white text-sm text-slate-900 placeholder:text-slate-400 shadow-sm " +
  "transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 " +
  "disabled:bg-slate-50 disabled:text-slate-500";
const controlBorder = (error) => (error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200");

export function Field({ label, error, hint, required, children, className }) {
  const id = useId();
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {typeof children === "function" ? children(id) : children}
      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef(function Input({ label, error, hint, required, className, ...props }, ref) {
  return (
    <Field label={label} error={error} hint={hint} required={required} className={className}>
      {(id) => (
        <input id={id} ref={ref} aria-invalid={!!error} className={cx(controlBase, controlBorder(error), "h-10 px-3")} {...props} />
      )}
    </Field>
  );
});

export const Select = forwardRef(function Select({ label, error, hint, required, className, children, ...props }, ref) {
  return (
    <Field label={label} error={error} hint={hint} required={required} className={className}>
      {(id) => (
        <select id={id} ref={ref} aria-invalid={!!error} className={cx(controlBase, controlBorder(error), "h-10 px-3 pr-8")} {...props}>
          {children}
        </select>
      )}
    </Field>
  );
});

export const Textarea = forwardRef(function Textarea({ label, error, hint, required, className, ...props }, ref) {
  return (
    <Field label={label} error={error} hint={hint} required={required} className={className}>
      {(id) => (
        <textarea id={id} ref={ref} rows={3} aria-invalid={!!error} className={cx(controlBase, controlBorder(error), "px-3 py-2")} {...props} />
      )}
    </Field>
  );
});

export const FileInput = forwardRef(function FileInput({ label, hint, className, ...props }, ref) {
  return (
    <Field label={label} hint={hint || "PNG, JPG or WEBP, up to 2 MB"} className={className}>
      {(id) => (
        <input
          id={id}
          ref={ref}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          {...props}
        />
      )}
    </Field>
  );
});

export function SearchInput({ value, onChange, placeholder = "Search…", className }) {
  return (
    <div className={cx("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cx(controlBase, "h-10 border-slate-200 pl-9 pr-3")}
      />
    </div>
  );
}

/** Pill-style segmented filter. */
export function Tabs({ value, onChange, options }) {
  return (
    <div className="inline-flex rounded-lg bg-slate-100 p-1" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            value === o.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          {o.label}
          {o.count != null && <span className="ml-1.5 text-xs text-slate-400">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ── Display ─────────────────────────────────────────────────────────── */

export function Card({ className, children, ...props }) {
  return (
    <div className={cx("rounded-xl border border-slate-200 bg-white shadow-card", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

const TONES = {
  slate: "bg-slate-100 text-slate-700 ring-slate-500/10",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/10",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/15",
  red: "bg-red-50 text-red-700 ring-red-600/10",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/10",
};
const DOTS = { slate: "bg-slate-400", blue: "bg-blue-500", green: "bg-emerald-500", amber: "bg-amber-500", red: "bg-red-500", violet: "bg-violet-500" };

export function Badge({ tone = "slate", dot = false, className, children }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", TONES[tone], className)}>
      {dot && <span className={cx("h-1.5 w-1.5 rounded-full", DOTS[tone])} />}
      {children}
    </span>
  );
}

const AVATAR_COLORS = ["bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-800", "bg-violet-100 text-violet-700", "bg-rose-100 text-rose-700", "bg-cyan-100 text-cyan-700"];

export function Avatar({ name = "", src, size = "md" }) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-base" };
  const color = AVATAR_COLORS[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
  if (src) return <img src={src} alt="" className={cx("shrink-0 rounded-full object-cover", sizes[size])} />;
  return (
    <span className={cx("inline-flex shrink-0 items-center justify-center rounded-full font-semibold", sizes[size], color)}>
      {initials(name)}
    </span>
  );
}

export function Spinner({ className }) {
  return <Loader2 className={cx("h-5 w-5 animate-spin text-brand-600", className)} />;
}

export function Skeleton({ className }) {
  return <div className={cx("animate-pulse rounded-md bg-slate-200/70", className)} />;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Couldn't load this"
      description={message}
      action={onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}
    />
  );
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Pagination({ page, pages, total, limit, onPage }) {
  if (!total) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(total, page * limit);
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
      <span>
        {from}–{to} of {total}
      </span>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/** Two-column "label: value" list for detail views. */
export function DetailList({ items }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
          <dd className="mt-1 text-sm text-slate-900">{value || <span className="text-slate-400">—</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ── Overlays ────────────────────────────────────────────────────────── */

function useEscape(open, onClose) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
}

export function Modal({ open, onClose, title, description, children, footer, size = "md" }) {
  useEscape(open, onClose);
  if (!open) return null;
  const widths = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" };
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 animate-fade-in bg-slate-900/40 backdrop-blur-[1px]" onClick={onClose} />
      <div className={cx("relative flex max-h-[92vh] w-full animate-slide-up flex-col rounded-t-2xl bg-white shadow-pop sm:rounded-2xl", widths[size])}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          </div>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-3">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export function Drawer({ open, onClose, title, children, footer }) {
  useEscape(open, onClose);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 animate-fade-in bg-slate-900/40" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md animate-slide-in flex-col bg-white shadow-pop">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-3">{footer}</div>}
      </aside>
    </div>,
    document.body
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = "Confirm", loading, tone = "danger" }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={tone} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="text-sm text-slate-600">{description}</p>
    </Modal>
  );
}
