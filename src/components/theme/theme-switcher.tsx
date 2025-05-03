import { createSignal } from "solid-js";
import { useThemeContext } from "./theme-context";
import style from "./theme-switcher.module.css";
enum ThemeMode {
  LIGHT = "light",
  DARK = "dark",
  SYSTEM = "system",
}

const ModeNames = {
  [ThemeMode.LIGHT]: "Light Theme",
  [ThemeMode.DARK]: "Dark Theme",
  [ThemeMode.SYSTEM]: "System Theme",
};

const ThemeSwitcher = () => {
  const { mode, setMode } = useThemeContext();
  const [modeIndex, setModeIndex] = createSignal(0);
  const modes = [ThemeMode.LIGHT, ThemeMode.DARK, ThemeMode.SYSTEM];

  function handleClick() {
    setModeIndex((prev) => (prev + 1) % modes.length);
    const selectedMode = modes[modeIndex()];
    setMode(selectedMode);
  }

  return (
    <div class={style.themeSwitcher} on:click={handleClick}>
      <div
        class="text"
        style={{
          cursor: "pointer",
        }}
      >
        {ModeNames[mode()]}
      </div>
    </div>
  );
};

export default ThemeSwitcher;
