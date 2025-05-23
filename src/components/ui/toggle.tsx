
import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors duration-200 hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        maturity0: "border border-red-500 data-[state=on]:bg-red-500 data-[state=on]:text-white data-[state=on]:border-red-500 data-[state=on]:font-semibold transition-all duration-200 hover:bg-red-100 hover:text-red-700",
        maturity1: "border border-orange-500 data-[state=on]:bg-orange-500 data-[state=on]:text-white data-[state=on]:border-orange-500 data-[state=on]:font-semibold transition-all duration-200 hover:bg-orange-100 hover:text-orange-700",
        maturity2: "border border-yellow-500 data-[state=on]:bg-yellow-500 data-[state=on]:text-white data-[state=on]:border-yellow-500 data-[state=on]:font-semibold transition-all duration-200 hover:bg-yellow-100 hover:text-yellow-700",
        maturity3: "border border-blue-500 data-[state=on]:bg-blue-500 data-[state=on]:text-white data-[state=on]:border-blue-500 data-[state=on]:font-semibold transition-all duration-200 hover:bg-blue-100 hover:text-blue-700", 
        maturity4: "border border-indigo-500 data-[state=on]:bg-indigo-500 data-[state=on]:text-white data-[state=on]:border-indigo-500 data-[state=on]:font-semibold transition-all duration-200 hover:bg-indigo-100 hover:text-indigo-700",
        maturity5: "border border-green-500 data-[state=on]:bg-green-500 data-[state=on]:text-white data-[state=on]:border-green-500 data-[state=on]:font-semibold transition-all duration-200 hover:bg-green-100 hover:text-green-700",
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
