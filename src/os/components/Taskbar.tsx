// Taskbar.tsx — 28px bar with Start, quick launch, task buttons, clock, tray
import { useState, useEffect, useRef } from "react";
import { useWindowStore } from "../store/windowStore";
import { useAchievementStore } from "../store/achievementStore";
import { APP_REGISTRY } from "../registry";
import StartMenu from "./StartMenu";
import styles from "./Taskbar.module.css";

export default function Taskbar() {
  const { windows, focusWindow, minimizeWindow, restoreWindow } = useWindowStore();
  const [startOpen, setStartOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [clockClicks, setClockClicks] = useState(0);
  const [trayTooltip, setTrayTooltip] = useState("");
  const lastAchievement = useAchievementStore((s) => s.lastUnlocked);
  const achievementCount = useAchievementStore((s) => s.count);
  const unlock = useAchievementStore((s) => s.unlock);
  const startRef = useRef<HTMLButtonElement>(null);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Achievement balloon
  useEffect(() => {
    if (!lastAchievement) return;
    setTrayTooltip(`🏆 Secret found: ${lastAchievement} (${achievementCount}/36)`);
    const t = setTimeout(() => setTrayTooltip(""), 4000);
    return () => clearTimeout(t);
  }, [lastAchievement, achievementCount]);

  // Win key → Start menu
  useEffect(() => {
    let winKeyCount = 0;
    let winKeyTimer: number;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Meta" || (e.key === "Escape" && startOpen)) {
        setStartOpen((v) => !v);
        winKeyCount++;
        clearTimeout(winKeyTimer);
        winKeyTimer = window.setTimeout(() => { winKeyCount = 0; }, 2000);
        if (winKeyCount >= 5) {
          alert("Stop it.");
          unlock("win-key", "⊞ Stop pressing me");
          winKeyCount = 0;
        }
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [startOpen, unlock]);

  const handleClockClick = () => {
    const newCount = clockClicks + 1;
    setClockClicks(newCount);
    if (newCount >= 5) {
      setClockClicks(0);
      unlock("click-clock", "🕰️ Y2K Panic");
      window.dispatchEvent(new CustomEvent("w98:y2k"));
    }
  };

  const formatTime = (d: Date) => {
    const h = d.getHours() % 12 || 12;
    const m = d.getMinutes().toString().padStart(2, "0");
    const ampm = d.getHours() >= 12 ? "PM" : "AM";
    return `${h}:${m} ${ampm}`;
  };

  const formatDateFull = (d: Date) =>
    d.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const taskWindows = windows.filter((w) => w.state !== "minimized" || true); // show all in taskbar
  const topZ = Math.max(...windows.map((w) => w.zIndex), 0);
  const activeId = windows.find((w) => w.zIndex === topZ && w.state !== "minimized")?.id;

  return (
    <>
      {startOpen && <StartMenu onClose={() => setStartOpen(false)} />}

      <div className={styles.taskbar}>
        {/* Start button */}
        <button
          ref={startRef}
          className={`${styles.startBtn} ${startOpen ? styles.startBtnActive : ""}`}
          onClick={() => setStartOpen((v) => !v)}
          aria-label="Start"
          aria-expanded={startOpen}
        >
          <img src="/icons/start-flag.png" alt="" aria-hidden className={styles.startFlag} />
          <span>Start</span>
        </button>

        {/* Quick launch separator */}
        <div className={styles.separator} />

        {/* Quick launch */}
        <div className={styles.quickLaunch}>
          {[
            { icon: "/icons/ie.png", label: "Internet Explorer", appId: "ie" },
            { icon: "/icons/outlook.png", label: "Outlook Express", appId: "outlook" },
          ].map((btn) => (
            <button
              key={btn.appId}
              className={styles.quickBtn}
              title={btn.label}
              aria-label={btn.label}
              onClick={() => {
                const { openWindow } = useWindowStore.getState();
                const def = APP_REGISTRY[btn.appId];
                if (def) openWindow(btn.appId, def.title, def.icon, def.defaultSize);
              }}
            >
              <img src={btn.icon} alt="" aria-hidden />
            </button>
          ))}
        </div>

        <div className={styles.separator} />

        {/* Task buttons */}
        <div className={styles.taskArea}>
          {taskWindows.map((win) => (
            <button
              key={win.id}
              className={`${styles.taskBtn} ${activeId === win.id && win.state !== "minimized" ? styles.taskBtnActive : ""}`}
              onClick={() => {
                if (win.state === "minimized") restoreWindow(win.id);
                else if (activeId === win.id) minimizeWindow(win.id);
                else focusWindow(win.id);
              }}
              title={win.title}
            >
              <img src={win.icon} alt="" aria-hidden />
              <span>{win.title}</span>
            </button>
          ))}
        </div>

        {/* System tray */}
        <div className={styles.tray}>
          {trayTooltip && <div className={styles.trayBalloon}>{trayTooltip}</div>}
          <button className={styles.trayIcon} aria-label="Volume" title="Volume: on">
            <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
              <polygon points="1,4 5,4 9,1 9,13 5,10 1,10" fill="#000" />
              <text x="10" y="10" fontSize="8" fill="#000">))))</text>
            </svg>
          </button>
          <button
            className={styles.clockBtn}
            onClick={handleClockClick}
            aria-label={`Time: ${formatTime(time)}`}
            title={formatDateFull(time)}
          >
            {formatTime(time)}
          </button>
        </div>
      </div>
    </>
  );
}

