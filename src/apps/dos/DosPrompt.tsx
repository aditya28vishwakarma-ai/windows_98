// DosPrompt.tsx — MS-DOS prompt with easter egg commands
import { useState, useRef, useEffect } from "react";
import { useAchievementStore } from "../../os/store/achievementStore";
import styles from "./DosPrompt.module.css";

interface Line {
  text: string;
  type: "output" | "input";
}

const PROMPT = "C:\\WINDOWS>";

const CMD_RESPONSES: Record<string, (args: string) => string[]> = {
  help: () => [
    "Available commands:",
    "  DIR         - List directory contents",
    "  DIR /A      - List ALL files (including hidden)",
    "  CLS         - Clear screen",
    "  VER         - Display Windows version",
    "  FORMAT C:   - Format drive C (try it, Chintu)",
    "  CHINTU      - ???",
    "  LATENT      - Start presentation mode",
    "  HACK        - Attempt something inadvisable",
    "  SUDO        - Wrong OS",
    "  EXIT        - Close this window",
    "  HELP        - Show this help",
    "",
    "Type any command and press ENTER.",
  ],
  dir: (args) => {
    if (args.includes("/a")) {
      return [
        " Volume in drive C is VERMA-PC",
        " Volume Serial Number is 1998-BCDE",
        "",
        " Directory of C:\\",
        "",
        "WINDOWS          <DIR>       14-03-02  10:23a",
        "PROGRAM~1        <DIR>       14-03-02  10:23a",
        "MY DOCU~1        <DIR>       14-03-02  10:23a",
        "GAMES            <DIR>       14-03-02  10:23a",
        "TEMP             <DIR>       14-03-02  10:23a",
        "AUTOEXEC BAT        512      01-01-99  12:00a",
        "CONFIG   SYS        256      01-01-99  12:00a",
        "COMMAND  COM     92768      01-01-99  12:00a",
        "[HIDDEN] SECRETS LOG      2048  14-03-02   8:44p",
        "",
        "        3 File(s)      93,536 bytes",
        "        5 Dir(s)  2,147,483,648 bytes free",
        "(approx. Chintu may have deleted some things)",
      ];
    }
    return [
      " Volume in drive C is VERMA-PC",
      " Volume Serial Number is 1998-BCDE",
      "",
      " Directory of C:\\",
      "",
      "WINDOWS          <DIR>       14-03-02  10:23a",
      "PROGRAM~1        <DIR>       14-03-02  10:23a",
      "MY DOCU~1        <DIR>       14-03-02  10:23a",
      "GAMES            <DIR>       14-03-02  10:23a",
      "TEMP             <DIR>       14-03-02  10:23a",
      "AUTOEXEC BAT        512      01-01-99  12:00a",
      "CONFIG   SYS        256      01-01-99  12:00a",
      "COMMAND  COM     92768      01-01-99  12:00a",
      "",
      "        3 File(s)      93,536 bytes",
      "        5 Dir(s)  2,147,483,648 bytes free",
    ];
  },
  ver: () => [
    "",
    "Microsoft Windows 98 [Version 4.10.2222]",
    "Still better than your last relationship.",
    "",
  ],
  cls: () => ["__CLS__"],
  exit: () => ["__EXIT__"],
  sudo: () => [
    "sudo: command not found",
    "This is Windows 98, not Linux.",
    "Here, we suffer differently.",
  ],
  format: (args) => {
    if (args.includes("c:")) {
      return [
        "WARNING! ALL DATA ON NON-REMOVABLE DISK",
        "DRIVE C: WILL BE LOST!",
        "Proceed with Format (Y/N)?",
        "",
        "Y",
        "",
        "Formatting 4,290 MB",
        "0%  ████████████████████  10%",
        "10% ████████████████████  20%",
        "20% ████████████████████  35%",
        "35% ████████████████████  50%",
        "50% ████████████████████  72%",
        "72% ████████████████████  89%",
        "89% ████████████████████  99%",
        "99%...",
        "",
        "...Aborted by Chintu.",
        "",
        "Format cancelled. C:\\ is safe.",
        "(But Chintu is grounded.)",
      ];
    }
    return ["FORMAT: You must specify a drive letter.", "FORMAT C: to attempt the forbidden."];
  },
  chintu: () => [
    "",
    "Chintu_CS_Pro has entered the chat.",
    "",
    "Sup. a/s/l?",
    "I have 14 kills in CS today.",
    "Papa doesn't know I'm on the computer.",
    "Don't tell him.",
    "",
  ],
  latent: () => [
    "",
    "LATENT PRESENTATION MODE ACTIVATED",
    "=====================================",
    "",
    "Loading: The Abandoned Computer v1.0",
    "Loading: Easter Eggs [##########] DONE",
    "Loading: Laughs [##########] DONE",
    "Loading: Anil's regrets [####......] 40%",
    "",
    "Ready for judging.",
    "Please be kind.",
    "",
    "(Tip: try opening 16 windows for a surprise)",
    "",
  ],
  hack: (args) => {
    if (args.includes("iitbhilai") || args.includes("iit")) {
      return [
        "",
        "INITIATING HACK SEQUENCE...",
        "Connecting to iit-bhilai.ac.in...",
        "Bypassing firewall... [not really]",
        "Accessing mainframe... [IIT Bhilai has no mainframe in 1998]",
        "Downloading student records...",
        "ERROR: Access Denied",
        "REASON: mess food",
        "",
        "(IIT Bhilai will exist in 2016. Please try again then.)",
        "",
      ];
    }
    return [
      "Hack what, exactly?",
      "Try: HACK IITBHILAI",
      "(Results may vary. Chintu has tried this.)",
    ];
  },
};

export default function DosPrompt({ windowId: _ }: { windowId: string }) {
  const [lines, setLines] = useState<Line[]>([
    { text: "Microsoft(R) Windows 98", type: "output" },
    { text: "(C)Copyright Microsoft Corp 1981-1999.", type: "output" },
    { text: "", type: "output" },
    { text: "Type HELP for a list of commands.", type: "output" },
    { text: "(Or type anything. We're not picky.)", type: "output" },
    { text: "", type: "output" },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const unlock = useAchievementStore((s) => s.unlock);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [lines]);

  const runCommand = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) { setLines((l) => [...l, { text: PROMPT, type: "input" }]); return; }

    const [cmd, ...argParts] = trimmed.toUpperCase().split(" ");
    const args = argParts.join(" ").toLowerCase();

    setHistory((h) => [trimmed, ...h].slice(0, 50));
    setHistIdx(-1);

    const handler = CMD_RESPONSES[cmd.toLowerCase()] ?? CMD_RESPONSES[trimmed.toLowerCase()];
    let outputLines: string[];
    if (handler) {
      outputLines = handler(args + " " + trimmed.toLowerCase());
    } else {
      outputLines = [`Bad command or file name: ${cmd}`];
    }

    // Handle special outputs
    if (outputLines[0] === "__CLS__") {
      setLines([]);
      return;
    }
    if (outputLines[0] === "__EXIT__") {
      // signal close — for now just clear
      setLines([{ text: "Goodbye.", type: "output" }]);
      return;
    }

    // Easter eggs
    if (cmd === "CHINTU") unlock("dos-commands", "💻 DOS Chintu Found");
    if (cmd === "LATENT") unlock("dos-commands", "🚀 Latent Demo Mode");
    if (cmd === "HACK") unlock("dos-commands", "🔓 Hack Attempt");
    if (cmd === "VER") unlock("dos-commands", "🖥️ VER command");
    if (cmd === "FORMAT") unlock("dos-commands", "💾 FORMAT C: Attempt");
    if (args.includes("/a") || args === "/a") unlock("hidden-d-drive", "🙈 Hidden Files Found");

    setLines((l) => [
      ...l,
      { text: `${PROMPT} ${trimmed}`, type: "input" },
      ...outputLines.map((t) => ({ text: t, type: "output" as const })),
    ]);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      runCommand(input);
      setInput("");
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(next);
      setInput(history[next] ?? "");
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? "" : (history[next] ?? ""));
    }
  };

  return (
    <div className={styles.dos}>
      <div className={styles.output}>
        {lines.map((line, i) => (
          <div key={i} className={line.type === "input" ? styles.inputLine : styles.outputLine}>
            {line.text || "\u00a0"}
          </div>
        ))}
        {/* Current input line */}
        <div className={styles.currentLine}>
          <span>{PROMPT} </span>
          <span>{input}</span>
          <span className={styles.cursor}>█</span>
        </div>
        <div ref={bottomRef} />
      </div>
      <input
        className={styles.hiddenInput}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        autoFocus
        aria-label="DOS command input"
      />
    </div>
  );
}

