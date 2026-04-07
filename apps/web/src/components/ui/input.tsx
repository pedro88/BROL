import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * Input avec style VHS retro.
 * @component
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full bg-input border-2 border-border px-4 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground transition-all",
          "focus:outline-none focus:border-primary focus:ring-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-mono",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
