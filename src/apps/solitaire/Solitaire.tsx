// Solitaire.tsx — Klondike solitaire (simplified but playable)
import { useState, useCallback } from "react";
import { useAchievementStore } from "../../os/store/achievementStore";
import { playClickSound, playDingSound } from "../../os/sound";
import styles from "./Solitaire.module.css";

type Suit = "♠" | "♥" | "♦" | "♣";
type Color = "black" | "red";
interface Card { suit: Suit; value: number; faceUp: boolean; id: string }

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const COLOR: Record<Suit, Color> = { "♠": "black", "♣": "black", "♥": "red", "♦": "red" };
const VALUE_LABELS = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function createDeck(): Card[] {
  const deck: Card[] = [];
  SUITS.forEach((suit) => {
    for (let v = 1; v <= 13; v++) {
      deck.push({ suit, value: v, faceUp: false, id: `${suit}${v}` });
    }
  });
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function initGame() {
  const deck = createDeck();
  const tableau: Card[][] = Array.from({ length: 7 }, () => []);
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = deck.pop()!;
      card.faceUp = row === col;
      tableau[col].push(card);
    }
  }
  const stock = deck.map((c) => ({ ...c, faceUp: false }));
  return { tableau, stock, waste: [] as Card[], foundations: [[], [], [], []] as Card[][] };
}

export default function Solitaire({ windowId: _ }: { windowId: string }) {
  const [game, setGame] = useState(initGame);
  const [selected, setSelected] = useState<{ from: "tableau" | "waste"; colIdx: number; cardIdx: number } | null>(null);
  const [won, setWon] = useState(false);
  const unlock = useAchievementStore((s) => s.unlock);

  const newGame = () => { setGame(initGame()); setSelected(null); setWon(false); };

  // Draw from stock
  const drawStock = () => {
    playClickSound();
    setGame((g) => {
      if (g.stock.length === 0) {
        // flip waste back to stock
        const newStock = [...g.waste].reverse().map((c) => ({ ...c, faceUp: false }));
        return { ...g, stock: newStock, waste: [] };
      }
      const card = { ...g.stock[g.stock.length - 1], faceUp: true };
      return {
        ...g,
        stock: g.stock.slice(0, -1),
        waste: [...g.waste, card],
      };
    });
    setSelected(null);
  };

  const checkWin = useCallback((foundations: Card[][]) => {
    if (foundations.every((f) => f.length === 13)) {
      playDingSound();
      setWon(true);
      unlock("solitaire-cascade", "🃏 Won Solitaire!");
    }
  }, [unlock]);

  // Try to move selected card to tableau column
  const handleTableauClick = (colIdx: number, cardIdx: number) => {
    const col = game.tableau[colIdx];
    const card = col[cardIdx];

    if (!card.faceUp) return;

    if (!selected) {
      setSelected({ from: "tableau", colIdx, cardIdx });
      return;
    }

    // Try to place
    const srcCards = selected.from === "tableau"
      ? game.tableau[selected.colIdx].slice(selected.cardIdx)
      : [game.waste[game.waste.length - 1]];

    const srcCard = srcCards[0];
    const destTop = col[col.length - 1];

    let canPlace = false;
    if (!destTop) {
      canPlace = srcCard.value === 13; // King on empty
    } else if (destTop.faceUp) {
      canPlace = destTop.value === srcCard.value + 1 && COLOR[destTop.suit] !== COLOR[srcCard.suit];
    }

    if (canPlace) {
      setGame((g) => {
        const newTab = g.tableau.map((c) => [...c]);
        let movedCards: Card[];
        let newWaste = [...g.waste];
        if (selected.from === "tableau") {
          movedCards = newTab[selected.colIdx].splice(selected.cardIdx);
          if (newTab[selected.colIdx].length > 0) {
            newTab[selected.colIdx][newTab[selected.colIdx].length - 1].faceUp = true;
          }
        } else {
          movedCards = [newWaste.pop()!];
        }
        newTab[colIdx] = [...newTab[colIdx], ...movedCards];
        return { ...g, tableau: newTab, waste: newWaste };
      });
    }
    setSelected(null);
  };

  // Move to foundation
  const handleFoundationClick = (foundIdx: number) => {
    if (!selected) return;
    const srcCard = selected.from === "tableau"
      ? game.tableau[selected.colIdx][selected.cardIdx]
      : game.waste[game.waste.length - 1];
    const foundation = game.foundations[foundIdx];
    const topF = foundation[foundation.length - 1];
    const canPlace = !topF
      ? srcCard.value === 1
      : topF.suit === srcCard.suit && srcCard.value === topF.value + 1;

    if (canPlace && selected.cardIdx === (selected.from === "tableau" ? game.tableau[selected.colIdx].length - 1 : game.waste.length - 1)) {
      setGame((g) => {
        const newFoundations = g.foundations.map((f) => [...f]);
        const newTab = g.tableau.map((c) => [...c]);
        let newWaste = [...g.waste];
        if (selected.from === "tableau") {
          const [moved] = newTab[selected.colIdx].splice(selected.cardIdx, 1);
          if (newTab[selected.colIdx].length > 0) newTab[selected.colIdx][newTab[selected.colIdx].length - 1].faceUp = true;
          newFoundations[foundIdx] = [...newFoundations[foundIdx], moved];
        } else {
          const moved = newWaste.pop()!;
          newFoundations[foundIdx] = [...newFoundations[foundIdx], moved];
        }
        const newG = { ...g, foundations: newFoundations, tableau: newTab, waste: newWaste };
        checkWin(newFoundations);
        return newG;
      });
    }
    setSelected(null);
  };

  const cardLabel = (c: Card) => `${VALUE_LABELS[c.value]}${c.suit}`;

  return (
    <div className={styles.sol}>
      {/* Menu */}
      <div className={styles.menu}>
        <button className={styles.menuBtn} onClick={newGame}>Game</button>
        <button className={styles.menuBtn} onClick={() => { unlock("solitaire-cascade", "🎉 Cheat Win!"); setWon(true); }}>Help</button>
      </div>

      {/* Top row: stock, waste, foundations */}
      <div className={styles.topRow}>
        <div className={styles.cardSlot} onClick={drawStock} style={{ cursor: "pointer" }}>
          {game.stock.length > 0 ? <div className={`${styles.card} ${styles.faceDown}`}>🂠</div> : <div className={styles.emptySlot}>↺</div>}
        </div>
        <div className={styles.cardSlot}>
          {game.waste.length > 0 ? (
            <div
              className={`${styles.card} ${selected?.from === "waste" ? styles.selectedCard : ""} ${COLOR[game.waste[game.waste.length - 1].suit] === "red" ? styles.red : styles.black}`}
              onClick={() => {
                if (selected?.from === "waste") setSelected(null);
                else setSelected({ from: "waste", colIdx: -1, cardIdx: game.waste.length - 1 });
              }}
            >
              {cardLabel(game.waste[game.waste.length - 1])}
            </div>
          ) : <div className={styles.emptySlot} />}
        </div>
        <div className={styles.spacer} />
        {game.foundations.map((f, i) => (
          <div key={i} className={styles.cardSlot} onClick={() => handleFoundationClick(i)}>
            {f.length > 0 ? (
              <div className={`${styles.card} ${COLOR[f[f.length - 1].suit] === "red" ? styles.red : styles.black}`}>
                {cardLabel(f[f.length - 1])}
              </div>
            ) : <div className={styles.emptySlot}>{SUITS[i]}</div>}
          </div>
        ))}
      </div>

      {/* Tableau */}
      <div className={styles.tableau}>
        {game.tableau.map((col, colIdx) => (
          <div key={colIdx} className={styles.column}>
            {col.length === 0 && (
              <div className={styles.emptySlot} onClick={() => handleTableauClick(colIdx, 0)} />
            )}
            {col.map((card, cardIdx) => (
              <div
                key={card.id}
                className={`${styles.card} ${!card.faceUp ? styles.faceDown : ""} ${card.faceUp && COLOR[card.suit] === "red" ? styles.red : ""} ${card.faceUp && COLOR[card.suit] === "black" ? styles.black : ""} ${selected?.from === "tableau" && selected.colIdx === colIdx && cardIdx >= selected.cardIdx ? styles.selectedCard : ""}`}
                style={{ marginTop: cardIdx > 0 ? -52 : 0, position: "relative", zIndex: cardIdx }}
                onClick={() => card.faceUp && handleTableauClick(colIdx, cardIdx)}
              >
                {card.faceUp ? cardLabel(card) : "🂠"}
              </div>
            ))}
          </div>
        ))}
      </div>

      {won && (
        <div className={styles.winOverlay}>
          <div className={styles.winBox}>
            <div>🎉 You Win! 🎉</div>
            <div style={{ fontSize: 11 }}>Chintu approved.</div>
            <button className="button" onClick={newGame}>New Game</button>
          </div>
        </div>
      )}
    </div>
  );
}

