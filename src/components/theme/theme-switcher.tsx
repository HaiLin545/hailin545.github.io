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

  //   const handleChange = (event: Event) => {
  //     const target = event.target as HTMLSelectElement;
  //     const selectedMode = target.value as ThemeMode;
  //     setMode(selectedMode);
  //   };
  function handleClick() {
    setModeIndex((prev) => (prev + 1) % modes.length);
    const selectedMode = modes[modeIndex()];
    setMode(selectedMode);
    console.log("ThemeSwitcher handleClick", selectedMode);
  }

  return (
    <div class={style.themeSwitcher} on:click={handleClick}>
      {ModeNames[mode()]}
    </div>
  );
};

export default ThemeSwitcher;
