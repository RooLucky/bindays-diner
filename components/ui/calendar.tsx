"use client";

import {
  DayFlag,
  DayPicker,
  getDefaultClassNames,
  SelectionState,
  UI,
  type DayPickerProps,
} from "react-day-picker";

import { cn } from "@/lib/utils";

export function Calendar({
  className,
  classNames,
  ...props
}: DayPickerProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      className={cn("p-1", className)}
      showOutsideDays
      fixedWeeks
      classNames={{
        ...defaultClassNames,
        [UI.Root]: cn("w-[18rem] text-foreground", defaultClassNames[UI.Root]),
        [UI.Months]: "flex flex-col gap-4",
        [UI.Month]: "space-y-4",
        [UI.MonthCaption]: "relative flex min-h-10 items-center justify-center px-10",
        [UI.CaptionLabel]: cn(
          defaultClassNames[UI.CaptionLabel],
          "inline-flex items-center gap-1.5 font-serif text-lg font-semibold text-foreground",
        ),
        [UI.Dropdowns]: "flex items-center justify-center gap-2",
        [UI.DropdownRoot]:
          "relative inline-flex h-10 min-w-[5.75rem] items-center justify-center rounded-sm border border-border bg-background px-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted data-[disabled=true]:opacity-40 [&_[aria-hidden=true]]:font-sans [&_[aria-hidden=true]]:text-sm [&_[aria-hidden=true]]:font-semibold",
        [UI.Dropdown]:
          "absolute inset-0 h-full w-full cursor-pointer opacity-0 outline-none",
        [UI.MonthsDropdown]: "absolute inset-0 h-full w-full cursor-pointer opacity-0 outline-none",
        [UI.YearsDropdown]: "absolute inset-0 h-full w-full cursor-pointer opacity-0 outline-none",
        [UI.Nav]: "absolute inset-x-0 top-0 flex items-center justify-between",
        [UI.PreviousMonthButton]:
          "inline-flex size-9 items-center justify-center rounded-sm border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40",
        [UI.NextMonthButton]:
          "inline-flex size-9 items-center justify-center rounded-sm border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40",
        [UI.Chevron]: "size-4 shrink-0 fill-current",
        [UI.MonthGrid]: "w-full border-collapse",
        [UI.Weekdays]: "grid grid-cols-7",
        [UI.Weekday]:
          "grid h-9 place-items-center text-[0.72rem] font-semibold uppercase text-muted-foreground",
        [UI.Week]: "grid grid-cols-7",
        [UI.Day]: "grid size-9 place-items-center p-0 text-center text-sm",
        [UI.DayButton]:
          "grid size-9 place-items-center rounded-sm text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
        [SelectionState.selected]:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground [&>button]:focus-visible:bg-primary [&>button]:focus-visible:text-primary-foreground",
        [DayFlag.today]: "[&>button]:font-bold [&>button]:text-primary",
        [DayFlag.outside]: "text-muted-foreground/45",
        [DayFlag.disabled]:
          "pointer-events-none text-muted-foreground/35 opacity-50",
        ...classNames,
      }}
      {...props}
    />
  );
}
