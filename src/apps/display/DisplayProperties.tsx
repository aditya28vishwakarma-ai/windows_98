// DisplayProperties.tsx — Authentic Windows 98 Display Properties dialog
import { useState, useRef, useEffect } from "react";
import { useThemeStore, type WallpaperId } from "../../os/store/themeStore";
import { useWindowStore } from "../../os/store/windowStore";
import { isSoundEnabled, setSoundEnabled, playClickSound } from "../../os/sound";
import styles from "./DisplayProperties.module.css";

interface Props {
  windowId: string;
}

const WALLPAPERS: { id: WallpaperId; name: string }[] = [
  { id: "teal", name: "Classic Teal (Default)" },
  { id: "clouds", name: "Windows 98 Clouds" },
  { id: "navy", name: "Navy Blue" },
  { id: "setup", name: "MS-DOS Setup Blue" },
  { id: "black", name: "Matrix Darkness" },
];

export default function DisplayProperties({ windowId }: Props) {
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const currentWallpaper = useThemeStore((s) => s.wallpaper);
  const setWallpaper = useThemeStore((s) => s.setWallpaper);
  const crtEnabled = useThemeStore((s) => s.crtEnabled);
  const setCrtEnabled = useThemeStore((s) => s.setCrtEnabled);

  const [activeTab, setActiveTab] = useState<"background" | "screensaver" | "effects">("background");
  const [selectedWp, setSelectedWp] = useState<WallpaperId>(currentWallpaper);
  const [tempCrt, setTempCrt] = useState(crtEnabled);
  const [tempSound, setTempSound] = useState(isSoundEnabled());

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Starfield screen saver animation in the preview monitor
  useEffect(() => {
    if (activeTab !== "screensaver") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const stars = Array.from({ length: 60 }, () => ({
      x: (Math.random() - 0.5) * canvas.width * 2,
      y: (Math.random() - 0.5) * canvas.height * 2,
      z: Math.random() * canvas.width,
    }));

    const render = () => {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      stars.forEach((s) => {
        s.z -= 1.5;
        if (s.z <= 0) {
          s.z = canvas.width;
          s.x = (Math.random() - 0.5) * canvas.width * 2;
          s.y = (Math.random() - 0.5) * canvas.height * 2;
        }

        const k = 120 / s.z;
        const px = s.x * k + cx;
        const py = s.y * k + cy;

        if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
          const size = Math.max(1, (1 - s.z / canvas.width) * 2.5);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(px, py, size, size);
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeTab]);

  const handleApply = () => {
    playClickSound();
    setWallpaper(selectedWp);
    setCrtEnabled(tempCrt);
    setSoundEnabled(tempSound);
  };

  const handleOk = () => {
    handleApply();
    closeWindow(windowId);
  };

  const handleCancel = () => {
    playClickSound();
    closeWindow(windowId);
  };

  return (
    <div className={styles.displayProps}>
      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "background" ? styles.tabActive : ""}`}
          onClick={() => { playClickSound(); setActiveTab("background"); }}
        >
          Background
        </button>
        <button
          className={`${styles.tab} ${activeTab === "screensaver" ? styles.tabActive : ""}`}
          onClick={() => { playClickSound(); setActiveTab("screensaver"); }}
        >
          Screen Saver
        </button>
        <button
          className={`${styles.tab} ${activeTab === "effects" ? styles.tabActive : ""}`}
          onClick={() => { playClickSound(); setActiveTab("effects"); }}
        >
          Effects
        </button>
      </div>

      {/* Tab Body */}
      <div className={styles.tabContent}>
        {/* Monitor Bezel */}
        <div className={styles.monitorContainer}>
          <div>
            <div className={styles.monitorBezel}>
              <div className={styles.monitorScreen}>
                {activeTab === "background" && (
                  <div className={`${styles.screenPreview} wallpaper-${selectedWp}`}>
                    {/* Mini icons on simulated desktop */}
                    <div style={{ position: "absolute", left: 4, top: 4, width: 8, height: 8, background: "#3a6ea5" }} />
                    <div style={{ position: "absolute", left: 4, top: 16, width: 8, height: 8, background: "#ffcc00" }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 6, background: "#c0c0c0", borderTop: "1px solid #fff" }} />
                  </div>
                )}
                {activeTab === "screensaver" && (
                  <canvas ref={canvasRef} width={136} height={84} className={styles.monitorScreenSaverCanvas} />
                )}
                {activeTab === "effects" && (
                  <div
                    className={`${styles.screenPreview} wallpaper-${selectedWp}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: "bold",
                      textShadow: "1px 1px #000",
                    }}
                  >
                    {tempCrt ? "📺 CRT Active" : "Flat Panel"}
                  </div>
                )}
              </div>
              <div className={styles.monitorLed} />
            </div>
            <div className={styles.monitorStand} />
            <div className={styles.monitorBase} />
          </div>
        </div>

        {/* Tab 1: Background */}
        {activeTab === "background" && (
          <div className={styles.formRow}>
            <label className={styles.label}>Select a background wallpaper:</label>
            <div className={styles.listWrap}>
              {WALLPAPERS.map((wp) => (
                <div
                  key={wp.id}
                  className={`${styles.listItem} ${selectedWp === wp.id ? styles.listItemSelected : ""}`}
                  onClick={() => { playClickSound(); setSelectedWp(wp.id); }}
                >
                  <span>🖼️</span>
                  <span>{wp.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Screen Saver */}
        {activeTab === "screensaver" && (
          <div className={styles.formRow}>
            <label className={styles.label}>Screen Saver</label>
            <select
              style={{ padding: "2px 4px", fontSize: 11, fontFamily: "inherit" }}
              defaultValue="starfield"
            >
              <option value="starfield">3D Starfield Simulation</option>
              <option value="pipes">3D Pipes (Chintu's Favourite)</option>
              <option value="blank">Blank Screen</option>
            </select>
            <div style={{ marginTop: 8, fontSize: 11, color: "#444" }}>
              Wait: <strong>15</strong> minutes before launching.
            </div>
            <div style={{ fontSize: 10, color: "#666", marginTop: 4 }}>
              (Anil's note: "Leave it on, it keeps the computer warm.")
            </div>
          </div>
        )}

        {/* Tab 3: Effects */}
        {activeTab === "effects" && (
          <div className={styles.formRow}>
            <label className={styles.label}>Visual & Audio Enhancements</label>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={tempCrt}
                onChange={(e) => setTempCrt(e.target.checked)}
              />
              <span>Enable Cathode Ray Tube (CRT) scanline filter</span>
            </label>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={tempSound}
                onChange={(e) => setTempSound(e.target.checked)}
              />
              <span>Enable 16-bit Web Audio synthesised sound effects</span>
            </label>
            <div style={{ marginTop: 6, fontSize: 10, color: "#666" }}>
              CRT overlay adds authentic horizontal scanlines, phosphor glow, and subtle monitor curvature.
            </div>
          </div>
        )}
      </div>

      {/* Button Row */}
      <div className={styles.btnRow}>
        <button className={styles.actionBtn} onClick={handleOk}>OK</button>
        <button className={styles.actionBtn} onClick={handleCancel}>Cancel</button>
        <button className={styles.actionBtn} onClick={handleApply}>Apply</button>
      </div>
    </div>
  );
}
