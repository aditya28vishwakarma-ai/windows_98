// Window.tsx — the draggable, resizable, focusable window chrome
import { useRef, useCallback, useEffect, type ReactNode } from "react";
import { useWindowStore, type WindowInstance, type WindowRect } from "../store/windowStore";
import { useAchievementStore } from "../store/achievementStore";
import { playClickSound } from "../sound";
import styles from "./Window.module.css";

interface Props {
  win: WindowInstance;
  children: ReactNode;
  onAltF4?: () => void;
}

const TASKBAR_H = 28;

export default function Window({ win, children }: Props) {
  const { closeWindow, minimizeWindow, maximizeWindow, restoreWindow, focusWindow, setRect } =
    useWindowStore();
  const unlockAchievement = useAchievementStore((s) => s.unlock);
  const windows = useWindowStore((s) => s.windows);
  const windowCount = windows.length;
  const maxZ = Math.max(...windows.filter((w) => w.state !== "minimized").map((w) => w.zIndex), 0);
  const isActive = win.zIndex === maxZ;

  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizing = useRef<string | null>(null);
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, rect: win.rect });

  // Bring to front on click
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isActive) playClickSound();
      focusWindow(win.id);

      // BSOD easter egg: >15 windows
      if (windowCount > 15) {
        unlockAchievement("bsod-memory", "💀 BSOD");
        window.dispatchEvent(new CustomEvent("w98:bsod"));
      }
    },
    [focusWindow, win.id, windowCount, unlockAchievement]
  );

  // ── Drag ────────────────────────────────────────────────────
  const onTitleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (win.state === "maximized") return;
      if ((e.target as HTMLElement).closest("button")) return;
      dragging.current = true;
      dragOffset.current = {
        x: e.clientX - win.rect.x,
        y: e.clientY - win.rect.y,
      };
      e.preventDefault();
    },
    [win.state, win.rect]
  );

  // ── Resize ───────────────────────────────────────────────────
  const onResizeMouseDown = useCallback(
    (e: React.MouseEvent, handle: string) => {
      if (win.state === "maximized") return;
      resizing.current = handle;
      resizeStart.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        rect: { ...win.rect },
      };
      e.preventDefault();
      e.stopPropagation();
    },
    [win.state, win.rect]
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (dragging.current) {
        const newRect: WindowRect = {
          ...win.rect,
          x: e.clientX - dragOffset.current.x,
          y: Math.max(0, e.clientY - dragOffset.current.y),
        };
        setRect(win.id, newRect);
      }
      if (resizing.current) {
        const { mouseX, mouseY, rect: r } = resizeStart.current;
        const dx = e.clientX - mouseX;
        const dy = e.clientY - mouseY;
        const handle = resizing.current;
        let { x, y, w, h } = r;
        const minW = 160, minH = 100;
        if (handle.includes("e")) w = Math.max(minW, r.w + dx);
        if (handle.includes("s")) h = Math.max(minH, r.h + dy);
        if (handle.includes("w")) { x = r.x + dx; w = Math.max(minW, r.w - dx); }
        if (handle.includes("n")) { y = r.y + dy; h = Math.max(minH, r.h - dy); }
        setRect(win.id, { x, y, w, h });
      }
    };
    const onMouseUp = () => {
      dragging.current = false;
      resizing.current = null;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [win, setRect]);

  // ── Keyboard Alt+F4 ─────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const focused = useWindowStore.getState().windows.slice().sort((a, b) => b.zIndex - a.zIndex)[0];
      if (focused?.id === win.id && e.altKey && e.key === "F4") {
        e.preventDefault();
        closeWindow(win.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [win.id, closeWindow]);

  const onTitleDblClick = () => {
    if (win.state === "maximized") restoreWindow(win.id);
    else maximizeWindow(win.id);
  };

  if (win.state === "minimized") return null;

  const isMax = win.state === "maximized";
  const style = isMax
    ? {
        left: 0,
        top: 0,
        width: "100%",
        height: `calc(100% - ${TASKBAR_H}px)`,
        zIndex: win.zIndex,
      }
    : {
        left: win.rect.x,
        top: win.rect.y,
        width: win.rect.w,
        height: win.rect.h,
        zIndex: win.zIndex,
      };

  const handles = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

  return (
    <div
      ref={containerRef}
      className={`${styles.window} ${!isActive ? styles.inactive : ""}`}
      style={style}
      onMouseDown={handleMouseDown}
    >
      {!isMax &&
        handles.map((h) => (
          <div
            key={h}
            className={`${styles.resizeHandle} ${styles[`handle-${h}`]}`}
            onMouseDown={(e) => onResizeMouseDown(e, h)}
          />
        ))}

      {/* Title bar */}
      <div
        className={styles.titleBar}
        onMouseDown={onTitleMouseDown}
        onDoubleClick={onTitleDblClick}
      >
        <img src={win.icon} className={styles.titleIcon} alt="" aria-hidden />
        <span className={styles.titleText}>{win.title}</span>
        <div className={styles.titleButtons}>
          <button
            className={styles.titleBtn}
            aria-label="Minimize"
            onClick={() => minimizeWindow(win.id)}
          >
            <svg width="6" height="2" viewBox="0 0 6 2" fill="none">
              <rect x="0" y="0" width="6" height="2" fill="white" />
            </svg>
          </button>
          <button
            className={styles.titleBtn}
            aria-label={isMax ? "Restore" : "Maximize"}
            onClick={() => isMax ? restoreWindow(win.id) : maximizeWindow(win.id)}
          >
            {isMax ? (
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <rect x="0" y="3" width="6" height="6" stroke="white" strokeWidth="1" fill="none" />
                <rect x="3" y="0" width="6" height="6" stroke="white" strokeWidth="1" fill="none" />
              </svg>
            ) : (
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <rect x="0" y="0" width="9" height="9" stroke="white" strokeWidth="1" fill="none" />
                <rect x="0" y="0" width="9" height="2" fill="white" />
              </svg>
            )}
          </button>
          <button
            className={`${styles.titleBtn} ${styles.closeBtn}`}
            aria-label="Close"
            onClick={() => closeWindow(win.id)}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <line x1="0" y1="0" x2="8" y2="8" stroke="white" strokeWidth="1.5" />
              <line x1="8" y1="0" x2="0" y2="8" stroke="white" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>{children}</div>
    </div>
  );
}

