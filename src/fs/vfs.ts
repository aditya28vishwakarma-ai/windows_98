// vfs.ts — Virtual File System backed by localStorage (simple tree)
// Keys prefixed with w98:v1:fs:

export interface VFSEntry {
  type: "file" | "dir";
  name: string;
  content?: string;         // for files
  children?: string[];      // for dirs: list of child names
  hidden?: boolean;
  readOnly?: boolean;
  modified?: string;        // ISO date string
}

const PREFIX = "w98:v1:fs:";

function key(path: string) {
  return PREFIX + normalizePath(path);
}

export function normalizePath(p: string): string {
  // Lowercase drive, preserve case of rest (Win98: case-insensitive but preserving)
  return p.replace(/\\/g, "/").replace(/\/+/g, "/").replace(/\/$/, "") || "/";
}

function load(path: string): VFSEntry | null {
  try {
    const raw = localStorage.getItem(key(path));
    return raw ? (JSON.parse(raw) as VFSEntry) : null;
  } catch {
    return null;
  }
}

function save(path: string, entry: VFSEntry) {
  try {
    localStorage.setItem(key(path), JSON.stringify(entry));
  } catch {
    // storage full — silently ignore
  }
}

export function readFile(path: string): string | null {
  const e = load(path);
  return e?.type === "file" ? (e.content ?? "") : null;
}

export function writeFile(path: string, content: string) {
  const existing = load(path);
  const name = path.split("/").pop() ?? path;
  save(path, {
    type: "file",
    name,
    content,
    modified: new Date().toISOString(),
    ...(existing ?? {}),
  });
  // Ensure parent dir knows about this child
  const parent = path.substring(0, path.lastIndexOf("/")) || "/";
  addChildToDir(parent, name);
}

export function readDir(path: string): VFSEntry[] {
  const dir = load(path);
  if (!dir || dir.type !== "dir") return [];
  return (dir.children ?? []).map((childName) => {
    const childPath = `${path}/${childName}`;
    return load(childPath) ?? { type: "file", name: childName };
  });
}

function addChildToDir(dirPath: string, childName: string) {
  const dir = load(dirPath) ?? { type: "dir", name: dirPath.split("/").pop() ?? "", children: [] };
  if (dir.type !== "dir") return;
  const children = dir.children ?? [];
  if (!children.includes(childName)) {
    dir.children = [...children, childName];
    save(dirPath, dir);
  }
}

export function mkdir(path: string) {
  const name = path.split("/").pop() ?? path;
  if (!load(path)) {
    save(path, { type: "dir", name, children: [] });
    const parent = path.substring(0, path.lastIndexOf("/")) || "/";
    addChildToDir(parent, name);
  }
}

export function deleteEntry(path: string) {
  try {
    localStorage.removeItem(key(path));
  } catch { /* ignore */ }
  // Remove from parent
  const parent = path.substring(0, path.lastIndexOf("/")) || "/";
  const name = path.split("/").pop() ?? "";
  const dir = load(parent);
  if (dir?.type === "dir" && dir.children) {
    dir.children = dir.children.filter((c) => c !== name);
    save(parent, dir);
  }
}

export function pathExists(path: string): boolean {
  return load(path) !== null;
}

// ── Seed the VFS on first boot ────────────────────────────────

export function seedVFS() {
  if (localStorage.getItem("w98:v1:fs-seeded")) return;

  const dirs = [
    "C:",
    "C:/Windows",
    "C:/Windows/System",
    "C:/Windows/Temp",
    "C:/Program Files",
    "C:/Program Files/Internet Explorer",
    "C:/Program Files/Accessories",
    "C:/Program Files/Games",
    "C:/Program Files/CHINTU_GAMES",
    "C:/My Documents",
    "C:/My Documents/1998",
    "C:/My Documents/Letters",
    "C:/My Documents/Recipes",
    "C:/My Documents/School",
    "C:/My Documents/Chintu_Art",
    "C:/My Documents/Office",
    "C:/My Documents/Downloads",
    "C:/Games",
    "C:/Temp",
    "D:",
    "D:/SECRET",
  ];

  dirs.forEach(mkdir);

  const files: [string, string][] = [
    ["C:/My Documents/README_FIRST.txt",
`If you are reading this, you found the Verma family computer.
Please do not delete anything. Especially Minesweeper.
Chintu: if you read this, remove the "free_ram" file. It does not work.
- Papa
P.S. Password hint for Anil's account: "name of the dog". The dog is called Tommy.`],

    ["C:/My Documents/last_note.txt",
`Tomorrow we are getting a new computer with Windows XP.
This one will stay here and rest. It served us well.
It crashed 214 times. I counted.
Goodbye, little grey machine. Thank you for the memories.
(Chintu, please shut it down properly this time.)`],

    ["C:/My Documents/1998/y2k_survival_checklist.txt",
`Y2K SURVIVAL CHECKLIST — by Anil Verma
======================================
☐ Buy candles (Sunita already has 40, should be enough)
☐ Withdraw all ₹ from bank
☐ Unplug fridge on Dec 31 (the fridge agreed)
☐ Tell Chintu computers won't explode
☐ Hide this list from Dadaji (he'll panic)
☐ Stock up on chai
☑ Back up important files onto floppy disk (done — 1 file fit)
☐ Prepare speech for when planes fall from the sky
   (Anil's note: "Arrey, we are in Bhilai, no planes here.")`],

    ["C:/My Documents/1998/sachin_sharjah_1998.txt",
`My Dearest Grandson (Chintu),

Your Dadaji watched the match on Doordarshan.
Sachin score 143 from 131 balls in the desert storm.
I cried two times. Once when he hit the six. Once when the power went out.
Luckily power came back. Unlike Tendulkar's wicket, which never went.
Please save this file. It is important for history.

Your loving Dadaji,
(dictated to Anil who typed it slowly)`],

    ["C:/My Documents/Letters/letter_to_dadaji.doc",
`Dear Babuji,

The computer says "Illegal Operation" again. I have not done anything illegal.
I was only trying to open the Internet. Chintu says I clicked the wrong button.
There are 47 buttons. How am I supposed to know which one?

The good news: Minesweeper is working fine.
The bad news: I still don't know what Minesweeper is for.

Please write back. Or telephone. The telephone is faster and does not crash.

Your loving son,
Anil`],

    ["C:/My Documents/Letters/resume_final_FINAL_v3_REAL.doc",
`CURRICULUM VITAE
Anil Verma, B.E. (Mech.), Bhilai Steel Plant

TECHNICAL SKILLS:
• Expert in: Ctrl+C
• Intermediate in: Ctrl+V  
• Beginner in: Everything else

COMPUTER PROFICIENCY:
• MS-DOS: Can type DIR (most of the time)
• Windows 98: Can turn it on (usually)
• Internet: Once visited a website. It was slow.
• Microsoft Word: Typed this document in Notepad.

HOBBIES:
• Minesweeper (score: 999 seconds, new personal best)
• Explaining to Chintu why he can't install more games
• Restarting the computer

REFERENCES:
• Sharmaji (next door) — he has two computers
• Dadaji — "very impressed by the screen"

SALARY EXPECTATION: More than currently received.`],

    ["C:/My Documents/Recipes/mummy_special_dal_makhani.txt",
`Sunita Verma's Famous Dal Makhani
(Do NOT share with Sharmaji's wife)

INGREDIENTS:
- Black lentils: 1 cup (overnight soaked)
- Butter: as much as Anil allows, then add more
- Cream: same as butter philosophy
- Tomatoes: 3 (or whatever is in the fridge)
- Ginger-garlic paste: 1 tbsp
- Salt: depends on mood
- Red chilli: depends on who is eating
- Patience: 8 hours minimum

INSTRUCTIONS:
1. Soak lentils overnight. If you forgot, pretend it's 6 hours.
2. Pressure cook lentils (6 whistles, then pretend you weren't counting).
3. Make masala. You know how. Don't ask me again.
4. Combine and simmer on lowest flame for as long as possible.
   (Chintu will ask "is food ready" every 20 minutes. Ignore.)
5. Add cream. Taste. Add more cream. Perfect.

SERVING:
Serve with butter naan. Not diet naan. Real naan.
Serves: 4, or 2 if Dadaji visits.`],

    ["C:/Temp/do_not_open.txt", "Why did you open it."],

    ["C:/Windows/CREDITS.TXT",
`VERMA-PC — Windows 98 Experience
==================================
System assembled by: Chintu (do not tell Papa)
Assistance from: Dadaji's prayers
Coffee provided by: Sunita Verma

Open-source libraries used:
• 98.css (MIT) by jdan — https://jdan.github.io/98.css/
• Zustand (MIT) by pmndrs
• Vite (MIT)
• React 18 (MIT)

Icons: Original pixel art, CC0
Sounds: Synthesised with WebAudio API
Wallpapers: Original artwork, CC0

No Microsoft assets were harmed in the making of this replica.
(Two keyboards were sacrificed. RIP.)`],

    ["D:/SECRET/diary.txt",
`Chintu's Diary — PRIVATE (seriously Papa stop reading)

March 12, 2001:
Played Counter-Strike for 6 hours at the cyber cafe in Sector 5.
Told Mummy I was at the library.
I was not at the library.
The library doesn't have Counter-Strike.

March 15, 2001:
Papa found free_ram_download.exe. I told him it would make the computer faster.
He believed me.
The computer is not faster.
It might be slower.

March 20, 2001:
Discovered a hack: if you press Ctrl+Alt+Del three times fast,
Windows shows a screen with blue text and everything stops.
I thought I broke the computer.
I had not broken the computer.
I think.

April 2, 2001:
Got 98% in Computer Science exam.
Mrs. Das said I should become a programmer.
Papa said engineers earn more.
Dadaji said both should get married first.
I said nothing.`],

    ["D:/SECRET/crush_poem.doc",
`A poem, by Chintu (age 13), for [REDACTED]

Roses are red,
Violets are blue.
You sit in row 3,
And I sit in row 2.

I wanted to say hi,
But the bell rang instead.
I thought of this poem
While studying in bed.

(Note to self: do NOT save this on the family computer.
Note to self 2: too late.)`],

    ["D:/SECRET/passwords.txt",
`PASSWORDS — Chintu's Secret List
(If you found this, congratulations.)

Hotmail account: password
ICQ account: password1
Winamp skin website: password123
Counter-Strike server: dog's name (Tommy)

NOTE: I keep forgetting these so I wrote them down.
The irony of saving "passwords.txt" was not lost on me.
(Actually it was lost on me. I was 13.)`],

    ["C:/My Documents/Downloads/free_ram_download.exe",
`[This is a Windows executable. Cannot preview in Notepad.]
(It doesn't work, Chintu. — Papa)`],

    ["C:/My Documents/Downloads/NOT_A_VIRUS.exe",
`NOT_A_VIRUS.EXE
Developed by: Definitely Not A Virus Inc.
Version: 1.0 (trust us)
Description: This is absolutely not a virus.
             Please run as administrator.
             Also please disable your antivirus first.
             Just for testing. Nothing suspicious.`],
  ];

  files.forEach(([path, content]) => writeFile(path, content));
  localStorage.setItem("w98:v1:fs-seeded", "1");
}

