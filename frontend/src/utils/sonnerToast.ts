import { toast } from 'sonner';
type ToastPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'bottom-center';

const DEFAULT_POSITION = 'top-center';
const DEFAULT_CLOSE_BUTTON = false;

export const displayToast = {
  default: (message: string, position?: ToastPosition) =>
    toast(message, {
      position: position || DEFAULT_POSITION,
    }),
  success: (message: string, position?: ToastPosition, duration?: number) =>
    toast.success(message, {
      position: position || DEFAULT_POSITION,
      duration: duration || 3000,
      dismissible: true,
      closeButton: DEFAULT_CLOSE_BUTTON,
    }),
  info: (message: string, position?: ToastPosition, isDismissible?: boolean) =>
    toast.info(message, {
      position: position || DEFAULT_POSITION,
      dismissible: isDismissible !== undefined ? isDismissible : true,
      closeButton: DEFAULT_CLOSE_BUTTON,
    }),
  description: (message: string, description: string, position?: ToastPosition) =>
    toast.message(message, {
      description: description,
      position: position || DEFAULT_POSITION,
    }),
  warning: (message: string, position?: ToastPosition) =>
    toast.warning(message, {
      position: position || DEFAULT_POSITION,
    }),
  error: (message: string, position?: ToastPosition, duration?: number, isDismissible?: boolean) =>
    toast.error(message, {
      position: position || DEFAULT_POSITION,
      closeButton: isDismissible !== undefined ? isDismissible : DEFAULT_CLOSE_BUTTON,
      duration: duration || 5000,
    }),
};
