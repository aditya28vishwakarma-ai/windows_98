// Minesweeper.tsx — Classic 9×9 beginner board with Win98 UI
import { useState, useCallback, useEffect } from "react";
import { useAchievementStore } from "../../os/store/achievementStore";
import { playClickSound, playExplosionSound, playDingSound } from "../../os/sound";
import styles from "./Minesweeper.module.css";

const ROWS = 9, COLS = 9, MINES = 10;
type CellState = { mine: boolean; revealed: boolean; flagged: boolean; adj: number };
type Phase = "idle" | "playing" | "won" | "lost";

function buildBoard(firstR: number, firstC: number): CellState[][] {
  const board: CellState[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ mine: false, revealed: false, flagged: false, adj: 0 }))
  );
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (!board[r][c].mine && !(r === firstR && c === firstC)) {
      board[r][c].mine = true;
      placed++;
    }
  }
  // Calculate adjacency
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          if (board[r + dr]?.[c + dc]?.mine) count++;
      board[r][c].adj = count;
    }
  }
  return board;
}

function reveal(board: CellState[][], r: number, c: number): CellState[][] {
  const b = board.map((row) => row.map((cell) => ({ ...cell })));
  const stack = [[r, c]];
  while (stack.length) {
    const [cr, cc] = stack.pop()!;
    if (cr < 0 || cr >= ROWS || cc < 0 || cc >= COLS) continue;
    const cell = b[cr][cc];
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    if (cell.adj === 0 && !cell.mine) {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          stack.push([cr + dr, cc + dc]);
    }
  }
  return b;
}

export default function Minesweeper({ windowId: _ }: { windowId: string }) {
  const [board, setBoard] = useState<CellState[][] | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [flagCount, setFlagCount] = useState(MINES);
  const [seconds, setSeconds] = useState(0);
  const [face, setFace] = useState<"😊" | "😮" | "😎" | "😵">("😊");
  const unlock = useAchievementStore((s) => s.unlock);

  // Timer
  useEffect(() => {
    if (phase !== "playing") return;
    const t = setInterval(() => setSeconds((s) => Math.min(s + 1, 999)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const reset = useCallback(() => {
    setBoard(null);
    setPhase("idle");
    setFlagCount(MINES);
    setSeconds(0);
    setFace("😊");
  }, []);

  const handleCellClick = useCallback((r: number, c: number) => {
    if (phase === "won" || phase === "lost") return;

    setBoard((prev) => {
      let b = prev;
      if (!b) {
        b = buildBoard(r, c);
        setPhase("playing");
      }
      const cell = b[r][c];
      if (cell.revealed || cell.flagged) return b;
      if (cell.mine) {
        // Lose: reveal all mines
        playExplosionSound();
        const lost = b.map((row) => row.map((cell) => ({ ...cell, revealed: cell.mine ? true : cell.revealed })));
        setPhase("lost");
        setFace("😵");
        unlock("minesweeper-names", "💣 Stepped on a Mine (skill issue)");
        return lost;
      }
      playClickSound();
      const next = reveal(b, r, c);
      // Win check
      const revealed = next.flat().filter((c) => c.revealed && !c.mine).length;
      if (revealed === ROWS * COLS - MINES) {
        playDingSound();
        setPhase("won");
        setFace("😎");
        if (seconds < 10) unlock("minesweeper-names", "⚡ Minesweeper Speedrun");
      }
      return next;
    });
    setFace("😊");
  }, [phase, seconds, unlock]);

  const handleRightClick = useCallback((e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (phase === "won" || phase === "lost") return;
    setBoard((prev) => {
      if (!prev) return prev;
      const b = prev.map((row) => row.map((c) => ({ ...c })));
      const cell = b[r][c];
      if (cell.revealed) return b;
      cell.flagged = !cell.flagged;
      setFlagCount((n) => cell.flagged ? n - 1 : n + 1);
      return b;
    });
  }, [phase]);

  const adjColors = ["", "#0000ff","#007b00","#ff0000","#00007b","#7b0000","#007b7b","#000","#808080"];

  const LED = (n: number) => String(Math.max(0, Math.min(999, n))).padStart(3, "0");

  return (
    <div className={styles.ms}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.led}>{LED(flagCount)}</div>
        <button className={styles.face} onClick={reset} aria-label="New game" title="New game">
          {face}
        </button>
        <div className={styles.led}>{LED(seconds)}</div>
      </div>

      {/* Board */}
      <div className={styles.board}>
        {Array.from({ length: ROWS }, (_, r) => (
          <div key={r} className={styles.row}>
            {Array.from({ length: COLS }, (_, c) => {
              const cell = board?.[r]?.[c];
              const revealed = cell?.revealed;
              const flagged = cell?.flagged;
              const mine = cell?.mine;
              const adj = cell?.adj ?? 0;
              return (
                <button
                  key={c}
                  className={`${styles.cell} ${revealed ? styles.revealed : ""}`}
                  onClick={() => handleCellClick(r, c)}
                  onContextMenu={(e) => handleRightClick(e, r, c)}
                  onMouseDown={() => setFace("😮")}
                  onMouseUp={() => setFace(phase === "won" ? "😎" : phase === "lost" ? "😵" : "😊")}
                  aria-label={revealed ? (mine ? "Mine" : `${adj} adjacent mines`) : flagged ? "Flagged" : "Hidden"}
                >
                  {revealed && mine && "💣"}
                  {revealed && !mine && adj > 0 && (
                    <span style={{ color: adjColors[adj], fontWeight: "bold" }}>{adj}</span>
                  )}
                  {!revealed && flagged && "🚩"}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {phase === "won" && <div className={styles.banner}>You Win! 🎉</div>}
      {phase === "lost" && <div className={`${styles.banner} ${styles.lostBanner}`}>Game Over 💣</div>}
    </div>
  );
}

