"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-textPrimary group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-textSecondary",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-backgroundSecondary group-[.toast]:text-textSecondary",
          success: "group-[.toast]:bg-success group-[.toast]:text-white",
          error: "group-[.toast]:bg-destructive group-[.toast]:text-white",
          warning: "group-[.toast]:bg-warning group-[.toast]:text-white",
          info: "group-[.toast]:bg-primary group-[.toast]:text-white",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
