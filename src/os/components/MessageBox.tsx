// MessageBox.tsx — Authentic Windows 98 message box dialog
import { useEffect, useRef } from "react";
import { useDialogStore, type DialogIcon, type DialogButton } from "../store/dialogStore";
import { playClickSound } from "../sound";
import styles from "./MessageBox.module.css";

function RenderIcon({ icon }: { icon: DialogIcon }) {
  if (icon === "error") {
    return (
      <svg width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#cc0000" stroke="#800000" strokeWidth="2" />
        <line x1="10" y1="10" x2="22" y2="22" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
        <line x1="22" y1="10" x2="10" y2="22" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === "warning") {
    return (
      <svg width="32" height="32" viewBox="0 0 32 32">
        <polygon points="16,2 31,28 1,28" fill="#ffff00" stroke="#000000" strokeWidth="2" strokeLinejoin="round" />
        <rect x="14.5" y="10" width="3" height="10" fill="#000000" />
        <circle cx="16" cy="24" r="1.8" fill="#000000" />
      </svg>
    );
  }
  if (icon === "question") {
    return (
      <svg width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#000080" stroke="#0000ff" strokeWidth="1" />
        <text x="16" y="23" fill="#ffffff" fontSize="22" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">?</text>
      </svg>
    );
  }
  // info
  return (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14" fill="#000080" stroke="#0000ff" strokeWidth="1" />
      <text x="16" y="23" fill="#ffffff" fontSize="22" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">i</text>
    </svg>
  );
}

export default function MessageBox() {
  const current = useDialogStore((s) => s.currentDialog);
  const closeDialog = useDialogStore((s) => s.closeDialog);
  const okBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (current) {
      okBtnRef.current?.focus();
    }
  }, [current]);

  if (!current) return null;

  const handleBtnClick = (btn: DialogButton) => {
    playClickSound();
    closeDialog(btn);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleBtnClick(current.buttons?.includes("Cancel") ? "Cancel" : current.buttons?.[0] ?? "OK");
    }
  };

  return (
    <div className={styles.overlay} onKeyDown={handleKeyDown}>
      <div className={styles.box} role="dialog" aria-modal="true">
        <div className={styles.titleBar}>
          <span>{current.title}</span>
          <button
            className={styles.closeBtn}
            onClick={() => handleBtnClick(current.buttons?.includes("Cancel") ? "Cancel" : "OK")}
            aria-label="Close"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <line x1="0" y1="0" x2="8" y2="8" stroke="#000" strokeWidth="1.5" />
              <line x1="8" y1="0" x2="0" y2="8" stroke="#000" strokeWidth="1.5" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.contentRow}>
            <div className={styles.iconWrap}>
              <RenderIcon icon={current.icon ?? "info"} />
            </div>
            <div className={styles.message}>{current.message}</div>
          </div>

          <div className={styles.buttons}>
            {current.buttons?.map((btn, idx) => (
              <button
                key={btn}
                ref={idx === 0 ? okBtnRef : undefined}
                className={styles.button}
                onClick={() => handleBtnClick(btn)}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
