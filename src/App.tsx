import { createSignal, onMount, type Component } from "solid-js";

import styles from "./App.module.css";
import Bento from "./bento/Bento";
import Memoji from "./components/memoji/memoji";
import ThemeSwitcher from "./components/theme/theme-switcher";
import { ThemeProvider } from "./components/theme/theme-context";

const MySelf: Component = () => {
  const MyName = () => {
    return (
      <b
        style={{
          "font-size": "1.2rem",
        }}
      >
        Hailin
      </b>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        "align-items": "flex-start",
        "justify-content": "center",
        "font-size": "1rem",
        "text-align": "left",
        height: "100%",
        width: "100%",
        padding: "0 20px",
      }}
    >
      <p>
        I'm <MyName />, a developer from China. I'm interested in web development. I love to learn new things and share
        my knowledge with others.
      </p>
    </div>
  );
};

const Hello: Component = () => {
  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        "align-items": "flex-start",
        "justify-content": "center",
        "font-size": "1rem",
        padding: "0 20px",
        height: "100%",
        width: "100%",
      }}
    >
      <p>
        <b>Hello, world!</b>
      </p>
      <p>Welcome to my personal website.</p>
    </div>
  );
};

const App: Component = () => {
  const layouts = {
    items: [
      { h: 2, w: 2 },
      { h: 1, w: 4 },
      { h: 1, w: 4 },
      { h: 1, w: 1 },
      { h: 1, w: 2 },
      { h: 2, w: 1 },
      { h: 2, w: 3 },
    ],
  };

  return (
    <ThemeProvider>
      <div class={styles.App} style={{ "margin-top": "40px" }}>
        <Bento layouts={layouts}>
          <Memoji />
          <Hello />
          <MySelf />
          <ThemeSwitcher />
          <div></div>
          <div></div>
          <div></div>
        </Bento>
      </div>
    </ThemeProvider>
  );
};

export default App;
