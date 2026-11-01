// Paint.tsx — MS Paint with tools: pencil, fill, eraser, line, rect, ellipse, colour palette
import { useRef, useState, useEffect, useCallback } from "react";
import { useAchievementStore } from "../../os/store/achievementStore";
import { playClickSound } from "../../os/sound";
import styles from "./Paint.module.css";

type Tool = "pencil" | "eraser" | "fill" | "line" | "rect" | "ellipse" | "picker";

const PALETTE = [
  "#000000","#808080","#800000","#808000","#008000","#008080","#000080","#800080",
  "#ffffff","#c0c0c0","#ff0000","#ffff00","#00ff00","#00ffff","#0000ff","#ff00ff",
  "#ff8040","#804000","#804040","#408080","#004080","#8000ff","#ff0080","#ff8080",
  "#c0a000","#40c000","#00c0c0","#4040ff","#c000c0","#808040","#408040","#004040",
];

export default function Paint({ windowId: _ }: { windowId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pencil");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [lineWidth, setLineWidth] = useState(2);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const unlock = useAchievementStore((s) => s.unlock);
  const spraySeconds = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: Math.floor(e.clientX - rect.left), y: Math.floor(e.clientY - rect.top) };
  };

  const floodFill = useCallback((ctx: CanvasRenderingContext2D, startX: number, startY: number, fillColor: string) => {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const data = imageData.data;
    const idx = (y: number, x: number) => (y * ctx.canvas.width + x) * 4;
    const startIdx = idx(startY, startX);
    const [sr, sg, sb, sa] = [data[startIdx], data[startIdx + 1], data[startIdx + 2], data[startIdx + 3]];
    const fc = parseInt(fillColor.slice(1), 16);
    const [fr, fg, fb] = [(fc >> 16) & 0xff, (fc >> 8) & 0xff, fc & 0xff];
    if (sr === fr && sg === fg && sb === fb) return;
    const matches = (i: number) => data[i] === sr && data[i + 1] === sg && data[i + 2] === sb && data[i + 3] === sa;
    const fill = (i: number) => { data[i] = fr; data[i + 1] = fg; data[i + 2] = fb; data[i + 3] = 255; };
    const queue = [startIdx];
    const visited = new Uint8Array(data.length / 4);
    while (queue.length) {
      const i = queue.pop()!;
      const pi = i / 4;
      if (visited[pi]) continue;
      visited[pi] = 1;
      if (!matches(i)) continue;
      fill(i);
      const x = pi % ctx.canvas.width, y = Math.floor(pi / ctx.canvas.width);
      if (x > 0) queue.push(i - 4);
      if (x < ctx.canvas.width - 1) queue.push(i + 4);
      if (y > 0) queue.push(i - ctx.canvas.width * 4);
      if (y < ctx.canvas.height - 1) queue.push(i + ctx.canvas.width * 4);
    }
    ctx.putImageData(imageData, 0, 0);
  }, []);

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);
    setDrawing(true);
    setStartPos(pos);
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.strokeStyle = e.button === 2 ? bgColor : fgColor;
    ctx.fillStyle = e.button === 2 ? bgColor : fgColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";

    if (tool === "pencil" || tool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
    if (tool === "fill") {
      floodFill(ctx, pos.x, pos.y, e.button === 2 ? bgColor : fgColor);
      setDrawing(false);
    }
    if (tool === "picker") {
      const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
      const hex = `#${[...pixel].slice(0, 3).map((v) => v.toString(16).padStart(2, "0")).join("")}`;
      if (e.button === 2) setBgColor(hex); else setFgColor(hex);
      setDrawing(false);
    }
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const pos = getPos(e);
    const ctx = canvasRef.current!.getContext("2d")!;

    if (tool === "pencil") {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      // Chintu spray egg
      spraySeconds.current += 0.016;
      if (spraySeconds.current > 10) {
        unlock("paint-cursed", "🎨 Chintu Mode Unlocked");
        spraySeconds.current = 0;
      }
    }
    if (tool === "eraser") {
      ctx.strokeStyle = bgColor;
      ctx.lineWidth = lineWidth * 4;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.lineWidth = lineWidth;
    }
    if (tool === "line" || tool === "rect" || tool === "ellipse") {
      // Preview on overlay canvas
      const ov = overlayRef.current;
      if (!ov) return;
      const ovCtx = ov.getContext("2d")!;
      ovCtx.clearRect(0, 0, ov.width, ov.height);
      ovCtx.strokeStyle = fgColor;
      ovCtx.lineWidth = lineWidth;
      if (tool === "line") {
        ovCtx.beginPath();
        ovCtx.moveTo(startPos.x, startPos.y);
        ovCtx.lineTo(pos.x, pos.y);
        ovCtx.stroke();
      }
      if (tool === "rect") {
        ovCtx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
      }
      if (tool === "ellipse") {
        ovCtx.beginPath();
        ovCtx.ellipse(
          (startPos.x + pos.x) / 2, (startPos.y + pos.y) / 2,
          Math.abs(pos.x - startPos.x) / 2, Math.abs(pos.y - startPos.y) / 2,
          0, 0, Math.PI * 2
        );
        ovCtx.stroke();
      }
    }
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    setDrawing(false);
    const pos = getPos(e);
    const ctx = canvasRef.current!.getContext("2d")!;
    const ov = overlayRef.current;

    if (tool === "line") {
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    if (tool === "rect") {
      ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
    }
    if (tool === "ellipse") {
      ctx.beginPath();
      ctx.ellipse(
        (startPos.x + pos.x) / 2, (startPos.y + pos.y) / 2,
        Math.abs(pos.x - startPos.x) / 2, Math.abs(pos.y - startPos.y) / 2,
        0, 0, Math.PI * 2
      );
      ctx.stroke();
    }

    if (ov) ov.getContext("2d")!.clearRect(0, 0, ov.width, ov.height);
  };

  const TOOLS: { id: Tool; label: string; emoji: string }[] = [
    { id: "picker", label: "Color Picker", emoji: "💧" },
    { id: "eraser", label: "Eraser", emoji: "⬜" },
    { id: "fill", label: "Fill", emoji: "🪣" },
    { id: "pencil", label: "Pencil", emoji: "✏️" },
    { id: "line", label: "Line", emoji: "╲" },
    { id: "rect", label: "Rectangle", emoji: "▭" },
    { id: "ellipse", label: "Ellipse", emoji: "○" },
  ];

  return (
    <div className={styles.paint}>
      {/* Toolbar */}
      <div className={styles.toolPanel}>
        {TOOLS.map((t) => (
          <button
            key={t.id}
            className={`${styles.toolBtn} ${tool === t.id ? styles.toolBtnActive : ""}`}
            onClick={() => {
              playClickSound();
              setTool(t.id);
            }}
            title={t.label}
            aria-label={t.label}
          >
            {t.emoji}
          </button>
        ))}
        <div className={styles.toolSep} />
        <div className={styles.swatches}>
          <div className={styles.colorSquare} style={{ background: bgColor, zIndex: 0, left: 8, top: 8 }} onClick={() => {}} />
          <div className={styles.colorSquare} style={{ background: fgColor, zIndex: 1, left: 2, top: 2, position: "relative" }} />
        </div>
        <div className={styles.brushSizes}>
          {[1, 2, 4, 6].map((s) => (
            <button
              key={s}
              className={`${styles.brushBtn} ${lineWidth === s ? styles.brushActive : ""}`}
              onClick={() => setLineWidth(s)}
              style={{ height: Math.max(s * 2, 8) }}
              aria-label={`Brush size ${s}`}
            />
          ))}
        </div>
      </div>

      {/* Canvas area */}
      <div className={styles.canvasArea}>
        <div className={styles.canvasWrapper}>
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className={styles.canvas}
            style={{ cursor: tool === "eraser" ? "cell" : tool === "fill" ? "crosshair" : "crosshair" }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onContextMenu={(e) => e.preventDefault()}
          />
          <canvas
            ref={overlayRef}
            width={600}
            height={400}
            className={styles.overlay}
            style={{ pointerEvents: "none" }}
          />
        </div>
      </div>

      {/* Colour palette */}
      <div className={styles.palette}>
        <div className={styles.paletteColors}>
          {PALETTE.map((c) => (
            <div
              key={c}
              className={styles.paletteCell}
              style={{ background: c }}
              onClick={() => setFgColor(c)}
              onContextMenu={(e) => { e.preventDefault(); setBgColor(c); }}
              title={c}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

