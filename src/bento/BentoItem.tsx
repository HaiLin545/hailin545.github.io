import type { Component, JSX } from "solid-js";
import { onMount, useContext } from "solid-js";

interface BentoItemProps {
  layout: {
    h: number;
    w: number;
    r: number;
    c: number;
  };
  dragRect: {
    top: number;
    left: number;
  };
  gap: number;
  isDragging: boolean;
  isInstant: boolean;
  onpointerdown: (e: PointerEvent) => void;
  gridSize: number;
  children: JSX.Element | JSX.Element[];
}

const BentoItem: Component<BentoItemProps> = (props) => {
  const isDragging = () => props.isDragging;
  const isInstant = () => props.isInstant;
  const width = () => props.layout.w * props.gridSize + (props.layout.w - 1) * props.gap;
  const height = () => props.layout.h * props.gridSize + (props.layout.h - 1) * props.gap;
  let bentoItemRef: HTMLDivElement | undefined;
  // console.log("bento item", props, width(), height());

  const r = () => props.layout.r;
  const c = () => props.layout.c;

  const left = () => {
    if (props.isDragging) {
      return props.dragRect.left;
    } else {
      return c() * (props.gridSize + props.gap);
    }
  };
  const top = () => {
    if (props.isDragging) {
      return props.dragRect.top;
    } else {
      return r() * (props.gridSize + props.gap);
    }
  };
  // const left = () => props.layout.c * (props.gridSize + props.gap);
  // const top = () => props.layout.r * (props.gridSize + props.gap);
  const transition = () => {
    if (props.isInstant || props.isDragging) {
      return "none";
    } else {
      return "transform 0.2s ease-in-out";
    }
    // return "transform 0.2s ease-in-out";
  };

  onMount(() => {
    // console.log("bento item mounted", props.layout.r, props.layout.c, width(), height());
  });

  return (
    <div
      onPointerDown={props.onpointerdown}
      class="bento-item"
      classList={{ dragging: isDragging() }}
      ref={bentoItemRef}
      style={{
        position: "absolute",
        transform: `translate(${left()}px, ${top()}px)`,
        transition: transition(),
        height: `${height()}px`,
        width: `${width()}px`,
        "z-index": isDragging() ? 12 : 10,
        "background-color": "lightblue",
      }}
    >
      {props.children}
    </div>
  );
};

export default BentoItem;
