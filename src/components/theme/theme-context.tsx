import { createEffect, createSignal, on, onMount } from "solid-js";

import { createContext, useContext } from "solid-js";

const ThemeContext = createContext<ThemeContextProps>({
  mode: "system",
});

export type ThemeContextProps = {
  mode: "light" | "dark" | "system";
};

export const ThemeProvider = (props: { children: any }) => {
  const [mode, setMode] = createSignal<ThemeContextProps["mode"]>("system");

  function setTheme(mode: "light" | "dark") {
    document.documentElement.setAttribute("data-theme", mode);
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }

  onMount(() => {
    const storedMode = localStorage.getItem("theme-mode") as ThemeContextProps["mode"];
    if (storedMode) {
      setMode(storedMode);
    } else {
      setMode("system");
    }
  });

  createEffect(() => {
    const currentMode = mode();
    localStorage.setItem("theme-mode", currentMode);

    if (currentMode === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const systemMode = mediaQuery.matches ? "dark" : "light";
      setTheme(systemMode);

      const handleChange = (e: MediaQueryListEvent) => {
        setTheme(e.matches ? "dark" : "light");
      };
      mediaQuery.addEventListener("change", handleChange);

      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    } else {
      setTheme(currentMode);
    }
  });

  return <ThemeContext.Provider value={{ mode, setMode }}>{props.children}</ThemeContext.Provider>;
};

export const useThemeContext = () => {
  return useContext(ThemeContext);
};
