import { cn } from "@/lib/utils"

function FullWidthDivider({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="full-width-divider"
      className={cn("w-full border-t border-border", className)}
      {...props}
    />
  )
}

export { FullWidthDivider }
