
import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:bg-muted hover:text-muted-foreground",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        maturity0: "border border-input bg-white hover:bg-red-50 data-[state=on]:bg-red-100 data-[state=on]:text-red-800 data-[state=on]:border-red-300 data-[state=on]:font-semibold",
        maturity1: "border border-input bg-white hover:bg-orange-50 data-[state=on]:bg-orange-100 data-[state=on]:text-orange-800 data-[state=on]:border-orange-300 data-[state=on]:font-semibold",
        maturity2: "border border-input bg-white hover:bg-yellow-50 data-[state=on]:bg-yellow-100 data-[state=on]:text-yellow-800 data-[state=on]:border-yellow-300 data-[state=on]:font-semibold",
        maturity3: "border border-input bg-white hover:bg-blue-50 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-800 data-[state=on]:border-blue-300 data-[state=on]:font-semibold",
        maturity4: "border border-input bg-white hover:bg-indigo-50 data-[state=on]:bg-indigo-100 data-[state=on]:text-indigo-800 data-[state=on]:border-indigo-300 data-[state=on]:font-semibold",
        maturity5: "border border-input bg-white hover:bg-green-50 data-[state=on]:bg-green-100 data-[state=on]:text-green-800 data-[state=on]:border-green-300 data-[state=on]:font-semibold",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
        xl: "h-12 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
