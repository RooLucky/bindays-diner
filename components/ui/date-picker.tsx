"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { Matcher } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function dateFromValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
}

function valueFromDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
  disabled,
  disabledDates,
  startMonth,
  endMonth,
  captionLayout = "label",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  disabledDates?: Matcher | Matcher[];
  startMonth?: Date;
  endMonth?: Date;
  captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years";
}) {
  const [open, setOpen] = useState(false);
  const selectedDate = useMemo(() => dateFromValue(value), [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={(props) => (
          <Button
            {...props}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-11 w-full justify-start rounded-sm border-input bg-background px-3 text-left text-sm font-normal text-foreground hover:bg-background",
              !selectedDate && "text-muted-foreground",
              className,
            )}
          >
            <CalendarIcon className="mr-2 size-4 text-primary" />
            {selectedDate ? format(selectedDate, "MMM d, yyyy") : placeholder}
          </Button>
        )}
      />
      <PopoverPortal>
        <PopoverPositioner side="bottom" align="start">
          <PopoverPopup>
            <Calendar
              mode="single"
              selected={selectedDate}
              defaultMonth={selectedDate}
              onSelect={(date) => {
                if (!date) {
                  return;
                }

                onChange(valueFromDate(date));
                setOpen(false);
              }}
              disabled={disabledDates}
              startMonth={startMonth}
              endMonth={endMonth}
              captionLayout={captionLayout}
            />
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  );
}
