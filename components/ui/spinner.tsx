import { cn } from "@/lib/utils"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeMap = {
  sm: "w-[32px]",
  md: "w-[48px]",
  lg: "w-[65px]",
  xl: "w-[90px]",
}

export function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  return (
    <div
      className={cn("flex justify-center items-center", className)}
      {...props}
    >
      <div className={cn("relative aspect-square", sizeMap[size])}>
        <span className="absolute rounded-[50px] animate-luma-spin shadow-[inset_0_0_0_3px] shadow-foreground/20" />
        <span className="absolute rounded-[50px] animate-luma-spin animation-delay-half shadow-[inset_0_0_0_3px] shadow-foreground/20" />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  )
}
