// Notepad.tsx — functional text editor
import { useState, useEffect, useRef } from "react";
import { useWindowStore } from "../../os/store/windowStore";
import { useAchievementStore } from "../../os/store/achievementStore";
import { showWin98Alert, showWin98Confirm } from "../../os/store/dialogStore";
import { playClickSound } from "../../os/sound";
import { writeFile } from "../../fs/vfs";
import styles from "./Notepad.module.css";

interface Props {
  windowId: string;
}

// Judge easter egg: type "Hello Judges"
const JUDGE_TRIGGER = "hello judges";
const JUDGE_REPLY = "\nWe know you're judging. Please be kind.\n- The Computer";

export default function Notepad({ windowId }: Props) {
  const win = useWindowStore((s) => s.windows.find((w) => w.id === windowId));
  const setTitle = useWindowStore((s) => s.setTitle);
  const unlock = useAchievementStore((s) => s.unlock);

  const initialContent = (win?.data?.content as string) ?? "";
  const initialFilename = (win?.data?.filename as string) ?? "Untitled";
  const special = win?.data?.special as string | undefined;

  const [text, setText] = useState(initialContent);
  const [filename, setFilename] = useState(initialFilename);
  const [wordWrap, setWordWrap] = useState(false);
  const [dirty, setDirty] = useState(false);
  const judgeRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // last_note special egg
  useEffect(() => {
    if (special === "last_note") {
      window.dispatchEvent(new CustomEvent("w98:last-note"));
      unlock("last-note", "📝 Found the Last Note");
    }
  }, [special, unlock]);

  const handleChange = (val: string) => {
    setText(val);
    setDirty(true);

    // Judge egg
    if (!judgeRef.current && val.toLowerCase().includes(JUDGE_TRIGGER)) {
      judgeRef.current = true;
      unlock("notepad-secret", "🧑‍⚖️ Hello Judges");
      setTimeout(() => {
        setText((prev) => prev + JUDGE_REPLY);
        if (textareaRef.current) {
          textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
      }, 1200);
    }
  };

  const handleNew = async () => {
    if (dirty) {
      const ok = await showWin98Confirm("The text has been changed.\nDo you want to discard changes?", "Notepad");
      if (!ok) return;
    }
    setText("");
    setFilename("Untitled");
    setDirty(false);
    setTitle(windowId, "Untitled - Notepad");
  };

  const handleSave = () => {
    const path = `C:/My Documents/${filename}`;
    writeFile(path, text);
    setDirty(false);
    setTitle(windowId, `${filename} - Notepad`);
    showWin98Alert(`File saved to ${path}`, "Notepad", "info");
  };

  const handleSaveAs = () => {
    const name = prompt("Save As:", filename);
    if (name) {
      setFilename(name);
      const path = `C:/My Documents/${name}`;
      writeFile(path, text);
      setDirty(false);
      setTitle(windowId, `${name} - Notepad`);
      showWin98Alert(`File saved as ${path}`, "Notepad", "info");
    }
  };

  return (
    <div className={styles.notepad}>
      {/* Menu bar */}
      <div className={styles.menubar}>
        {[
          {
            label: "File",
            items: [
              { label: "New", action: handleNew },
              { label: "Open...", action: () => showWin98Alert("Open dialog coming soon.\nUse My Computer to open files.", "Notepad", "info") },
              { label: "Save", action: handleSave },
              { label: "Save As...", action: handleSaveAs },
              null,
              { label: "Exit", action: () => useWindowStore.getState().closeWindow(windowId) },
            ],
          },
          {
            label: "Edit",
            items: [
              { label: "Undo", action: () => document.execCommand("undo") },
              null,
              { label: "Cut", action: () => document.execCommand("cut") },
              { label: "Copy", action: () => document.execCommand("copy") },
              { label: "Paste", action: () => document.execCommand("paste") },
              { label: "Delete", action: () => document.execCommand("delete") },
              null,
              { label: "Select All", action: () => textareaRef.current?.select() },
            ],
          },
          {
            label: "Search",
            items: [
              {
                label: "Find...",
                action: () => {
                  const q = prompt("Find:");
                  if (q) {
                    const i = text.indexOf(q);
                    if (i === -1) showWin98Alert(`"${q}" not found.`, "Notepad", "warning");
                  }
                },
              },
            ],
          },
          {
            label: "Format",
            items: [
              { label: wordWrap ? "✓ Word Wrap" : "Word Wrap", action: () => setWordWrap((v) => !v) },
              { label: "Font...", action: () => showWin98Alert("Font: Fixedsys\nSize: 12\n\n(This is the only font. It is perfect.)", "Font", "info") },
            ],
          },
          {
            label: "Help",
            items: [
              { label: "Help Topics", action: () => showWin98Alert("Notepad Help\n\nNotepad is a basic text editor.\nIt edits text.\nGoodbye.", "Notepad Help", "info") },
              null,
              { label: "About Notepad", action: () => showWin98Alert("Notepad\nWindows 98\n\nThis copy of Notepad is licensed to:\nAnil Verma, Sector 6, Bhilai\n\n(Originally typed by Chintu, who then denied it.)", "About Notepad", "info") },
            ],
          },
        ].map((menu) => (
          <MenuButton key={menu.label} label={menu.label} items={menu.items} />
        ))}
      </div>

      {/* Text area */}
      <textarea
        ref={textareaRef}
        className={`${styles.editor} ${wordWrap ? styles.wrap : ""}`}
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        spellCheck={false}
        aria-label="Text editor"
      />

      {/* Status bar */}
      <div className={styles.statusBar}>
        <span>{dirty ? "Modified" : "Ready"}</span>
      </div>
    </div>
  );
}

// Inline dropdown menu button
interface MenuBtnProps {
  label: string;
  items: Array<{ label: string; action: () => void } | null>;
}

function MenuButton({ label, items }: MenuBtnProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        className={styles.menuBtn}
        onClick={() => {
          playClickSound();
          setOpen((v) => !v);
        }}
        onMouseEnter={() => open && setOpen(true)}
      >
        {label}
      </button>
      {open && (
        <div className="context-menu" style={{ position: "absolute", top: "100%", left: 0, zIndex: 99999 }}>
          {items.map((item, i) =>
            item === null ? (
              <div key={i} className="context-separator" />
            ) : (
              <button
                key={item.label}
                className="context-item"
                onMouseDown={() => {
                  playClickSound();
                  item.action();
                  setOpen(false);
                }}
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

