// Desktop.tsx — teal desktop with icons, right-click context menu, rubber-band selection
import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useWindowStore } from "../store/windowStore";
import { useAchievementStore } from "../store/achievementStore";
import { useThemeStore } from "../store/themeStore";
import { showWin98Alert } from "../store/dialogStore";
import { playClickSound } from "../sound";
import { APP_REGISTRY } from "../registry";
import Window from "./Window";
import styles from "./Desktop.module.css";

interface DesktopIcon {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  x: number;
  y: number;
}

interface ContextMenu {
  x: number;
  y: number;
}

export default function Desktop() {
  const { windows, openWindow } = useWindowStore();
  const unlock = useAchievementStore((s) => s.unlock);
  const wallpaper = useThemeStore((s) => s.wallpaper);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [dragBox, setDragBox] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const desktopRef = useRef<HTMLDivElement>(null);

  const openApp = useCallback(
    (appId: string) => {
      playClickSound();
      const def = APP_REGISTRY[appId];
      if (!def) return;
      openWindow(appId, def.title, def.icon, def.defaultSize);
    },
    [openWindow]
  );

  const desktopIcons: DesktopIcon[] = [
    {
      id: "my-computer",
      label: "My Computer",
      icon: "/icons/my-computer.png",
      action: () => openApp("explorer"),
      x: 20, y: 20,
    },
    {
      id: "my-documents",
      label: "My Documents",
      icon: "/icons/my-documents.png",
      action: () => openApp("explorer"),
      x: 20, y: 100,
    },
    {
      id: "recycle-bin",
      label: "Recycle Bin",
      icon: "/icons/recycle-bin.png",
      action: () => {
        unlock("recycle-latent", "🗑️ Recycle Bin Curiosity");
        openApp("explorer");
      },
      x: 20, y: 180,
    },
    {
      id: "ie",
      label: "Internet Explorer",
      icon: "/icons/ie.png",
      action: () => openApp("ie"),
      x: 20, y: 260,
    },
    {
      id: "outlook",
      label: "Outlook Express",
      icon: "/icons/outlook.png",
      action: () => openApp("outlook"),
      x: 20, y: 340,
    },
    {
      id: "network",
      label: "Network Neighborhood",
      icon: "/icons/network.png",
      action: () => {
        showWin98Alert(
          "Network Neighborhood\n\nNo other computers found.\n(Chintu unplugged the router again.)",
          "Network Neighborhood",
          "warning"
        );
      },
      x: 20, y: 420,
    },
    {
      id: "readme",
      label: "README_FIRST.txt",
      icon: "/icons/txt.png",
      action: () => {
        const def = APP_REGISTRY["notepad"];
        openWindow("notepad", "README_FIRST.txt - Notepad", def.icon, def.defaultSize, {
          filename: "README_FIRST.txt",
          content: `If you are reading this, you found the Verma family computer.
Please do not delete anything. Especially Minesweeper.
Chintu: if you read this, remove the "free_ram" file. It does not work.
- Papa
P.S. Password hint for Anil's account: "name of the dog". The dog is called Tommy.`,
        });
      },
      x: 100, y: 20,
    },
    {
      id: "latent-ppt",
      label: "Latent_Final_FINAL.ppt",
      icon: "/icons/ppt.png",
      action: () => {
        showWin98Alert(
          "Microsoft PowerPoint is not installed.\n\nDid you try Notepad? Anil does everything in Notepad.",
          "Microsoft PowerPoint",
          "warning"
        );
      },
      x: 100, y: 100,
    },
  ];

  const onIconDblClick = (icon: DesktopIcon) => {
    icon.action();
    setSelectedIcon(null);
  };

  const onIconClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    playClickSound();
    setSelectedIcon(id);
  };

  const onDesktopClick = () => {
    setSelectedIcon(null);
    setContextMenu(null);
  };

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    playClickSound();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  // Rubber-band drag selection
  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || e.target !== desktopRef.current) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    setDragBox(null);
    setSelectedIcon(null);
    setContextMenu(null);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const x1 = dragStart.current.x;
    const y1 = dragStart.current.y;
    const x2 = e.clientX;
    const y2 = e.clientY;
    setDragBox({ x1, y1, x2, y2 });

    // Check collision with icons
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    const hit = desktopIcons.find(
      (icon) => icon.x + 35 >= minX && icon.x <= maxX && icon.y + 35 >= minY && icon.y <= maxY
    );
    if (hit) setSelectedIcon(hit.id);
  };

  const onMouseUp = () => {
    isDragging.current = false;
    setDragBox(null);
  };

  // Ctrl+Z → undo close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z") {
        const { undoLastClose, lastClosedApp } = useWindowStore.getState();
        if (lastClosedApp) {
          undoLastClose();
          unlock("ctrl-z-life", "↩️ If Only Life Had Ctrl+Z");
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [unlock]);

  const boxStyle = dragBox ? {
    left: Math.min(dragBox.x1, dragBox.x2),
    top: Math.min(dragBox.y1, dragBox.y2),
    width: Math.abs(dragBox.x2 - dragBox.x1),
    height: Math.abs(dragBox.y2 - dragBox.y1),
  } : undefined;

  return (
    <div
      ref={desktopRef}
      className={`${styles.desktop} wallpaper-${wallpaper}`}
      onClick={onDesktopClick}
      onContextMenu={onContextMenu}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      {/* Rubberband selection box */}
      {boxStyle && <div className="selection-box" style={boxStyle} />}

      {/* Desktop icons */}
      {desktopIcons.map((icon) => (
        <div
          key={icon.id}
          className={`${styles.desktopIcon} ${selectedIcon === icon.id ? styles.selected : ""}`}
          style={{ left: icon.x, top: icon.y }}
          onClick={(e) => onIconClick(e, icon.id)}
          onDoubleClick={() => onIconDblClick(icon)}
          tabIndex={0}
          role="button"
          aria-label={icon.label}
          onKeyDown={(e) => e.key === "Enter" && onIconDblClick(icon)}
        >
          <img src={icon.icon} alt="" aria-hidden className={styles.iconImg} />
          <span className={styles.iconLabel}>{icon.label}</span>
        </div>
      ))}

      {/* Open windows */}
      {windows.map((win) => {
        const def = APP_REGISTRY[win.appId];
        if (!def) return null;
        const AppComponent = def.component;
        return (
          <Window key={win.id} win={win}>
            <Suspense fallback={<div style={{ padding: 8 }}>Loading...</div>}>
              <AppComponent windowId={win.id} />
            </Suspense>
          </Window>
        );
      })}

      {/* Context menu */}
      {contextMenu && (
        <DesktopContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onNewFolder={() => {
            showWin98Alert("New Folder created.\n(Anil will never find it.)", "New Folder");
            setContextMenu(null);
          }}
          onProperties={() => {
            openApp("display");
            setContextMenu(null);
          }}
          onUndoDeleteEverything={() => {
            const icons = desktopRef.current?.querySelectorAll(`.${styles.desktopIcon}`);
            icons?.forEach((el) => { (el as HTMLElement).style.visibility = "hidden"; });
            setTimeout(() => {
              icons?.forEach((el) => { (el as HTMLElement).style.visibility = ""; });
              showWin98Alert("Phew. All desktop files restored.", "Undo Delete");
              unlock("context-undo", "🔁 Undo Delete Everything");
            }, 1000);
            setContextMenu(null);
          }}
          onRefresh={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

interface CtxProps {
  x: number; y: number;
  onClose: () => void;
  onNewFolder: () => void;
  onProperties: () => void;
  onUndoDeleteEverything: () => void;
  onRefresh: () => void;
}

function DesktopContextMenu({ x, y, onClose, onNewFolder, onProperties, onUndoDeleteEverything, onRefresh }: CtxProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [onClose]);

  const items = [
    { label: "Arrange Icons", action: onClose },
    { label: "Refresh", action: onRefresh },
    null,
    { label: "New ▶", action: onNewFolder },
    null,
    { label: "Properties", action: onProperties },
    null,
    { label: "Undo Delete Everything", action: onUndoDeleteEverything },
  ];

  return (
    <div ref={ref} className="context-menu" style={{ position: "fixed", left: x, top: y, zIndex: 9999 }}>
      {items.map((item, i) =>
        item === null ? (
          <div key={i} className="context-separator" />
        ) : (
          <button
            key={item.label}
            className="context-item"
            onMouseDown={(e) => { e.stopPropagation(); item.action(); }}
          >
            {item.label}
          </button>
        )
      )}
    </div>
  );
}

