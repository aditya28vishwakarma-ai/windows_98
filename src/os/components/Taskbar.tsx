// Taskbar.tsx — 28px bar with Start, quick launch, task buttons, clock, tray
import { useState, useEffect, useRef } from "react";
import { useWindowStore } from "../store/windowStore";
import { useAchievementStore } from "../store/achievementStore";
import { APP_REGISTRY } from "../registry";
import { isSoundEnabled, setSoundEnabled, getMasterVolume, setMasterVolume, playClickSound } from "../sound";
import StartMenu from "./StartMenu";
import styles from "./Taskbar.module.css";

export default function Taskbar() {
  const { windows, focusWindow, minimizeWindow, restoreWindow } = useWindowStore();
  const [startOpen, setStartOpen] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [volume, setVolume] = useState(getMasterVolume());
  const [muted, setMuted] = useState(!isSoundEnabled());
  const [time, setTime] = useState(new Date());
  const [clockClicks, setClockClicks] = useState(0);
  const [trayTooltip, setTrayTooltip] = useState("");
  const lastAchievement = useAchievementStore((s) => s.lastUnlocked);
  const achievementCount = useAchievementStore((s) => s.count);
  const unlock = useAchievementStore((s) => s.unlock);
  const startRef = useRef<HTMLButtonElement>(null);
  const volRef = useRef<HTMLDivElement>(null);

  // Close volume on click outside
  useEffect(() => {
    if (!volumeOpen) return;
    const onClick = (e: MouseEvent) => {
      if (volRef.current && !volRef.current.contains(e.target as Node)) {
        setVolumeOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [volumeOpen]);

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
          onClick={() => {
            playClickSound();
            setStartOpen((v) => !v);
          }}
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
                playClickSound();
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
                playClickSound();
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

          {/* Volume Popup */}
          {volumeOpen && (
            <div className={styles.volumePopup} ref={volRef}>
              <div className={styles.volHeader}>Volume</div>
              <div className={styles.volBody}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  className={styles.volSlider}
                  value={muted ? 0 : volume}
                  disabled={muted}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    setMasterVolume(v);
                  }}
                />
                <label className={styles.muteLabel}>
                  <input
                    type="checkbox"
                    checked={muted}
                    onChange={(e) => {
                      const isMuted = e.target.checked;
                      setMuted(isMuted);
                      setSoundEnabled(!isMuted);
                    }}
                  />
                  <span>Mute</span>
                </label>
              </div>
            </div>
          )}

          <button
            className={styles.trayIcon}
            aria-label="Volume"
            title={`Volume: ${muted ? "Muted" : `${Math.round(volume * 100)}%`}`}
            onClick={() => {
              playClickSound();
              setVolumeOpen((v) => !v);
            }}
          >
            <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
              <polygon points="1,4 5,4 9,1 9,13 5,10 1,10" fill={muted ? "#808080" : "#000"} />
              {!muted ? (
                <text x="10" y="10" fontSize="8" fill="#000">))))</text>
              ) : (
                <line x1="10" y1="3" x2="15" y2="11" stroke="#cc0000" strokeWidth="1.5" />
              )}
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

