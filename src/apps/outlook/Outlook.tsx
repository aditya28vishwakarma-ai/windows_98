// Outlook.tsx — 3-pane email client with seeded inbox
import { useState } from "react";
import { useAchievementStore } from "../../os/store/achievementStore";
import { playClickSound, playChordSound } from "../../os/sound";
import styles from "./Outlook.module.css";

interface Email {
  id: string;
  from: string;
  subject: string;
  date: string;
  body: string;
  read: boolean;
  special?: string;
}

const INBOX: Email[] = [
  {
    id: "judges",
    from: "Judges@Latent",
    subject: "You found the computer. We saw you.",
    date: "01 Nov 2026",
    body: "You found the computer.\n\nWe saw you.\n\n100 points.\n\n— The Judges\n\nP.S. Nice work navigating to the inbox.",
    read: false,
    special: "outlook-judges",
  },
  {
    id: "iloveyou",
    from: "unknown@internet",
    subject: "ILOVEYOU ❤️",
    date: "04 May 2000",
    body: "I Love You (attachment: LOVE-LETTER-FOR-YOU.vbs.txt)\n\n[ATTACHMENT DETECTED]\n\nkindly check the attached LOVELETTER coming from me.",
    read: false,
    special: "iloveyou-virus",
  },
  {
    id: "hotmail",
    from: "no-reply@hotmailer.com",
    subject: "Welcome to Hotmail!",
    date: "14 Mar 1998",
    body: "Dear Anil,\n\nWelcome to Hotmail! Your free email account is ready.\n\nYour inbox: 2 MB (currently 94% full)\n\nNote: Please delete some emails. Especially the forwards from Sharmaji.\nThere are 47 of them. They are all about a girl in Sector 9.\n\nHappy emailing!\n\n— The Hotmail Team\n\n(This is not Hotmail. This is Hotmailer. Completely different.)",
    read: true,
  },
  {
    id: "nigeria",
    from: "prince.nigerian.royal@yahoo.com",
    subject: "URGENT BUSINESS PROPOSAL — STRICTLY CONFIDENTIAL",
    date: "22 Jan 2001",
    body: "Dear Friend,\n\nI am HRH Prince Emmanuel Okonkwo, son of the late King of Nigeria.\n\nI have been advised by my trusted advisor (also me) to contact you regarding the transfer of USD 47 MILLION from our royal bank account.\n\nAll I need from you is:\n1. Your full name\n2. Your bank account number\n3. Your Windows password\n4. Your dog's name (for security)\n\nIn return, you will receive 30% of the total.\n\nPlease respond URGENTLY. This offer expires soon.\n(It does not expire. I will email again.)\n\nGod bless,\nPrince Emmanuel",
    read: false,
  },
  {
    id: "sharma",
    from: "sharmaji@hotmailer.com",
    subject: "FWD: FWD: FWD: FWD: GIRL IN SECTOR 9 SENDS ₹7 LAKH!!",
    date: "03 Mar 2001",
    body: "FWD: FWD: FWD: FWD: FWD:\n\nDear Friend,\n\nA girl in Sector 9 sent this message to 10 friends.\nOf those 10 friends, 7 received promotions.\n2 found money on the road.\n1 finally beat Minesweeper.\n\nFORWARD THIS TO 10 FRIENDS OR BAD LUCK WILL FOLLOW.\n\n(Anil received this 14 times. He forwarded it 0 times. His luck: unchanged.)\n\n— Sharmaji",
    read: true,
  },
  {
    id: "babuji",
    from: "babuji_dadaji@???",
    subject: "Re: Computer kaisa hai?",
    date: "15 Feb 2001",
    body: "Beta Anil,\n\nYour computer is very nice. I sat in front of it for 20 minutes.\nI pressed every button. The screen made a sound.\nI think I may have deleted something.\nPlease ask Chintu to fix it.\n\nAlso, ask Chintu to teach me how to open the Internet.\nI want to read about Sachin. They say it is all on the Internet now.\n\nYour loving father,\nBabuji (dictated to the postman)\n\nP.S. What is a 'cookie'? The screen asked me to accept one. I said yes.",
    read: false,
  },
  {
    id: "principal",
    from: "principal.das@bsp-school.edu",
    subject: "Chintu's Computer Science Marks",
    date: "21 Nov 2001",
    body: "Dear Mr. Anil Verma,\n\nThis is to inform you that your son Chintu has received 98/100 in the Computer Science examination.\n\nHe lost 2 marks because he wrote 'Ctrl+C to copy, Ctrl+V to paste, Ctrl+Alt+Del to win' in the essay section.\n\nWhile technically accurate, the examiners felt this was insufficient for a 500-word response.\n\nChintu is a gifted student. Please ensure he uses his gifts for good and not for downloading suspicious .exe files.\n\nRegards,\nMrs. Das\nPrincipal, BSP Senior Secondary School\n\nP.S. Please return Minesweeper to the computer lab.",
    read: true,
  },
  {
    id: "icq",
    from: "ICQ System Message",
    subject: "Chintu_CS_Pro has added you",
    date: "06 Jun 2000",
    body: "ICQ MESSAGE\n\nYour ICQ contact list has a new addition:\n\nNickname: Chintu_CS_Pro\nICQ#: 12345678\nStatus: Online (playing Counter-Strike)\n\n--- Message from Chintu_CS_Pro ---\nyo papa if you see this please dont delete my files\nI am busy. 14 kills today. new record\nplease buy me CD-ROM for birthday\nkthxbye",
    read: true,
  },
  {
    id: "bank",
    from: "y2k-compliance@bank.in",
    subject: "Y2K Compliance Certificate — Account Holder",
    date: "28 Dec 1999",
    body: "Dear Account Holder,\n\nWe are pleased to inform you that our banking systems are fully Y2K compliant.\n\nThis means:\n✓ Your money will not disappear at midnight on December 31\n✓ ATMs will continue to function\n✓ Bank computers will not explode\n✓ 2000 will be correctly identified as the year 2000 (not 1900)\n\nYou may safely keep your savings in the bank.\nThere is no need to withdraw everything in cash.\n\n(We notice you already withdrew everything. Please re-deposit at your convenience.)\n\nHappy New Millennium!\n\n— Your Bank\n\nP.S. Please ignore any emails from Nigerian Princes.",
    read: true,
  },
  {
    id: "mummy",
    from: "sunita.verma@home",
    subject: "Dal Makhani recipe (the REAL one)",
    date: "10 Oct 2001",
    body: "Anil,\n\nI know you saved my recipe on the computer. I checked.\nYou typed 'salt: depends on mood' correctly. Good job.\n\nHere is the real secret ingredient: patience.\nAlso butter. More butter than you think.\nThen more.\n\nDo not share this recipe with Sharmaji's wife.\nI am serious.\n\nAlso please ask Chintu to stop using the computer at 2am.\nI can hear the dial-up from the bedroom.\n\n— Mummy\n\nP.S. The password for the email is Tommy. Same as everything else.",
    read: false,
  },
];

const FOLDERS = ["Inbox", "Sent Items", "Drafts", "Deleted Items", "Outbox"];

export default function Outlook({ windowId: _ }: { windowId: string }) {
  const [selectedFolder, setSelectedFolder] = useState("Inbox");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emails, setEmails] = useState(INBOX);
  const [virusActive, setVirusActive] = useState(false);
  const unlock = useAchievementStore((s) => s.unlock);

  const markRead = (id: string) => {
    setEmails((prev) => prev.map((e) => e.id === id ? { ...e, read: true } : e));
  };

  const openEmail = (email: Email) => {
    playClickSound();
    setSelectedEmail(email);
    markRead(email.id);

    if (email.special === "outlook-judges") {
      unlock("outlook-judges", "🏆 Found the Judges Email");
      window.dispatchEvent(new CustomEvent("w98:confetti"));
    }
    if (email.special === "iloveyou-virus") {
      playChordSound();
      unlock("fake-virus-iloveyou", "💌 ILOVEYOU Prank");
      setVirusActive(true);
      setTimeout(() => setVirusActive(false), 4000);
    }
  };

  const unreadCount = emails.filter((e) => !e.read).length;

  return (
    <div className={styles.outlook}>
      {/* Virus prank overlay */}
      {virusActive && (
        <div className={styles.virusOverlay}>
          <div className={styles.virusContent}>
            <p>Deleting C:\Windows\System32...</p>
            <p>Deleting C:\My Documents\...</p>
            <p>Deleting C:\Minesweeper...</p>
            <p style={{ color: "#0f0", marginTop: 16 }}>JUST KIDDING 😄</p>
            <p>Your files are fine. Mostly.</p>
          </div>
        </div>
      )}

      {/* Left: folder tree */}
      <div className={styles.folderPane}>
        <div className={styles.folderHeader}>Folders</div>
        {FOLDERS.map((f) => (
          <div
            key={f}
            className={`${styles.folderItem} ${selectedFolder === f ? styles.folderSelected : ""}`}
            onClick={() => setSelectedFolder(f)}
          >
            📁 {f}
            {f === "Inbox" && unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount}</span>
            )}
          </div>
        ))}
      </div>

      {/* Middle: email list */}
      <div className={styles.listPane}>
        <div className={styles.listHeader}>
          <span>From</span>
          <span>Subject</span>
          <span>Date</span>
        </div>
        {selectedFolder === "Inbox" ? (
          emails.map((email) => (
            <div
              key={email.id}
              className={`${styles.emailRow} ${!email.read ? styles.unread : ""} ${selectedEmail?.id === email.id ? styles.emailSelected : ""}`}
              onClick={() => openEmail(email)}
            >
              <span>{email.from}</span>
              <span>{email.subject}</span>
              <span>{email.date}</span>
            </div>
          ))
        ) : (
          <div className={styles.emptyFolder}>This folder is empty.</div>
        )}
      </div>

      {/* Right: preview pane */}
      <div className={styles.previewPane}>
        {selectedEmail ? (
          <div className={styles.emailView}>
            <div className={styles.emailHeader}>
              <div><b>From:</b> {selectedEmail.from}</div>
              <div><b>Subject:</b> {selectedEmail.subject}</div>
              <div><b>Date:</b> {selectedEmail.date}</div>
            </div>
            <div className={styles.emailBody}>{selectedEmail.body}</div>
          </div>
        ) : (
          <div className={styles.noPreview}>Select a message to read.</div>
        )}
      </div>
    </div>
  );
}

