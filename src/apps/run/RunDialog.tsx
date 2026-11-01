// RunDialog.tsx — Authentic Windows 98 Run dialog
import { useState } from "react";
import { useWindowStore } from "../../os/store/windowStore";
import { APP_REGISTRY } from "../../os/registry";
import { showWin98Alert } from "../../os/store/dialogStore";
import { playClickSound } from "../../os/sound";
import styles from "./RunDialog.module.css";

interface Props {
  windowId: string;
}

export default function RunDialog({ windowId }: Props) {
  const [cmd, setCmd] = useState("");
  const { openWindow, closeWindow } = useWindowStore();

  const handleRun = () => {
    playClickSound();
    const c = cmd.trim().toLowerCase();
    closeWindow(windowId);

    if (!c) return;

    if (c.includes("cmd") || c.includes("dos") || c === "command") {
      const def = APP_REGISTRY["dos"];
      openWindow("dos", def.title, def.icon, def.defaultSize);
    } else if (c.includes("calc")) {
      const def = APP_REGISTRY["calculator"];
      openWindow("calculator", def.title, def.icon, def.defaultSize);
    } else if (c.includes("paint") || c.includes("mspaint")) {
      const def = APP_REGISTRY["paint"];
      openWindow("paint", def.title, def.icon, def.defaultSize);
    } else if (c.includes("note") || c.includes("notepad")) {
      const def = APP_REGISTRY["notepad"];
      openWindow("notepad", def.title, def.icon, def.defaultSize);
    } else if (c.includes("mine") || c.includes("winmine")) {
      const def = APP_REGISTRY["minesweeper"];
      openWindow("minesweeper", def.title, def.icon, def.defaultSize);
    } else if (c.includes("sol") || c.includes("solitaire")) {
      const def = APP_REGISTRY["solitaire"];
      openWindow("solitaire", def.title, def.icon, def.defaultSize);
    } else if (c.includes("iexplore") || c.includes("ie") || c.includes("www") || c.includes("http")) {
      const def = APP_REGISTRY["ie"];
      openWindow("ie", def.title, def.icon, def.defaultSize);
    } else if (c.includes("display") || c.includes("desk.cpl")) {
      const def = APP_REGISTRY["display"];
      openWindow("display", def.title, def.icon, def.defaultSize);
    } else {
      showWin98Alert(
        `Cannot find '${cmd}'.\n\nMake sure you typed the name correctly, and then try again.\n(Or ask Chintu.)`,
        cmd,
        "error"
      );
    }
  };

  return (
    <div className={styles.run}>
      <div className={styles.topRow}>
        <img src="/icons/run.png" alt="" className={styles.icon} />
        <div className={styles.desc}>
          Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.
        </div>
      </div>

      <div className={styles.inputRow}>
        <label className={styles.label}>Open:</label>
        <input
          className={styles.input}
          type="text"
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRun()}
          autoFocus
          placeholder="e.g. calc, notepad, dos, ie, paint..."
        />
      </div>

      <div className={styles.buttons}>
        <button className={styles.btn} onClick={handleRun}>OK</button>
        <button className={styles.btn} onClick={() => { playClickSound(); closeWindow(windowId); }}>Cancel</button>
        <button className={styles.btn} onClick={() => showWin98Alert("Browse dialog not available on 56k modem.", "Browse")}>Browse...</button>
      </div>
    </div>
  );
}
