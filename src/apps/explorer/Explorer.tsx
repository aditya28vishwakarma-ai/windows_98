// Explorer.tsx — My Computer / file explorer
import { useState } from "react";
import { useWindowStore } from "../../os/store/windowStore";
import { useAchievementStore } from "../../os/store/achievementStore";
import { showWin98Alert, showWin98Confirm } from "../../os/store/dialogStore";
import { playClickSound, playRecycleSound } from "../../os/sound";
import { APP_REGISTRY } from "../../os/registry";
import styles from "./Explorer.module.css";

interface FolderItem {
  name: string;
  type: "folder" | "file";
  icon: string;
  path: string;
  special?: string;
}

const TREE: Record<string, FolderItem[]> = {
  root: [
    { name: "My Computer", type: "folder", icon: "/icons/my-computer.png", path: "my-computer" },
    { name: "My Documents", type: "folder", icon: "/icons/my-documents.png", path: "my-documents" },
    { name: "Recycle Bin", type: "folder", icon: "/icons/recycle-bin.png", path: "recycle-bin", special: "recycle" },
    { name: "Network Neighborhood", type: "folder", icon: "/icons/network.png", path: "network" },
  ],
  "my-computer": [
    { name: "3½ Floppy (A:)", type: "folder", icon: "/icons/floppy.png", path: "floppy", special: "floppy" },
    { name: "Local Disk (C:)", type: "folder", icon: "/icons/drive-c.png", path: "c-drive" },
    { name: "ENCARTA_98 (D:)", type: "folder", icon: "/icons/drive-d.png", path: "d-drive" },
    { name: "Control Panel", type: "folder", icon: "/icons/control-panel.png", path: "control-panel", special: "control" },
  ],
  "c-drive": [
    { name: "Windows", type: "folder", icon: "/icons/folder-windows.png", path: "c-windows" },
    { name: "Program Files", type: "folder", icon: "/icons/folder.png", path: "c-programfiles" },
    { name: "My Documents", type: "folder", icon: "/icons/my-documents.png", path: "my-documents" },
    { name: "Games", type: "folder", icon: "/icons/folder.png", path: "c-games" },
    { name: "Temp", type: "folder", icon: "/icons/folder.png", path: "c-temp" },
    { name: "autoexec.bat", type: "file", icon: "/icons/bat.png", path: "autoexec-bat" },
    { name: "config.sys", type: "file", icon: "/icons/sys.png", path: "config-sys" },
  ],
  "my-documents": [
    { name: "1998", type: "folder", icon: "/icons/folder.png", path: "docs-1998" },
    { name: "Letters", type: "folder", icon: "/icons/folder.png", path: "docs-letters" },
    { name: "Recipes", type: "folder", icon: "/icons/folder.png", path: "docs-recipes" },
    { name: "Chintu_Art", type: "folder", icon: "/icons/folder.png", path: "docs-chintu-art" },
    { name: "Downloads", type: "folder", icon: "/icons/folder.png", path: "docs-downloads" },
    { name: "README_FIRST.txt", type: "file", icon: "/icons/txt.png", path: "readme" },
    { name: "last_note.txt", type: "file", icon: "/icons/txt.png", path: "last-note", special: "last-note" },
  ],
  "docs-letters": [
    { name: "letter_to_dadaji.doc", type: "file", icon: "/icons/doc.png", path: "letter-dadaji" },
    { name: "resume_final_FINAL_v3_REAL.doc", type: "file", icon: "/icons/doc.png", path: "resume" },
  ],
  "docs-1998": [
    { name: "y2k_survival_checklist.txt", type: "file", icon: "/icons/txt.png", path: "y2k-checklist" },
    { name: "sachin_sharjah_1998.txt", type: "file", icon: "/icons/txt.png", path: "sachin" },
    { name: "news_clipping_2001.jpg", type: "file", icon: "/icons/jpg.png", path: "news-clipping" },
    { name: "most_wanted_list.jpg", type: "file", icon: "/icons/jpg.png", path: "most-wanted" },
  ],
  "docs-recipes": [
    { name: "mummy_special_dal_makhani.txt", type: "file", icon: "/icons/txt.png", path: "dal-makhani" },
  ],
  "docs-downloads": [
    { name: "free_ram_download.exe", type: "file", icon: "/icons/exe.png", path: "free-ram", special: "free-ram" },
    { name: "NOT_A_VIRUS.exe", type: "file", icon: "/icons/exe.png", path: "not-a-virus", special: "not-a-virus" },
    { name: "cricket_screensaver.scr", type: "file", icon: "/icons/scr.png", path: "screensaver" },
    { name: "kazaa_setup.exe", type: "file", icon: "/icons/exe.png", path: "kazaa" },
  ],
  "recycle-bin": [
    { name: "Latent_Presentation_v1_to_v47.ppt", type: "file", icon: "/icons/ppt.png", path: "latent-ppt" },
    { name: "Our_Hope.doc", type: "file", icon: "/icons/doc.png", path: "our-hope" },
    { name: "sleep.exe", type: "file", icon: "/icons/exe.png", path: "sleep", special: "sleep-restore" },
  ],
  "c-windows": [
    { name: "CREDITS.TXT", type: "file", icon: "/icons/txt.png", path: "credits" },
    { name: "secrets.log", type: "file", icon: "/icons/log.png", path: "secrets-log" },
    { name: "System", type: "folder", icon: "/icons/folder-windows.png", path: "win-system" },
  ],
  "c-temp": [
    { name: "do_not_open.txt", type: "file", icon: "/icons/txt.png", path: "do-not-open", special: "do-not-open" },
  ],
};

// Map file path slugs to text content
const FILE_CONTENT: Record<string, { title: string; content: string; special?: string }> = {
  "readme": { title: "README_FIRST.txt - Notepad", content: `If you are reading this, you found the Verma family computer.\nPlease do not delete anything. Especially Minesweeper.\nChintu: if you read this, remove the "free_ram" file. It does not work.\n- Papa\nP.S. Password hint for Anil's account: "name of the dog". The dog is called Tommy.` },
  "last-note": { title: "last_note.txt - Notepad", content: `Tomorrow we are getting a new computer with Windows XP.\nThis one will stay here and rest. It served us well.\nIt crashed 214 times. I counted.\nGoodbye, little grey machine. Thank you for the memories.\n(Chintu, please shut it down properly this time.)`, special: "last_note" },
  "y2k-checklist": { title: "y2k_survival_checklist.txt - Notepad", content: `Y2K SURVIVAL CHECKLIST — by Anil Verma\n======================================\n☐ Buy candles (Sunita already has 40, should be enough)\n☐ Withdraw all ₹ from bank\n☐ Unplug fridge on Dec 31\n☐ Tell Chintu computers won't explode\n☐ Stock up on chai\n☑ Back up important files onto floppy disk (done — 1 file fit)\n☐ Prepare speech for when planes fall from the sky\n   (Anil's note: "Arrey, we are in Bhilai, no planes here.")` },
  "sachin": { title: "sachin_sharjah_1998.txt - Notepad", content: `My Dearest Grandson (Chintu),\n\nYour Dadaji watched the match on Doordarshan.\nSachin score 143 from 131 balls in the desert storm.\nI cried two times. Once when he hit the six. Once when the power went out.\nLuckily power came back. Unlike Tendulkar's wicket, which never went.\nPlease save this file. It is important for history.\n\nYour loving Dadaji,\n(dictated to Anil who typed it slowly)` },
  "letter-dadaji": { title: "letter_to_dadaji.doc - Notepad", content: `Dear Babuji,\n\nThe computer says "Illegal Operation" again. I have not done anything illegal.\nI was only trying to open the Internet. Chintu says I clicked the wrong button.\nThere are 47 buttons. How am I supposed to know which one?\n\nThe good news: Minesweeper is working fine.\nThe bad news: I still don't know what Minesweeper is for.\n\nPlease write back. Or telephone. The telephone is faster and does not crash.\n\nYour loving son,\nAnil` },
  "resume": { title: "resume_final_FINAL_v3_REAL.doc - Notepad", content: `CURRICULUM VITAE\nAnil Verma, B.E. (Mech.), Bhilai Steel Plant\n\nTECHNICAL SKILLS:\n• Expert in: Ctrl+C\n• Intermediate in: Ctrl+V  \n• Beginner in: Everything else\n\nCOMPUTER PROFICIENCY:\n• MS-DOS: Can type DIR (most of the time)\n• Windows 98: Can turn it on (usually)\n• Internet: Once visited a website. It was slow.\n• Microsoft Word: Typed this document in Notepad.\n\nSALARY EXPECTATION: More than currently received.` },
  "dal-makhani": { title: "mummy_special_dal_makhani.txt - Notepad", content: `Sunita Verma's Famous Dal Makhani\n(Do NOT share with Sharmaji's wife)\n\nINGREDIENTS:\n- Black lentils: 1 cup (overnight soaked)\n- Butter: as much as Anil allows, then add more\n- Cream: same as butter philosophy\n- Salt: depends on mood\n\nINSTRUCTIONS:\n1. Soak lentils overnight.\n2. Pressure cook lentils (6 whistles).\n3. Make masala.\n4. Combine and simmer minimum 8 hours.\n   (Chintu will ask "is food ready" every 20 minutes. Ignore.)\n5. Add cream. Taste. Add more cream. Perfect.\n\nServes: 4, or 2 if Dadaji visits.` },
  "credits": { title: "CREDITS.TXT - Notepad", content: `VERMA-PC — Windows 98 Experience\n==================================\nSystem assembled by: Chintu (do not tell Papa)\n\nOpen-source libraries used:\n• 98.css (MIT) by jdan\n• Zustand (MIT) by pmndrs\n• Vite (MIT) + React 18 (MIT)\n\nIcons: Original pixel art, CC0\nNo Microsoft assets were harmed in the making of this replica.\n(Two keyboards were sacrificed. RIP.)` },
};

export default function Explorer({ windowId: _ }: { windowId: string }) {
  const [currentPath, setCurrentPath] = useState("root");
  const [pathHistory, setPathHistory] = useState(["root"]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const openWindow = useWindowStore((s) => s.openWindow);
  const { unlock } = useAchievementStore.getState();

  const items = TREE[currentPath] ?? [];
  const pathLabel = currentPath === "root" ? "Desktop" : currentPath.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const navigate = (path: string) => {
    playClickSound();
    const newHistory = [...pathHistory.slice(0, historyIndex + 1), path];
    setPathHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPath(path);
    setSelectedItem(null);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      playClickSound();
      setHistoryIndex(historyIndex - 1);
      setCurrentPath(pathHistory[historyIndex - 1]);
    }
  };

  const goForward = () => {
    if (historyIndex < pathHistory.length - 1) {
      playClickSound();
      setHistoryIndex(historyIndex + 1);
      setCurrentPath(pathHistory[historyIndex + 1]);
    }
  };

  const openItem = (item: FolderItem) => {
    playClickSound();
    if (item.type === "folder") {
      if (TREE[item.path]) {
        navigate(item.path);
      } else {
        // Special folders
        if (item.special === "floppy") {
          showWin98Alert(
            "A:\\ is not accessible.\n\nThe device is not ready.\n\n(Chintu bent the floppy disc. Again.)",
            "3½ Floppy (A:)",
            "error"
          );
        } else if (item.special === "control") {
          openWindow("display", "Display Properties", "/icons/settings.png", { w: 400, h: 460 });
        } else if (item.special === "recycle") {
          playRecycleSound();
          unlock("recycle-latent", "🗑️ Recycle Bin Opened");
          navigate("recycle-bin");
        } else {
          showWin98Alert(
            `${item.name}\n\nFolder is empty or access denied.\n\n(Chintu may have reorganised things.)`,
            item.name,
            "warning"
          );
        }
      }
      return;
    }

    // File open
    if (item.special === "free-ram") {
      unlock("free-ram", "⬇️ Free RAM Download");
      showWin98Alert(
        "Downloading 64 MB RAM...\n[████████████████████] 100%\nDone!\n\nYour computer now has 128 MB RAM.\nPlease restart for changes to take effect.\n\n(You are a genius.)",
        "Free RAM Downloader",
        "info"
      );
      return;
    }
    if (item.special === "not-a-virus") {
      unlock("illegal-op", "💥 Illegal Operation");
      showWin98Alert(
        "This program has performed an illegal operation and will be shut down.\n\nDetails:\nAnil caused an invalid page fault in module HAPPINESS.DLL\nat 0137:BADF00D\n\n(The program name is NOT_A_VIRUS.exe. We are not surprised.)",
        "NOT_A_VIRUS.exe",
        "error"
      );
      return;
    }
    if (item.special === "sleep-restore") {
      showWin98Alert(
        "sleep.exe\n\nInsufficient resources to run this program.\n\nClose some applications and try again.\n(Anil has been trying for 4 years.)",
        "sleep.exe",
        "warning"
      );
      return;
    }
    if (item.special === "do-not-open") {
      showWin98Confirm("Are you sure you want to open this? (1/2)", "do_not_open.txt").then((y1) => {
        if (y1) {
          showWin98Confirm("Are you REALLY sure you want to open this? (2/2)", "do_not_open.txt").then((y2) => {
            if (y2) {
              showWin98Alert("Why did you open it.", "do_not_open.txt", "warning");
              unlock("dos-commands", "🙈 Opened do_not_open.txt");
            }
          });
        }
      });
      return;
    }

    const fileData = FILE_CONTENT[item.path];
    if (fileData) {
      const def = APP_REGISTRY["notepad"];
      openWindow("notepad", fileData.title, def.icon, def.defaultSize, {
        filename: item.name,
        content: fileData.content,
        special: fileData.special,
      });
    } else if (item.name.endsWith(".jpg") || item.name.endsWith(".bmp")) {
      const def = APP_REGISTRY["paint"];
      openWindow("paint", `${item.name} - Paint`, def.icon, def.defaultSize);
    } else if (item.name.endsWith(".exe") || item.name.endsWith(".scr")) {
      showWin98Alert(
        `${item.name}\n\nThis program has performed an illegal operation and will be shut down.\n\nDetails: NOPE.DLL not found.`,
        item.name,
        "error"
      );
    } else {
      showWin98Alert(
        `Cannot open ${item.name}.\n\nThere is no program associated with this file type.\n\nWould you like to open it in Notepad? (Anil does everything in Notepad.)`,
        "Open With",
        "warning"
      );
    }
  };

  return (
    <div className={styles.explorer}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <button className={styles.toolBtn} onClick={goBack} disabled={historyIndex <= 0} aria-label="Back">◀ Back</button>
        <button className={styles.toolBtn} onClick={goForward} disabled={historyIndex >= pathHistory.length - 1} aria-label="Forward">Forward ▶</button>
        <button className={styles.toolBtn} onClick={() => navigate("root")} aria-label="Up">⬆ Up</button>
      </div>

      {/* Address bar */}
      <div className={styles.addressBar}>
        <label>Address</label>
        <div className={styles.addressValue}>{pathLabel}</div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.iconGrid}>
          {items.map((item) => (
            <div
              key={item.path}
              className={`${styles.fileIcon} ${selectedItem === item.path ? styles.selected : ""}`}
              onClick={() => setSelectedItem(item.path)}
              onDoubleClick={() => openItem(item)}
              tabIndex={0}
              role="button"
              aria-label={item.name}
              onKeyDown={(e) => e.key === "Enter" && openItem(item)}
            >
              <img src={item.icon} alt="" aria-hidden />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div className={styles.statusBar}>
        <span>{items.length} object(s)</span>
      </div>
    </div>
  );
}

