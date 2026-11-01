// App.tsx — Root shell: boot → desktop + taskbar + global event handling
import { useState, useEffect } from "react";
import BootScreen from "./os/components/BootScreen";
import Desktop from "./os/components/Desktop";
import Taskbar from "./os/components/Taskbar";
import MessageBox from "./os/components/MessageBox";
import { useThemeStore } from "./os/store/themeStore";
import { playStartupSound } from "./os/sound";
import { seedVFS } from "./fs/vfs";
import "./styles/global.css";

type AppPhase = "boot" | "desktop" | "shutdown" | "bsod" | "y2k";

// Y2K clock scramble  
const Y2K_ICONS = ["?", "!", "💾", "💻", "🐛", "⚠️"];

export default function App() {
  const [phase, setPhase] = useState<AppPhase>("boot");
  const [y2kStep, setY2kStep] = useState(0);
  const crtEnabled = useThemeStore((s) => s.crtEnabled);

  useEffect(() => {
    seedVFS();
  }, []);

  // Global event listeners
  useEffect(() => {
    const onBsod = () => setPhase("bsod");
    const onShutdown = () => setPhase("shutdown");
    const onLastNote = () => {
      const desktop = document.getElementById("desktop-root");
      if (desktop) {
        desktop.style.filter = "brightness(0.4)";
        setTimeout(() => {
          desktop.style.filter = "";
        }, 4000);
      }
    };
    const onY2k = () => {
      setPhase("y2k");
      setY2kStep(0);
      let step = 0;
      const t = setInterval(() => {
        step++;
        setY2kStep(step);
        if (step >= 20) {
          clearInterval(t);
          setTimeout(() => setPhase("desktop"), 3000);
        }
      }, 150);
    };

    window.addEventListener("w98:bsod", onBsod);
    window.addEventListener("w98:shutdown", onShutdown);
    window.addEventListener("w98:last-note", onLastNote);
    window.addEventListener("w98:y2k", onY2k);
    return () => {
      window.removeEventListener("w98:bsod", onBsod);
      window.removeEventListener("w98:shutdown", onShutdown);
      window.removeEventListener("w98:last-note", onLastNote);
      window.removeEventListener("w98:y2k", onY2k);
    };
  }, []);

  // Alt+Tab — basic task switcher
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "Tab") {
        e.preventDefault();
        // Cycle windows — handled by windowStore implicitly through focusWindow
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (phase === "boot") {
    return (
      <BootScreen
        onDone={() => {
          setPhase("desktop");
          playStartupSound();
        }}
      />
    );
  }

  if (phase === "bsod") {
    return (
      <div style={{
        position: "fixed", inset: 0, background: "#0000aa", color: "#fff",
        fontFamily: "monospace", fontSize: 14, padding: 32, zIndex: 999999,
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        <div style={{ fontSize: 18, fontWeight: "bold" }}>Windows</div>
        <div>A fatal exception 0E has occurred at 0028:C0011E36 in VXD VMM(01) +</div>
        <div>00010E36. The current application will be terminated.</div>
        <div style={{ marginTop: 16 }}>
          * Press any key to terminate the current application.
        </div>
        <div>* Press CTRL+ALT+DEL to restart your computer. You will</div>
        <div>  lose any unsaved information in all applications.</div>
        <div style={{ marginTop: 16, color: "#ffff00" }}>
          Press any key to continue_
        </div>
        <div style={{ marginTop: 24, fontSize: 12, color: "#aaaaff" }}>
          Hot-tip: Cause: HAPPINESS.DLL not found.
        </div>
        <div style={{ fontSize: 11, color: "#8888ff" }}>
          (Alternatively: Chintu opened too many windows again.)
        </div>
        <div
          style={{ position: "fixed", inset: 0 }}
          onClick={() => { setPhase("boot"); }}
          onKeyDown={(e) => e.key && setPhase("boot")}
          tabIndex={0}
        />
      </div>
    );
  }

  if (phase === "shutdown") {
    let shutdownCount = parseInt(sessionStorage.getItem("w98:shutdowns") ?? "0") + 1;
    sessionStorage.setItem("w98:shutdowns", String(shutdownCount));
    return (
      <div style={{
        position: "fixed", inset: 0, background: "#000", color: "#ff8800",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 24, fontFamily: "monospace", fontSize: 20, zIndex: 999999,
      }}>
        {shutdownCount >= 3 ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "#fff", marginBottom: 16 }}>
              Windows is refusing to shut down.
            </div>
            <div style={{ fontSize: 12, color: "#aaa" }}>
              Reason: Chintu's Winamp is still playing.
            </div>
            <button
              onClick={() => setPhase("desktop")}
              style={{ marginTop: 24, background: "#ff8800", border: "none", padding: "8px 24px", fontSize: 14, cursor: "pointer" }}
            >
              Force Quit Winamp
            </button>
          </div>
        ) : (
          <>
            <div>It's now safe to turn off your computer.</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: -16 }}>
              (Click to restart)
            </div>
            <ShutdownY2k />
          </>
        )}
        <div
          style={{ position: "fixed", inset: 0 }}
          onClick={() => setPhase("boot")}
        />
      </div>
    );
  }

  if (phase === "y2k") {
    return (
      <div style={{
        position: "fixed", inset: 0, background: "#000", display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: 999999, flexDirection: "column", gap: 16,
      }}>
        <div style={{ fontSize: 48, color: "#ff0000", fontFamily: "monospace", fontWeight: "bold" }}>
          Y2K: 00:00:00
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 400 }}>
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} style={{ fontSize: 32 }}>{Y2K_ICONS[(y2kStep + i) % Y2K_ICONS.length]}</div>
          ))}
        </div>
        {y2kStep >= 20 && (
          <div style={{ color: "#00ff00", fontSize: 20, fontFamily: "monospace", textAlign: "center" }}>
            Nothing happened.<br />Panic was unnecessary.
          </div>
        )}
      </div>
    );
  }

  return (
    <div id="desktop-root" style={{ width: "100%", height: "100%", position: "fixed", inset: 0 }}>
      <Desktop />
      <Taskbar />
      <MessageBox />
      {crtEnabled && <div className="crt-overlay" />}
    </div>
  );
}

function ShutdownY2k() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 20000);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return <div style={{ fontSize: 14, color: "#aaa" }}>…please. It's lonely.</div>;
}
