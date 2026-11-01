// dialogStore.ts — State manager for authentic Windows 98 modal dialogs
import { create } from "zustand";
import { playChordSound, playDingSound } from "../sound";

export type DialogIcon = "error" | "warning" | "info" | "question";
export type DialogButton = "OK" | "Cancel" | "Yes" | "No";

export interface DialogOptions {
  title?: string;
  message: string;
  icon?: DialogIcon;
  buttons?: DialogButton[];
  onResult?: (btn: DialogButton) => void;
}

interface DialogState {
  currentDialog: DialogOptions | null;
  showDialog: (opts: DialogOptions) => Promise<DialogButton>;
  closeDialog: (btn: DialogButton) => void;
}

let resolvePromise: ((btn: DialogButton) => void) | null = null;

export const useDialogStore = create<DialogState>((set) => ({
  currentDialog: null,

  showDialog: (opts: DialogOptions) => {
    return new Promise<DialogButton>((resolve) => {
      resolvePromise = resolve;
      const icon = opts.icon ?? "info";

      if (icon === "error" || icon === "warning") {
        playChordSound();
      } else {
        playDingSound();
      }

      set({
        currentDialog: {
          title: opts.title ?? (icon === "error" ? "Error" : icon === "warning" ? "Warning" : "Windows 98"),
          message: opts.message,
          icon,
          buttons: opts.buttons ?? ["OK"],
          onResult: opts.onResult,
        },
      });
    });
  },

  closeDialog: (btn: DialogButton) => {
    set((state) => {
      state.currentDialog?.onResult?.(btn);
      if (resolvePromise) {
        resolvePromise(btn);
        resolvePromise = null;
      }
      return { currentDialog: null };
    });
  },
}));

// Convenient global helper functions to drop-in replace alert() and confirm()
export function showWin98Alert(message: string, title = "Windows 98", icon: DialogIcon = "info"): Promise<DialogButton> {
  return useDialogStore.getState().showDialog({
    title,
    message,
    icon,
    buttons: ["OK"],
  });
}

export function showWin98Confirm(message: string, title = "Windows 98", icon: DialogIcon = "question"): Promise<boolean> {
  return useDialogStore.getState().showDialog({
    title,
    message,
    icon,
    buttons: ["Yes", "No"],
  }).then((btn) => btn === "Yes");
}
