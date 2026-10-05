import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AdminPanel({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        "gap-0 rounded-xl border bg-card py-0 shadow-sm ring-0",
        className,
      )}
      {...props}
    />
  );
}
