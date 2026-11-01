// StartMenu.tsx — hierarchical start menu with cascading submenus
import { useState, useEffect, useRef } from "react";
import { useWindowStore } from "../store/windowStore";
import { showWin98Alert, showWin98Confirm } from "../store/dialogStore";
import { playClickSound } from "../sound";
import { APP_REGISTRY } from "../registry";
import styles from "./StartMenu.module.css";

interface Props {
  onClose: () => void;
}

interface MenuItem {
  label?: string;
  icon?: string;
  action?: () => void;
  children?: MenuItem[];
  separator?: boolean;
}

export default function StartMenu({ onClose }: Props) {
  const { openWindow } = useWindowStore();
  const menuRef = useRef<HTMLDivElement>(null);

  const openApp = (appId: string) => {
    playClickSound();
    const def = APP_REGISTRY[appId];
    if (def) openWindow(appId, def.title, def.icon, def.defaultSize);
    onClose();
  };

  const items: MenuItem[] = [
    {
      label: "Windows Update",
      icon: "/icons/ie.png",
      action: () => {
        playClickSound();
        showWin98Alert(
          "Windows Update\n\nError connecting to windowsupdate.microsoft.com\n\nHave you tried turning the modem off and on?",
          "Windows Update",
          "error"
        );
        onClose();
      },
    },
    { separator: true },
    {
      label: "Programs", icon: "/icons/programs.png", children: [
        { label: "Accessories", icon: "/icons/folder.png", children: [
          { label: "Notepad", icon: "/icons/notepad.png", action: () => openApp("notepad") },
          { label: "Paint", icon: "/icons/paint.png", action: () => openApp("paint") },
          { label: "Calculator", icon: "/icons/calculator.png", action: () => openApp("calculator") },
          { label: "MS-DOS Prompt", icon: "/icons/dos.png", action: () => openApp("dos") },
          { label: "Games", icon: "/icons/folder.png", children: [
            { label: "Minesweeper", icon: "/icons/minesweeper.png", action: () => openApp("minesweeper") },
            { label: "Solitaire", icon: "/icons/solitaire.png", action: () => openApp("solitaire") },
          ]},
        ]},
        { separator: true },
        { label: "Internet Explorer", icon: "/icons/ie.png", action: () => openApp("ie") },
        { label: "Outlook Express", icon: "/icons/outlook.png", action: () => openApp("outlook") },
      ],
    },
    {
      label: "Favorites", icon: "/icons/favorites.png", children: [
        { label: "http://www.googol.com", action: () => openApp("ie") },
        { label: "http://www.bhilaisteel.in", action: () => openApp("ie") },
      ],
    },
    {
      label: "Documents", icon: "/icons/documents.png", children: [
        { label: "README_FIRST.txt", icon: "/icons/txt.png", action: () => {
          const def = APP_REGISTRY["notepad"];
          openWindow("notepad", "README_FIRST.txt - Notepad", def.icon, def.defaultSize, {
            filename: "README_FIRST.txt", content: `If you are reading this, you found the Verma family computer.\nPlease do not delete anything. Especially Minesweeper.\nChintu: if you read this, remove the "free_ram" file. It does not work.\n- Papa\nP.S. Password hint for Anil's account: "name of the dog". The dog is called Tommy.`
          });
          onClose();
        }},
        { label: "last_note.txt", icon: "/icons/txt.png", action: () => {
          const def = APP_REGISTRY["notepad"];
          openWindow("notepad", "last_note.txt - Notepad", def.icon, def.defaultSize, {
            filename: "last_note.txt",
            content: `Tomorrow we are getting a new computer with Windows XP.\nThis one will stay here and rest. It served us well.\nIt crashed 214 times. I counted.\nGoodbye, little grey machine. Thank you for the memories.\n(Chintu, please shut it down properly this time.)`,
            special: "last_note"
          });
          onClose();
        }},
      ],
    },
    {
      label: "Settings", icon: "/icons/settings.png", children: [
        { label: "Control Panel", action: () => {
          showWin98Alert("Control Panel\n\nAll settings are working properly.\n(They are not.)", "Control Panel", "info");
          onClose();
        }},
        { label: "Display...", action: () => openApp("display") },
      ],
    },
    {
      label: "Find", icon: "/icons/find.png", children: [
        { label: "Files or Folders...", action: () => {
          showWin98Alert("Search not available.\n\nPlease ask Chintu.", "Find", "info");
          onClose();
        }},
      ],
    },
    {
      label: "Help",
      icon: "/icons/help.png",
      action: () => {
        showWin98Alert(
          "Windows 98 Help\n\nHelp is not available.\n\nIf you need help, restart the computer.\nIf that doesn't work, restart the computer again.\n- Anil",
          "Windows 98 Help",
          "info"
        );
        onClose();
      },
    },
    {
      label: "Run…",
      icon: "/icons/run.png",
      action: () => openApp("run"),
    },
    { separator: true },
    {
      label: "Log Off Anil…",
      icon: "/icons/logoff.png",
      action: () => {
        onClose();
        showWin98Confirm("Are you sure you want to log off Anil Verma?", "Log Off Windows").then((confirmed) => {
          if (confirmed) window.location.reload();
        });
      },
    },
    {
      label: "Shut Down…",
      icon: "/icons/shutdown.png",
      action: () => {
        onClose();
        showWin98Confirm("Are you sure you want to shut down your computer?", "Shut Down Windows").then((yes) => {
          if (yes) window.dispatchEvent(new CustomEvent("w98:shutdown"));
        });
      },
    },
  ];

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const closeKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("mousedown", close);
    window.addEventListener("keydown", closeKey);
    return () => { window.removeEventListener("mousedown", close); window.removeEventListener("keydown", closeKey); };
  }, [onClose]);

  return (
    <div ref={menuRef} className={styles.startMenu}>
      {/* Blue vertical banner */}
      <div className={styles.banner}>
        <span className={styles.bannerText}>
          <span style={{ fontWeight: "normal" }}>Windows</span>
          <span style={{ fontWeight: "bold" }}>98</span>
        </span>
      </div>

      {/* Menu items */}
      <div className={styles.itemList}>
        <MenuList items={items} />
      </div>
    </div>
  );
}

function MenuList({ items }: { items: MenuItem[] }) {
  const [openChild, setOpenChild] = useState<string | null>(null);

  return (
    <>
      {items.map((item, i) => (
        <StartMenuItem
          key={i}
          item={item}
          isOpen={openChild === item.label}
          onHover={() => setOpenChild(item.children && item.children.length > 0 ? (item.label ?? "") : null)}
        />
      ))}
    </>
  );
}

function StartMenuItem({
  item,
  isOpen,
  onHover,
}: {
  item: MenuItem;
  isOpen: boolean;
  onHover: () => void;
}) {
  const label = item.label ?? "";

  if (item.separator) return <div className={styles.separator} />;

  const hasChildren = item.children && item.children.length > 0;

  return (
    <div
      className={`${styles.menuItem} ${isOpen ? styles.menuItemActive : ""}`}
      onMouseEnter={onHover}
    >
      {item.icon && <img src={item.icon} alt="" aria-hidden className={styles.menuIcon} />}
      {!item.icon && <span className={styles.menuIconPlaceholder} />}
      <span className={styles.menuLabel}>{label}</span>
      {hasChildren && <span className={styles.arrow}>▶</span>}

      {/* Cascade */}
      {hasChildren && isOpen && (
        <div className={styles.submenu}>
          <MenuList items={item.children!} />
        </div>
      )}

      {/* Click on leaf node */}
      {!hasChildren && item.action && (
        <div
          className={styles.clickOverlay}
          onClick={item.action}
        />
      )}
    </div>
  );
}

