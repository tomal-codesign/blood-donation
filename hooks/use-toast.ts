// hooks/use-toast.ts
import { toast } from "sonner";

export const useToast = () => {
  return {
    toast: {
      success: (message: string) => toast.success(message),
      error: (message: string) => toast.error(message),
      info: (message: string) => toast.info(message),
      warning: (message: string) => toast.warning(message),
      custom: (message: string) => toast(message),
    },
  };
};

// Direct toast export for convenience
export { toast };
