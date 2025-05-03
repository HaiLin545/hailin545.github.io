import style from "./memoji.module.css";
import { createSignal, type Component, Show, onMount } from "solid-js";

import momoji1 from "@/assets/memoji/1.gif";
import momoji2 from "@/assets/memoji/2.gif";
import momoji3 from "@/assets/memoji/3.gif";
import momoji4 from "@/assets/memoji/4.gif";
import momoji5 from "@/assets/memoji/5.gif";
import momoji6 from "@/assets/memoji/6.gif";

const Memoji: Component = () => {
  const memojiList = [momoji1, momoji2, momoji3, momoji4, momoji5, momoji6];
  const [memojiIndex, setMemojiIndex] = createSignal(0);
  const [isHover, setIsHover] = createSignal(false);
  let interval = null;

  const switchMemoji = () => {
    setMemojiIndex((prev) => (prev + 1) % memojiList.length);
  };

  const handleMouseEnter = () => {
    setIsHover(true);
  };

  const handleMouseLeave = () => {
    setIsHover(false);
  };

  const handleClick = () => {
    clearInterval(interval); // Clear the interval when the user clicks
    switchMemoji();
    interval = setInterval(() => {
      setMemojiIndex((prev) => (prev + 1) % memojiList.length);
    }, 3000); // Restart the interval after clicking
  };

  onMount(() => {
    interval = setInterval(() => {
      switchMemoji();
    }, 3000); // Change the interval time as needed

    return () => clearInterval(interval); // Cleanup the interval on component unmount
  });

  return (
    <div class={style.memojiBox} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <img
        draggable="false"
        src={memojiList[memojiIndex()]}
        on:click={handleClick}
        style={{
          width: "100%",
          height: "100%",
          "object-fit": "cover",
        }}
        alt=""
      />

      {/* <Show when={isHover()}>
        <button class={style.switchBtn} onClick={switchMemoji}>
          Switch Memoji
        </button>
      </Show> */}
    </div>
  );
};

export default Memoji;
