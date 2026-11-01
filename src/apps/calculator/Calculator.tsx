// Calculator.tsx — Win98 standard calculator with easter eggs
import { useState } from "react";
import { useAchievementStore } from "../../os/store/achievementStore";
import { playClickSound, playChordSound } from "../../os/sound";
import styles from "./Calculator.module.css";

export default function Calculator({ windowId: _ }: { windowId: string }) {
  const [display, setDisplay] = useState("0");
  const [pending, setPending] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [justOp, setJustOp] = useState(false);
  const [memory, setMemory] = useState(0);
  const unlock = useAchievementStore((s) => s.unlock);

  const val = parseFloat(display) || 0;

  const press = (digit: string) => {
    playClickSound();
    if (display === "Error") { setDisplay("0"); return; }
    if (justOp) { setDisplay(digit === "." ? "0." : digit); setJustOp(false); return; }
    if (display === "0" && digit !== ".") setDisplay(digit);
    else if (display.includes(".") && digit === ".") return;
    else setDisplay(display + digit);

    // Easter egg: 1337
    const next = justOp ? digit : display + digit;
    if (next === "1337") { unlock("calc-1337", "🏆 1337 Elite"); setDisplay("1337 // elite"); }
    if (next === "8008135") { unlock("calc-5318008", "🔢 Calculator Classic"); setDisplay("8008135 // lol"); }
  };

  const pressOp = (newOp: string) => {
    playClickSound();
    if (newOp === "=") {
      if (op && pending !== null) {
        let result = 0;
        if (op === "+") result = pending + val;
        if (op === "-") result = pending - val;
        if (op === "×") result = pending * val;
        if (op === "÷") {
          if (val === 0) {
            playChordSound();
            unlock("calc-5318008", "➗ Division by Chintu");
            setDisplay("Cannot divide by zero. Nor by Chintu.");
            setOp(null); setPending(null); setJustOp(true); return;
          }
          result = pending / val;
        }
        const str = Number.isInteger(result) ? String(result) : result.toPrecision(10).replace(/\.?0+$/, "");
        setDisplay(str);
        // Easter egg: 42
        if (str === "42") { unlock("calc-5318008", "✨ The Answer"); setDisplay("42 // The Answer."); }
      }
      setOp(null); setPending(null); setJustOp(true);
    } else {
      setPending(val);
      setOp(newOp);
      setJustOp(true);
    }
  };

  const pressSpecial = (cmd: string) => {
    if (cmd === "C") { setDisplay("0"); setPending(null); setOp(null); setJustOp(false); }
    if (cmd === "CE") setDisplay("0");
    if (cmd === "±") setDisplay(String(-val));
    if (cmd === "√") setDisplay(val < 0 ? "Error" : String(Math.sqrt(val)));
    if (cmd === "%") setDisplay(String(val / 100));
    if (cmd === "1/x") setDisplay(val === 0 ? "Error" : String(1 / val));
    if (cmd === "MC") setMemory(0);
    if (cmd === "MR") { setDisplay(String(memory)); setJustOp(false); }
    if (cmd === "MS") setMemory(val);
    if (cmd === "M+") setMemory(memory + val);
  };

  const btnClass = (variant = "") => `${styles.btn} ${variant ? styles[variant] : ""}`;

  return (
    <div className={styles.calc}>
      {/* Memory/display row */}
      <div className={styles.displayRow}>
        <div className={styles.memIndicator}>{memory !== 0 ? "M" : ""}</div>
        <div className={styles.display}>{display}</div>
      </div>

      {/* Memory row */}
      <div className={styles.row}>
        {["MC","MR","MS","M+"].map((c) => (
          <button key={c} className={btnClass("mem")} onClick={() => pressSpecial(c)}>{c}</button>
        ))}
        <button className={btnClass()} onClick={() => pressSpecial("CE")}>CE</button>
        <button className={btnClass()} onClick={() => pressSpecial("C")}>C</button>
      </div>

      {/* Number + operator grid */}
      <div className={styles.grid}>
        {/* Row 1 */}
        <button className={btnClass()} onClick={() => press("7")}>7</button>
        <button className={btnClass()} onClick={() => press("8")}>8</button>
        <button className={btnClass()} onClick={() => press("9")}>9</button>
        <button className={btnClass("op")} onClick={() => pressSpecial("√")}>√</button>

        {/* Row 2 */}
        <button className={btnClass()} onClick={() => press("4")}>4</button>
        <button className={btnClass()} onClick={() => press("5")}>5</button>
        <button className={btnClass()} onClick={() => press("6")}>6</button>
        <button className={btnClass("op")} onClick={() => pressSpecial("%")}>%</button>

        {/* Row 3 */}
        <button className={btnClass()} onClick={() => press("1")}>1</button>
        <button className={btnClass()} onClick={() => press("2")}>2</button>
        <button className={btnClass()} onClick={() => press("3")}>3</button>
        <button className={btnClass("op")} onClick={() => pressSpecial("1/x")}>1/x</button>

        {/* Row 4 */}
        <button className={btnClass()} onClick={() => press("0")}>0</button>
        <button className={btnClass()} onClick={() => pressSpecial("±")}>±</button>
        <button className={btnClass()} onClick={() => press(".")}>.</button>
        <button className={`${btnClass("eq")} ${styles.eqBtn}`} onClick={() => pressOp("=")}>=</button>
      </div>

      {/* Operators column (right) */}
      <div className={styles.ops}>
        <button className={btnClass("op")} onClick={() => pressOp("÷")}>÷</button>
        <button className={btnClass("op")} onClick={() => pressOp("×")}>×</button>
        <button className={btnClass("op")} onClick={() => pressOp("-")}>-</button>
        <button className={btnClass("op")} onClick={() => pressOp("+")}>+</button>
      </div>
    </div>
  );
}

