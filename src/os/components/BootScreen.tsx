// BootScreen.tsx — BIOS POST → Windows splash → ScanDisk → Login → Desktop
import { useState, useEffect, useCallback } from "react";
import styles from "./BootScreen.module.css";

type Phase = "bios" | "splash" | "scandisk" | "login" | "done";

interface Props {
  onDone: () => void;
}

const BIOS_LINES = [
  "Award Modular BIOS v4.51PG, An Energy Star Ally",
  "Copyright (C) 1984-98, Award Software, Inc.",
  "",
  "VERMA-PC",
  "",
  "Memory Test:   65536K OK (we counted twice)",
  "Detecting IDE Primary Master... Quantum Fireball 4.3GB",
  "Detecting IDE Primary Slave... None (Chintu claimed it)",
  "Detecting keyboard... Press F1 to continue.",
  "(There is no F1.)",
  "(Pressed anyway.)",
  "",
  "PCI device listing:",
  "  Bus No  Device No  Func No  Vendor/Device Class    IRQ",
  "  0       7          1        Intel 82371AB IDE       14",
  "",
  "Verifying DMI Pool Data........ done",
  "",
  "Starting Windows 98...",
];

export default function BootScreen({ onDone }: Props) {
  const [phase, setPhase] = useState<Phase>("bios");
  const [biosLine, setBiosLine] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [password, setPassword] = useState("");
  const [pwdAttempts, setPwdAttempts] = useState(0);
  const [pwdError, setPwdError] = useState("");
  const [clicked, setClicked] = useState(false);

  // BIOS phase: print lines one by one
  useEffect(() => {
    if (phase !== "bios") return;
    if (biosLine >= BIOS_LINES.length) {
      setTimeout(() => setPhase("splash"), 600);
      return;
    }
    const delay = BIOS_LINES[biosLine] === "" ? 80 : 120;
    const t = setTimeout(() => setBiosLine((n) => n + 1), delay);
    return () => clearTimeout(t);
  }, [phase, biosLine]);

  // Splash phase
  useEffect(() => {
    if (phase !== "splash") return;
    const t = setTimeout(() => setPhase("scandisk"), 2200);
    return () => clearTimeout(t);
  }, [phase]);

  // ScanDisk progress
  useEffect(() => {
    if (phase !== "scandisk") return;
    if (scanProgress >= 100) {
      setTimeout(() => setPhase("login"), 400);
      return;
    }
    const t = setTimeout(() => setScanProgress((n) => n + 2), 30);
    return () => clearTimeout(t);
  }, [phase, scanProgress]);

  const handleLogin = useCallback(() => {
    if (!clicked) {
      // Unlock audio on first click
      setClicked(true);
    }
    const lower = password.toLowerCase().trim();
    if (lower === "tommy" || lower === "" || lower === "password") {
      setPhase("done");
      setTimeout(onDone, 500);
    } else {
      const newAttempts = pwdAttempts + 1;
      setPwdAttempts(newAttempts);
      if (newAttempts >= 3) {
        setPwdError(`Incorrect password.\n\nHint: Tommy. Just typing.`);
      } else {
        setPwdError("Incorrect password. Hint: name of the dog.");
      }
      setPassword("");
    }
  }, [password, pwdAttempts, clicked, onDone]);

  if (phase === "done") return null;

  return (
    <div className={styles.screen}>
      {/* BIOS phase */}
      {phase === "bios" && (
        <div className={styles.bios}>
          {BIOS_LINES.slice(0, biosLine).map((line, i) => (
            <div key={i} className={styles.biosLine}>{line || "\u00a0"}</div>
          ))}
          {biosLine < BIOS_LINES.length && <span className={styles.cursor}>█</span>}
        </div>
      )}

      {/* Win98 splash */}
      {phase === "splash" && (
        <div className={styles.splash}>
          <div className={styles.splashLogo}>
            <div className={styles.logoCloud} />
            <div className={styles.logoText}>
              <span style={{ fontWeight: "normal" }}>Windows</span>
              <span style={{ fontWeight: "bold", color: "#1084d0" }}> 98</span>
            </div>
          </div>
          <div className={styles.splashProgress}>
            <div className={styles.splashBar} />
          </div>
        </div>
      )}

      {/* ScanDisk */}
      {phase === "scandisk" && (
        <div className={styles.scandisk}>
          <div className={styles.scandiskTitle}>ScanDisk</div>
          <p>Your computer was not shut down properly.</p>
          <p><em>Last used: 14 March 2002. Chintu was here.</em></p>
          <p>ScanDisk is now checking drive C for errors...</p>
          <div className={styles.progressOuter}>
            <div className={styles.progressInner} style={{ width: `${scanProgress}%` }} />
          </div>
          <p>{scanProgress}% complete</p>
          <button className="button" onClick={() => { setScanProgress(100); }}>Skip</button>
        </div>
      )}

      {/* Login */}
      {phase === "login" && (
        <div className={styles.loginOverlay}>
          <div className={styles.loginBox}>
            <div className={styles.loginTitle}>
              <img src="/icons/windows-logo.png" alt="" style={{ width: 16, height: 16 }} />
              <span>Welcome to Windows 98</span>
            </div>
            <div className={styles.loginBody}>
              <div className={styles.loginRow}>
                <img src="/icons/user.png" alt="" style={{ width: 32, height: 32 }} />
                <div>
                  <p>Enter your network password for Microsoft Networking.</p>
                </div>
              </div>
              <div className={styles.formRow}>
                <label>User name:</label>
                <input className="field" type="text" value="Anil" readOnly />
              </div>
              <div className={styles.formRow}>
                <label>Password:</label>
                <input
                  className="field"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  autoFocus
                  placeholder="(hint: name of the dog)"
                />
              </div>
              {pwdError && <p className={styles.pwdError}>{pwdError}</p>}
              <div className={styles.loginButtons}>
                <button className="button" onClick={handleLogin}>OK</button>
                <button className="button" onClick={() => { setPhase("done"); setTimeout(onDone, 300); }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

