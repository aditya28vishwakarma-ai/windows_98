// registry.ts — Every app registers here. Windows manager uses this as its source of truth.
import { lazy } from "react";
import type { ComponentType } from "react";

export interface AppDefinition {
  id: string;
  title: string;
  icon: string;          // path to 32x32 PNG/SVG icon
  defaultSize: { w: number; h: number };
  minSize?: { w: number; h: number };
  singleton?: boolean;   // only one instance allowed
  component: ReturnType<typeof lazy<ComponentType<{ windowId: string }>>>;
}

export const APP_REGISTRY: Record<string, AppDefinition> = {
  notepad: {
    id: "notepad",
    title: "Notepad",
    icon: "/icons/notepad.png",
    defaultSize: { w: 580, h: 420 },
    minSize: { w: 200, h: 150 },
    component: lazy(() => import("../apps/notepad/Notepad")),
  },
  paint: {
    id: "paint",
    title: "Paint",
    icon: "/icons/paint.png",
    defaultSize: { w: 720, h: 540 },
    minSize: { w: 300, h: 250 },
    component: lazy(() => import("../apps/paint/Paint")),
  },
  calculator: {
    id: "calculator",
    title: "Calculator",
    icon: "/icons/calculator.png",
    defaultSize: { w: 220, h: 280 },
    minSize: { w: 220, h: 280 },
    singleton: true,
    component: lazy(() => import("../apps/calculator/Calculator")),
  },
  minesweeper: {
    id: "minesweeper",
    title: "Minesweeper",
    icon: "/icons/minesweeper.png",
    defaultSize: { w: 320, h: 380 },
    minSize: { w: 200, h: 250 },
    component: lazy(() => import("../apps/minesweeper/Minesweeper")),
  },
  solitaire: {
    id: "solitaire",
    title: "Solitaire",
    icon: "/icons/solitaire.png",
    defaultSize: { w: 640, h: 480 },
    minSize: { w: 400, h: 380 },
    component: lazy(() => import("../apps/solitaire/Solitaire")),
  },
  ie: {
    id: "ie",
    title: "Internet Explorer",
    icon: "/icons/ie.png",
    defaultSize: { w: 800, h: 560 },
    minSize: { w: 320, h: 280 },
    component: lazy(() => import("../apps/ie/InternetExplorer")),
  },
  explorer: {
    id: "explorer",
    title: "My Computer",
    icon: "/icons/my-computer.png",
    defaultSize: { w: 600, h: 420 },
    minSize: { w: 300, h: 200 },
    component: lazy(() => import("../apps/explorer/Explorer")),
  },
  outlook: {
    id: "outlook",
    title: "Outlook Express",
    icon: "/icons/outlook.png",
    defaultSize: { w: 720, h: 500 },
    minSize: { w: 400, h: 300 },
    component: lazy(() => import("../apps/outlook/Outlook")),
  },
  dos: {
    id: "dos",
    title: "MS-DOS Prompt",
    icon: "/icons/dos.png",
    defaultSize: { w: 620, h: 400 },
    minSize: { w: 400, h: 300 },
    component: lazy(() => import("../apps/dos/DosPrompt")),
  },
  display: {
    id: "display",
    title: "Display Properties",
    icon: "/icons/settings.png",
    defaultSize: { w: 400, h: 460 },
    minSize: { w: 380, h: 420 },
    singleton: true,
    component: lazy(() => import("../apps/display/DisplayProperties")),
  },
  run: {
    id: "run",
    title: "Run",
    icon: "/icons/run.png",
    defaultSize: { w: 380, h: 175 },
    minSize: { w: 340, h: 160 },
    singleton: true,
    component: lazy(() => import("../apps/run/RunDialog")),
  },
};

