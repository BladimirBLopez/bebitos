"use client";

import { ReactNode } from "react";
import { Toaster, toast as sonnerToast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: "rounded-xl! font-medium! text-sm!",
          },
        }}
      />
    </>
  );
}

export function useToast() {
  function showToast(message: string, type: "success" | "error" = "success") {
    if (type === "success") {
      sonnerToast.success(message, { icon: <CheckCircle2 className="w-4 h-4" /> });
    } else {
      sonnerToast.error(message, { icon: <XCircle className="w-4 h-4" /> });
    }
  }
  return { showToast };
}
