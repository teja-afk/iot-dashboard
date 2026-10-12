"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as MenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Columns3,
  Eye,
  EyeOff,
  Inbox,
  Loader2,
  Minus,
  Search,
  X,
} from "lucide-react";

const SQUIRCLE = "[corner-shape:squircle]";
const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const CONTROL = {
  sm: "h-8 rounded-[9px] px-2.5 text-[12.5px]",
  md: "h-9 rounded-[10px] px-3 text-[13px]",
  lg: "h-10 rounded-[11px] px-3.5 text-[13.5px]",
} as const;

type ControlSize = keyof typeof CONTROL;

const FIELD =
  "bg-card text-foreground ring-1 ring-inset ring-input outline-none transition-[box-shadow,background-color] " +
  "placeholder:text-muted-foreground hover:ring-foreground/25 " +
  "focus-visible:ring-2 focus-visible:ring-ring " +
  "aria-invalid:ring-destructive/60 aria-invalid:focus-visible:ring-destructive/50 " +
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:ring-input";

const LAYER = {
  popover: 60,
  dialog: 70,
  toast: 80,
} as const;

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(function Label({ className, ...props }, ref) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        "text-[12.5px] leading-none font-medium text-foreground select-none",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});

interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

export function useFieldProps<T extends { id?: string; "aria-describedby"?: string; "aria-invalid"?: unknown; required?: boolean }>(
  props: T,
): T {
  const field = React.useContext(FieldContext);
  if (!field) return props;
  return {
    ...props,
    id: props.id ?? field.id,
    "aria-describedby": [field.describedBy, props["aria-describedby"]].filter(Boolean).join(" ") || undefined,
    "aria-invalid": props["aria-invalid"] ?? (field.invalid || undefined),
    required: props.required ?? (field.required || undefined),
  };
}

export interface FieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  optional?: boolean;
  required?: boolean;
  inline?: boolean;
  children: React.ReactNode;
}

export function Field({
  label,
  hint,
  error,
  optional,
  required = false,
  inline = false,
  className,
  children,
  ...rest
}: FieldProps) {
  const id = React.useId();
  const msgId = `${id}-msg`;
  const message = error ?? hint;
  const value = React.useMemo<FieldContextValue>(
    () => ({ id, describedBy: message ? msgId : undefined, invalid: Boolean(error), required }),
    [id, msgId, message, error, required],
  );

  const labelEl = (
    <Label htmlFor={id} className="flex items-center gap-1.5">
      {label}
      {optional && <span className="font-normal text-muted-foreground">Optional</span>}
    </Label>
  );

  return (
    <FieldContext.Provider value={value}>
      {inline ? (
        <div className={cn("grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2.5 gap-y-1", className)} {...rest}>
          {children}
          {labelEl}
          {message && (
            <p id={msgId} className={cn("col-start-2 text-[12px] leading-snug", error ? "text-red-700 dark:text-red-400" : "text-muted-foreground")}>
              {message}
            </p>
          )}
        </div>
      ) : (
        <div className={cn("grid gap-1.5", className)} {...rest}>
          {labelEl}
          {children}
          {message && (
            <p id={msgId} className={cn("text-[12px] leading-snug", error ? "text-red-700 dark:text-red-400" : "text-muted-foreground")}>
              {message}
            </p>
          )}
        </div>
      )}
    </FieldContext.Provider>
  );
}

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {}

export const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  function Checkbox({ className, ...props }, ref) {
    const fieldProps = useFieldProps(props);
    return (
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          "peer grid size-4 shrink-0 cursor-pointer place-items-center rounded-[5px] bg-card ring-1 ring-inset ring-input transition-colors",
          "hover:ring-foreground/35",
          "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:ring-primary",
          "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground data-[state=indeterminate]:ring-primary",
          "aria-invalid:ring-destructive/70 disabled:cursor-not-allowed disabled:opacity-50",
          FOCUS,
          "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
        {...fieldProps}
      >
        <CheckboxPrimitive.Indicator className="grid place-items-center">
          {fieldProps.checked === "indeterminate" ? (
            <Minus className="size-3" strokeWidth={3} aria-hidden />
          ) : (
            <Check className="size-3" strokeWidth={3} aria-hidden />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  },
);

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: ControlSize;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = "md", leading, trailing, className, wrapperClassName, type = "text", ...props },
  ref,
) {
  const fieldProps = useFieldProps(props);
  const inner = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(ref, () => inner.current as HTMLInputElement);

  if (!leading && !trailing) {
    return (
      <input
        ref={inner}
        type={type}
        className={cn("w-full min-w-0", CONTROL[size], FIELD, SQUIRCLE, "file:mr-2 file:border-0 file:bg-transparent file:font-medium", className)}
        {...fieldProps}
      />
    );
  }

  return (
    <div
      onPointerDown={(e) => {
        if (e.target !== inner.current && !(e.target as HTMLElement).closest("button")) {
          e.preventDefault();
          inner.current?.focus();
        }
      }}
      className={cn(
        "flex w-full min-w-0 cursor-text items-center gap-2 bg-card text-foreground ring-1 ring-inset ring-input transition-[box-shadow]",
        "hover:ring-foreground/25 has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring",
        "has-[input[aria-invalid=true]]:ring-destructive/60 has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50",
        "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
        CONTROL[size],
        SQUIRCLE,
        wrapperClassName,
      )}
    >
      {leading && <span className="flex shrink-0 items-center text-muted-foreground">{leading}</span>}
      <input
        ref={inner}
        type={type}
        className={cn(
          "h-full w-full min-w-0 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
          className,
        )}
        {...fieldProps}
      />
      {trailing && <span className="flex shrink-0 items-center text-muted-foreground">{trailing}</span>}
    </div>
  );
});

export interface PasswordInputProps extends Omit<InputProps, "type" | "trailing"> {}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(props, ref) {
  const [shown, setShown] = React.useState(false);
  return (
    <Input
      ref={ref}
      type={shown ? "text" : "password"}
      autoComplete={props.autoComplete ?? "current-password"}
      trailing={
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? "Hide password" : "Show password"}
          aria-pressed={shown}
          className="-mr-1 grid size-6 cursor-pointer place-items-center rounded-[6px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {shown ? <EyeOff /> : <Eye />}
        </button>
      }
      {...props}
    />
  );
});

export interface SearchInputProps extends Omit<InputProps, "type" | "leading" | "value" | "defaultValue" | "onChange"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { value, defaultValue = "", onValueChange, onKeyDown, placeholder = "Search", ...props },
  ref,
) {
  const [inner, setInner] = React.useState(defaultValue);
  const current = value ?? inner;
  const set = (v: string) => {
    if (value === undefined) setInner(v);
    onValueChange?.(v);
  };
  const local = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(ref, () => local.current as HTMLInputElement);

  return (
    <Input
      ref={local}
      type="search"
      role="searchbox"
      placeholder={placeholder}
      value={current}
      onChange={(e) => set(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Escape" && current) {
          e.preventDefault();
          set("");
        }
        onKeyDown?.(e);
      }}
      leading={<Search />}
      trailing={
        current ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              set("");
              local.current?.focus();
            }}
            className="-mr-1 grid size-6 cursor-pointer place-items-center rounded-[6px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <X />
          </button>
        ) : undefined
      }
      className="[&::-webkit-search-cancel-button]:hidden"
      {...props}
    />
  );
});

const VARIANT = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:hover:bg-secondary/70",
  outline: "bg-card text-foreground ring-1 ring-inset ring-input hover:bg-accent",
  ghost: "text-foreground hover:bg-accent",
  destructive: "bg-red-600 text-white hover:bg-red-600/90 dark:bg-red-600/60 dark:hover:bg-red-600/70",
  link: "h-auto! px-0! text-foreground underline-offset-4 hover:underline",
} as const;

export type ButtonVariant = keyof typeof VARIANT;

const ICON_SIZE: Record<ControlSize, string> = {
  sm: "size-8 rounded-[9px]",
  md: "size-9 rounded-[10px]",
  lg: "size-10 rounded-[11px]",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ControlSize;
  icon?: boolean;
  loading?: boolean;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    icon = false,
    loading = false,
    asChild = false,
    disabled,
    className,
    children,
    onClick,
    type,
    ...rest
  },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  const busy = loading && !asChild;

  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : (type ?? "button")}
      data-variant={variant}
      aria-busy={busy || undefined}
      aria-disabled={busy || undefined}
      disabled={disabled}
      onClick={busy ? (e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault() : onClick}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 font-medium whitespace-nowrap select-none",
        "transition-[background-color,color,box-shadow,opacity] duration-150",
        "disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-progress",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        icon ? ICON_SIZE[size] : CONTROL[size],
        VARIANT[variant],
        FOCUS,
        SQUIRCLE,
        className,
      )}
      {...rest}
    >
      {asChild ? (
        children
      ) : (
        <>
          {busy && <Loader2 aria-hidden className="motion-safe:animate-spin" />}
          {busy && icon ? null : children}
        </>
      )}
    </Comp>
  );
});

export interface IconButtonProps extends Omit<ButtonProps, "icon" | "aria-label"> {
  label: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, variant = "ghost", ...rest },
  ref,
) {
  return <Button ref={ref} icon variant={variant} aria-label={label} {...rest} />;
});

export function pageItems(page: number, pageCount: number, siblings = 1): Array<number | "gap"> {
  const slots = siblings * 2 + 5;
  if (pageCount <= slots) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const left = Math.max(page - siblings, 1);
  const right = Math.min(page + siblings, pageCount);
  const showLeftGap = left > 3;
  const showRightGap = right < pageCount - 2;
  if (!showLeftGap) {
    const count = siblings * 2 + 3;
    return [...Array.from({ length: count }, (_, i) => i + 1), "gap", pageCount];
  }
  if (!showRightGap) {
    const count = siblings * 2 + 3;
    return [1, "gap", ...Array.from({ length: count }, (_, i) => pageCount - count + i + 1)];
  }
  return [1, "gap", ...Array.from({ length: right - left + 1 }, (_, i) => left + i), "gap", pageCount];
}

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  total?: number;
  pageSize?: number;
  siblings?: number;
  compact?: boolean;
  label?: string;
}

const CELL = cn(
  "inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-[9px] px-2 text-[12.5px] font-medium tabular-nums transition-colors",
  "text-foreground/80 hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
  FOCUS,
  SQUIRCLE,
);

export function Pagination({
  page,
  pageCount,
  onPageChange,
  total,
  pageSize,
  siblings = 1,
  compact = false,
  label = "Pagination",
  className,
  ...rest
}: PaginationProps) {
  const go = (p: number) => onPageChange(Math.min(Math.max(1, p), Math.max(1, pageCount)));
  const from = total !== undefined && pageSize ? Math.min((page - 1) * pageSize + 1, total) : null;
  const to = total !== undefined && pageSize ? Math.min(page * pageSize, total) : null;

  return (
    <nav aria-label={label} className={cn("flex flex-wrap items-center justify-between gap-3", className)} {...rest}>
      {from !== null ? (
        <p className="text-[12.5px] text-muted-foreground tabular-nums" aria-live="polite">
          {total === 0 ? "No results" : <><span className="text-foreground">{from}–{to}</span> of {total!.toLocaleString()}</>}
        </p>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-1">
        <button type="button" className={cn(CELL, "gap-1 pl-1.5")} onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeft className="size-4" aria-hidden />
          <span className="max-sm:sr-only">Previous</span>
        </button>
        <span className={cn("px-2 text-[12.5px] text-muted-foreground tabular-nums", !compact && "sm:hidden")}>
          Page <span className="text-foreground">{page}</span> of {pageCount}
        </span>
        {!compact && (
          <ul className="flex items-center gap-1 max-sm:hidden">
            {pageItems(page, pageCount, siblings).map((it, i) =>
              it === "gap" ? (
                <li key={`gap-${i}`} aria-hidden className="grid h-8 w-6 place-items-center text-[12.5px] text-muted-foreground">
                  …
                </li>
              ) : (
                <li key={it}>
                  <button
                    type="button"
                    onClick={() => go(it)}
                    aria-current={it === page ? "page" : undefined}
                    aria-label={`Page ${it}`}
                    className={cn(CELL, it === page && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground")}
                  >
                    {it}
                  </button>
                </li>
              ),
            )}
          </ul>
        )}
        <button type="button" className={cn(CELL, "gap-1 pr-1.5")} onClick={() => go(page + 1)} disabled={page >= pageCount} aria-label="Next page">
          <span className="max-sm:sr-only">Next</span>
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    </nav>
  );
}

const ICON = {
  empty: Inbox,
  error: AlertTriangle,
  success: CheckCircle2,
  loading: Loader2,
} as const;

const TINT = {
  empty: "bg-muted text-muted-foreground",
  error: "bg-destructive/10 text-red-700 dark:text-red-400",
  success: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
  loading: "bg-muted text-muted-foreground",
} as const;

export type StateKind = keyof typeof ICON;

export interface StateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  kind?: StateKind;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  framed?: boolean;
  size?: "sm" | "md";
}

export function State({
  kind = "empty",
  title,
  description,
  icon,
  action,
  secondaryAction,
  framed = false,
  size = "md",
  className,
  ...rest
}: StateProps) {
  const Icon = ICON[kind];
  const live = kind === "error" ? { role: "alert" as const } : kind === "loading" ? { role: "status" as const, "aria-live": "polite" as const } : {};
  return (
    <div
      data-state-kind={kind}
      {...live}
      className={cn(
        "flex flex-col items-center text-center",
        size === "sm" ? "gap-2 px-4 py-6" : "gap-3 px-6 py-10",
        framed && cn("rounded-[14px] border border-dashed border-input", SQUIRCLE),
        className,
      )}
      {...rest}
    >
      <span className={cn("grid place-items-center rounded-[12px]", size === "sm" ? "size-9" : "size-11", TINT[kind], SQUIRCLE)}>
        {icon ?? <Icon aria-hidden className={cn(size === "sm" ? "size-4" : "size-5", kind === "loading" && "motion-safe:animate-spin")} />}
      </span>
      <div className="grid max-w-[40ch] gap-1">
        <p className={cn("font-semibold text-foreground", size === "sm" ? "text-[13px]" : "text-[14.5px]")}>{title}</p>
        {description && <p className="text-[12.5px] leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {(action || secondaryAction) && (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

export function Skeleton({ className, lines, ...rest }: SkeletonProps) {
  if (lines) {
    return (
      <div aria-hidden className={cn("grid gap-2", className)} {...rest}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className="h-3 rounded-full bg-foreground/[0.07] motion-safe:animate-pulse"
            style={{ width: i === lines - 1 && lines > 1 ? "62%" : "100%" }}
          />
        ))}
      </div>
    );
  }
  return <div aria-hidden className={cn("rounded-[8px] bg-foreground/[0.07] motion-safe:animate-pulse", className)} {...rest} />;
}

export const DropdownMenu = MenuPrimitive.Root;
export const DropdownMenuTrigger = MenuPrimitive.Trigger;
export const DropdownMenuGroup = MenuPrimitive.Group;
export const DropdownMenuSub = MenuPrimitive.Sub;
export const DropdownMenuRadioGroup = MenuPrimitive.RadioGroup;

const SURFACE = cn(
  "min-w-[180px] overflow-hidden rounded-[12px] bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-border",
  "motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0 motion-safe:data-[state=open]:zoom-in-95 motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0 motion-safe:data-[state=closed]:zoom-out-95",
  "data-[side=top]:[--pop-y:4px]",
  SQUIRCLE,
);

const ITEM =
  "relative flex cursor-pointer items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-[13px] outline-none select-none " +
  "data-[highlighted]:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50 " +
  "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground";

export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof MenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenuPrimitive.Content>
>(function DropdownMenuContent({ className, sideOffset = 6, style, ...props }, ref) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        collisionPadding={8}
        style={{ zIndex: LAYER.popover, ...style }}
        className={cn(SURFACE, className)}
        {...props}
      />
    </MenuPrimitive.Portal>
  );
});

export interface DropdownMenuItemProps extends React.ComponentPropsWithoutRef<typeof MenuPrimitive.Item> {
  danger?: boolean;
  shortcut?: string;
  inset?: boolean;
}

export const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof MenuPrimitive.Item>, DropdownMenuItemProps>(
  function DropdownMenuItem({ className, danger, shortcut, inset, children, ...props }, ref) {
    return (
      <MenuPrimitive.Item
        ref={ref}
        className={cn(
          ITEM,
          inset && "pl-8",
          danger && "text-red-700 dark:text-red-400 data-[highlighted]:bg-destructive/10 [&_svg]:text-red-700 [&_svg]:dark:text-red-400",
          className,
        )}
        {...props}
      >
        {children}
        {shortcut && <span className="ml-auto pl-4 text-[11.5px] tracking-wide text-muted-foreground">{shortcut}</span>}
      </MenuPrimitive.Item>
    );
  },
);

export const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenuPrimitive.CheckboxItem>
>(function DropdownMenuCheckboxItem({ className, children, ...props }, ref) {
  return (
    <MenuPrimitive.CheckboxItem ref={ref} className={cn(ITEM, "pl-8", className)} {...props}>
      <span className="absolute left-2.5 flex size-4 items-center justify-center">
        <MenuPrimitive.ItemIndicator>
          <Check className="text-foreground!" />
        </MenuPrimitive.ItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  );
});

export const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof MenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenuPrimitive.RadioItem>
>(function DropdownMenuRadioItem({ className, children, ...props }, ref) {
  return (
    <MenuPrimitive.RadioItem ref={ref} className={cn(ITEM, "pl-8", className)} {...props}>
      <span className="absolute left-2.5 flex size-4 items-center justify-center">
        <MenuPrimitive.ItemIndicator>
          <span className="block size-1.5 rounded-full bg-foreground" />
        </MenuPrimitive.ItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  );
});

export const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof MenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenuPrimitive.Label> & { inset?: boolean }
>(function DropdownMenuLabel({ className, inset, ...props }, ref) {
  return (
    <MenuPrimitive.Label
      ref={ref}
      className={cn("px-2.5 pt-2 pb-1 text-[10.5px] font-semibold tracking-[0.08em] text-muted-foreground uppercase", inset && "pl-8", className)}
      {...props}
    />
  );
});

export const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof MenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenuPrimitive.Separator>
>(function DropdownMenuSeparator({ className, ...props }, ref) {
  return <MenuPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />;
});

export const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenuPrimitive.SubTrigger>
>(function DropdownMenuSubTrigger({ className, children, ...props }, ref) {
  return (
    <MenuPrimitive.SubTrigger ref={ref} className={cn(ITEM, "data-[state=open]:bg-accent", className)} {...props}>
      {children}
      <ChevronRight className="ml-auto" aria-hidden />
    </MenuPrimitive.SubTrigger>
  );
});

export const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof MenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenuPrimitive.SubContent>
>(function DropdownMenuSubContent({ className, style, ...props }, ref) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.SubContent
        ref={ref}
        style={{ zIndex: LAYER.popover, ...style }}
        className={cn(SURFACE, "[--pop-y:0px]", className)}
        {...props}
      />
    </MenuPrimitive.Portal>
  );
});

export type ColumnMeta = {
  align?: "left" | "right" | "center";
  width?: number;
  label?: string;
};

export type ColumnDef<TData, TValue = unknown> = {
  id?: string;
  accessorKey?: keyof TData;
  accessorFn?: (row: TData) => TValue;
  header?: ReactNode | ((context: { column: { id?: string } }) => ReactNode);
  cell?: (context: {
    row: { id?: string; original: TData; index: number };
    getValue: <V = TValue>(key?: keyof TData | string) => V;
    value?: TValue;
  }) => ReactNode;
  meta?: ColumnMeta;
  enableSorting?: boolean;
  enableHiding?: boolean;
};

export interface DataTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T, any>[];
  searchPlaceholder?: string;
  selectable?: boolean;
  bulkActions?: (rows: T[]) => React.ReactNode;
  onSelectionChange?: (rows: T[]) => void;
  pageSize?: number;
  columnToggle?: boolean;
  getRowId?: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  density?: "compact" | "comfortable";
  empty?: React.ReactNode;
  label?: string;
  className?: string;
  fillHeight?: boolean;
}

export function DataTable<T extends object>({
  data,
  columns: userColumns,
  searchPlaceholder,
  selectable = false,
  bulkActions,
  onSelectionChange,
  pageSize = 10,
  columnToggle = false,
  getRowId,
  onRowClick,
  density = "comfortable",
  empty,
  label = "Table",
  className,
  fillHeight = false,
}: DataTableProps<T>) {
  const [sortState, setSortState] = React.useState<Array<{ id: string; desc: boolean }>>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({});
  const [pageIndex, setPageIndex] = React.useState(0);

  const headerColumns = React.useMemo<ColumnDef<T, any>[]>(() => {
    if (!selectable) return userColumns;
    const selectColumn: ColumnDef<T, any> = {
      id: "__select",
      enableHiding: false,
      enableSorting: false,
      meta: { width: 44, align: "center" },
      header: () => {
        const pageRows = visibleRows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
        const total = pageRows.length;
        const selectedCount = pageRows.filter((row) => rowSelection[row.id]).length;
        const checked = total > 0 && selectedCount === total;
        return (
          <Checkbox
            aria-label="Select all rows on this page"
            checked={checked ? true : selectedCount > 0 ? "indeterminate" : false}
            onCheckedChange={(value) => {
              const next = { ...rowSelection };
              for (const row of pageRows) {
                next[row.id] = value === true;
              }
              setRowSelection(next);
            }}
          />
        );
      },
      cell: ({ row }) => (
        <Checkbox
          aria-label="Select row"
          checked={Boolean(rowSelection[row.id ?? String(row.index)])}
          onCheckedChange={(value) => {
            const id = row.id ?? String(row.index);
            setRowSelection((prev) => ({ ...prev, [id]: value === true }));
          }}
          onClick={(event) => event.stopPropagation()}
        />
      ),
    };
    return [selectColumn, ...userColumns];
  }, [pageIndex, pageSize, rowSelection, selectable, userColumns]);

  const getColumnId = React.useCallback((column: ColumnDef<T, any>, index: number) => {
    if (column.id) return column.id;
    if (typeof column.accessorKey === "string") return column.accessorKey;
    return `column-${index}`;
  }, []);

  const valueForRow = React.useCallback((row: T, column: ColumnDef<T, any>) => {
    if (typeof column.accessorFn === "function") {
      return column.accessorFn(row);
    }
    if (typeof column.accessorKey === "string") {
      return (row as Record<string, unknown>)[column.accessorKey];
    }
    return undefined;
  }, []);

  const getVisibleColumns = React.useMemo(() => {
    return headerColumns.filter((column, index) => {
      const id = getColumnId(column, index);
      return columnVisibility[id] !== false;
    });
  }, [columnVisibility, getColumnId, headerColumns]);

  const getRowKey = React.useCallback((row: T, index: number) => getRowId?.(row, index) ?? String(index), [getRowId]);

  const visibleRows = React.useMemo(() => {
    const rows = data.map((row, index) => {
      const id = getRowKey(row, index);
      return { id, row, index };
    });

    if (!globalFilter.trim()) {
      return rows;
    }

    const query = globalFilter.trim().toLowerCase();
    return rows.filter(({ row }) => {
      return Object.values(row as Record<string, unknown>).some((value) => {
        if (value == null) return false;
        if (typeof value === "string" || typeof value === "number") {
          return String(value).toLowerCase().includes(query);
        }
        if (Array.isArray(value)) {
          return value.some((item) => String(item).toLowerCase().includes(query));
        }
        if (typeof value === "object") {
          return JSON.stringify(value).toLowerCase().includes(query);
        }
        return false;
      });
    });
  }, [data, getRowKey, globalFilter]);

  const sortedRows = React.useMemo(() => {
    if (!sortState.length) return visibleRows;

    return [...visibleRows].sort((left, right) => {
      for (const { id, desc } of sortState) {
        const column = headerColumns.find((item) => getColumnId(item, 0) === id);
        if (!column) continue;

        const leftValue = valueForRow(left.row, column);
        const rightValue = valueForRow(right.row, column);
        const leftComparable = leftValue == null ? "" : String(leftValue);
        const rightComparable = rightValue == null ? "" : String(rightValue);

        const comparison = leftComparable.localeCompare(rightComparable, undefined, {
          numeric: true,
          sensitivity: "base",
        });

        if (comparison !== 0) {
          return desc ? comparison * -1 : comparison;
        }
      }

      return 0;
    });
  }, [getColumnId, headerColumns, sortState, valueForRow, visibleRows]);

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / Math.max(pageSize, 1)));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  React.useEffect(() => {
    if (pageIndex !== safePageIndex) {
      setPageIndex(safePageIndex);
    }
  }, [pageIndex, safePageIndex]);

  const paginatedRows = sortedRows.slice(safePageIndex * pageSize, (safePageIndex + 1) * pageSize);
  const selectedRows = data.filter((row, index) => {
    const rowKey = getRowKey(row, index);
    return rowSelection[rowKey] === true;
  });
  const selectedCount = selectedRows.length;
  const cellPad = density === "compact" ? "px-3 py-1.5" : "px-3 py-2.5";
  const hasToolbar = !!searchPlaceholder || columnToggle || (selectable && selectedCount > 0);

  React.useEffect(() => {
    onSelectionChange?.(selectedRows);
  }, [onSelectionChange, selectedRows]);

  const toggleSort = (columnId: string, event?: React.MouseEvent) => {
    const multiSort = !!(event?.shiftKey || event?.metaKey || event?.ctrlKey);

    setSortState((current) => {
      const match = current.find((entry) => entry.id === columnId);

      if (multiSort) {
        if (!match) {
          return [...current, { id: columnId, desc: false }];
        }
        return current.map((entry) => {
          if (entry.id !== columnId) return entry;
          return { ...entry, desc: !entry.desc };
        });
      }

      if (!match) {
        return [{ id: columnId, desc: false }];
      }
      if (match.desc) {
        return [];
      }
      return [{ id: columnId, desc: true }];
    });
  };

  return (
    <div className={cn(fillHeight ? "flex min-h-0 min-w-0 flex-1 flex-col gap-3" : "grid min-w-0 gap-3", className)}>
      {hasToolbar && (
        <div className="flex flex-wrap items-center gap-2">
          {searchPlaceholder && (
            <SearchInput
              aria-label={searchPlaceholder}
              placeholder={searchPlaceholder}
              value={globalFilter}
              onValueChange={(value) => {
                setGlobalFilter(value);
                setPageIndex(0);
              }}
              wrapperClassName="w-full max-w-[260px]"
            />
          )}
          {selectable && selectedCount > 0 && (
            <div className="flex items-center gap-2" aria-live="polite">
              <span className="text-[12.5px] text-muted-foreground tabular-nums">{selectedCount} selected</span>
              {bulkActions?.(selectedRows)}
            </div>
          )}
          {columnToggle && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  <Columns3 /> Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Show columns</DropdownMenuLabel>
                {headerColumns.map((column, index) => {
                  const id = getColumnId(column, index);
                  const hidden = column.enableHiding === false;
                  if (hidden) return null;
                  const label = column.meta?.label ?? (typeof column.header === "string" ? column.header : id);
                  return (
                    <DropdownMenuCheckboxItem
                      key={id}
                      checked={columnVisibility[id] !== false}
                      onCheckedChange={(value) => {
                        setColumnVisibility((prev) => ({ ...prev, [id]: value === true }));
                      }}
                      onSelect={(event) => event.preventDefault()}
                    >
                      {label}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      <div className={cn("min-w-0 overflow-x-auto rounded-[14px] bg-card ring-1 ring-border", SQUIRCLE)}>
        <table aria-label={label} className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-border">
              {getVisibleColumns.map((column, index) => {
                const id = getColumnId(column, index);
                const meta = column.meta;
                const align = meta?.align ?? "left";
                const isSorted = sortState.find((entry) => entry.id === id);
                const canSort = column.enableSorting !== false;
                return (
                  <th
                    key={id}
                    scope="col"
                    style={meta?.width ? { width: meta.width } : undefined}
                    aria-sort={isSorted ? (isSorted.desc ? "descending" : "ascending") : undefined}
                    className={cn(
                      "h-10 px-3 text-[11.5px] font-medium whitespace-nowrap text-muted-foreground",
                      align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left",
                    )}
                  >
                    {canSort ? (
                      <button
                        type="button"
                        onClick={(event) => toggleSort(id, event)}
                        className={cn(
                          "-mx-1.5 inline-flex cursor-pointer items-center gap-1 rounded-[6px] px-1.5 py-0.5 hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                          isSorted && "text-foreground",
                          align === "right" && "flex-row-reverse",
                        )}
                      >
                        {typeof column.header === "string" || typeof column.header === "number" ? column.header : (column.header as any)?.({ column: { id } }) ?? id}
                        {isSorted ? (
                          isSorted.desc ? <ArrowDown className="size-3.5" aria-hidden /> : <ArrowUp className="size-3.5" aria-hidden />
                        ) : (
                          <ChevronsUpDown className="size-3.5 opacity-50" aria-hidden />
                        )}
                      </button>
                    ) : (
                      typeof column.header === "string" || typeof column.header === "number" ? column.header : (column.header as any)?.({ column: { id } }) ?? id
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={getVisibleColumns.length || 1}>
                  {empty ?? (
                    <State
                      size="sm"
                      title={globalFilter ? "No matches" : "Nothing here yet"}
                      description={globalFilter ? `Nothing matches “${globalFilter}”.` : undefined}
                      action={
                        globalFilter ? (
                          <Button size="sm" variant="outline" onClick={() => setGlobalFilter("")}>
                            Show everything
                          </Button>
                        ) : undefined
                      }
                    />
                  )}
                </td>
              </tr>
            ) : (
              paginatedRows.map(({ row, id, index }) => (
                <tr
                  key={id}
                  data-state={rowSelection[id] ? "selected" : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "border-b border-border/60 transition-colors last:border-b-0 hover:bg-muted/50 data-[state=selected]:bg-accent/70",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {getVisibleColumns.map((column, columnIndex) => {
                    const columnId = getColumnId(column, columnIndex);
                    const align = column.meta?.align ?? "left";
                    const cell = column.cell;
                    const value = valueForRow(row, column);
                    const content = cell ? cell({ row: { id: id, original: row, index }, getValue: (key) => {
                      const resolved = String(key ?? column.accessorKey ?? "");
                      if (typeof column.accessorKey === "string" && resolved === column.accessorKey) return value as any;
                      return (row as Record<string, unknown>)[resolved] as any;
                    }, value }) : value;
                    return (
                      <td
                        key={`${id}-${columnId}`}
                        className={cn(
                          cellPad,
                          "align-middle text-foreground",
                          align === "right" ? "text-right tabular-nums" : align === "center" ? "text-center" : "",
                        )}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageSize > 0 && (fillHeight || sortedRows.length > pageSize) && (
        <Pagination
          label={`${label} pages`}
          page={safePageIndex + 1}
          pageCount={pageCount}
          onPageChange={(page) => setPageIndex(page - 1)}
          total={sortedRows.length}
          pageSize={pageSize}
          className={fillHeight ? "mt-auto" : undefined}
        />
      )}
    </div>
  );
}

export { DataTable as Component };
