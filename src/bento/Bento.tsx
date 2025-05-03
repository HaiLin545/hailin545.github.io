import type { Component, JSX } from "solid-js";
import "./bento.css";
import type { BentoContextProps } from "./context";
import { BentoContext } from "./context";
import { createSignal, children, createEffect, onMount, For, Show, batch } from "solid-js";
import BentoItem from "./BentoItem";
import { createStore } from "solid-js/store";
import { sortMethods, debounce } from "./utils";

type BentoProps = {
  layouts: {
    row: number;
    col: number;
    gap: number;
    gridSize: number;
    items: Array<{
      h: number;
      w: number;
      r: number;
      c: number;
    }>;
  };
  children: JSX.Element[];
};

type RectType = {
  r: number;
  c: number;
  h: number;
  w: number;
  index?: number;
};

type GridsType = number[][];

const PAD = 20;
const defaultLayout = {
  row: 1,
  col: 1,
  gap: 10,
  gridSize: 100,
  items: [],
};

const Bento: Component<BentoProps> = (props) => {
  const [dragItemRect, setDragItemRect] = createSignal<{
    left: number;
    top: number;
    width: number;
    height: number;
  }>({});
  const [placeholderRect, setPlaceholderRect] = createSignal<RectType>({} as RectType);
  const [pointer, setPointer] = createSignal({
    x0: 0,
    y0: 0,
  });
  const [isDragging, setIsDragging] = createSignal(false);
  const [isInstant, setIsInstant] = createSignal(true);
  const [dragIndex, setDragIndex] = createSignal(-1);
  const [layouts, setLayouts] = createStore({
    ...defaultLayout,
    ...props.layouts,
    pointerDownEvent: "pointerdown",
    pointerMoveEvent: "pointermove",
    pointerUpEvent: "pointerup",
  });
  const height = () => layouts.row * layouts.gridSize + layouts.gap * (layouts.row - 1);
  const width = () => layouts.col * layouts.gridSize + layouts.gap * (layouts.col - 1);

  let bentoContainerRef: HTMLDivElement | undefined;

  onMount(() => {
    fitTight();

    window.addEventListener("resize", () => {
      fitTight();
    });
  });

  function fitTight() {
    let windowWidth = document.body.clientWidth;
    const rem = Math.max(14, windowWidth / 100);
    document.documentElement.style.fontSize = `${rem}px`;

    let newCol = 0,
      newSize = 0;

    let pad = windowWidth * 0.15;
    if (windowWidth >= 1000) {
      newCol = 6;
      newSize = Math.min(180, (windowWidth - pad) / newCol);
    } else if (windowWidth >= 600) {
      newCol = 4;
      newSize = (windowWidth - pad) / newCol;
    } else {
      newCol = 2;
      newSize = (windowWidth - pad) / newCol;
    }

    if (newSize !== layouts.gridSize) {
      setLayouts("gridSize", newSize);
    }

    if (newCol !== layouts.col) {
      const itemsOld = layouts.items.map((item, index) => {
        let w = Math.min(props.layouts.items[index].w, newCol);
        return { ...item, w, index } as RectType;
      });

      setLayouts("col", newCol);
      let { items, grids } = _fitTight(itemsOld);
      updateLayouts(items, grids);
    }
  }

  function fillGrids(rect: RectType, grids: GridsType) {
    let { r, c, h, w, index } = rect;
    for (let i = r; i < r + h; i++) {
      for (let j = c; j < c + w; j++) {
        grids[i][j] = index;
      }
    }
  }

  function fitBubbleUp(rect: RectType, grids: GridsType) {
    let { r, c, h, w } = rect;

    while (r + h > grids.length) {
      grids.push(new Array(layouts.col).fill(-1));
    }

    // 原位置被占用，需要下移，不允许冒泡
    for (let j = c; j < c + w; j++) {
      if (grids[r][j] !== -1 && grids[r][j] !== rect.index) {
        return r;
      }
    }

    // 计算上面是否有空位
    let topRow = r - 1;
    while (topRow >= 0) {
      let empty = true;
      for (let j = c; j < c + w; j++) {
        if (grids[topRow][j] !== -1) {
          empty = false;
          break;
        }
      }
      if (!empty) break;
      topRow--;
    }
    return topRow + 1;
  }

  function _fitTight(items: RectType[]) {
    let maxRow = items.reduce((sum, item) => {
      return sum + item.h;
    }, 0);

    let grids: GridsType = new Array(maxRow).fill(-1).map(() => new Array(layouts.col).fill(-1));

    items.sort(sortMethods.rowCol);

    for (let i = 0; i < items.length; i++) {
      let { r, c } = _getFirstFit(items[i], grids)!;
      items[i].r = r;
      items[i].c = c;
      fillGrids(items[i], grids);
    }

    items.sort((a, b) => a.index! - b.index!);
    return {
      items,
      grids,
    };
  }

  function _getFirstFit(rect: RectType, grids: GridsType) {
    for (let i = 0; i < grids.length; i++) {
      for (let j = 0; j < grids[i].length; j++) {
        let curRect = { r: i, c: j, h: rect.h, w: rect.w } as RectType;
        if (canFit(curRect, grids)) {
          return { r: i, c: j };
        }
      }
    }
    return { r: 0, c: 0 };
  }

  function _fitDefault() {
    let grids: GridsType = new Array(layouts.row).fill(-1).map(() => new Array(layouts.col).fill(-1));
    let items = layouts.items.map((item, index) => {
      return { ...item, index } as RectType;
    });
    let topItems: Record<number, number[]> = {};
    items.sort(sortMethods.rowCol);
    for (let i = 0; i < items.length; i++) {
      if (items[i].index === dragIndex()) {
        continue;
      }
      items[i].r = 0;
      while (!canFit(items[i], grids)) {
        items[i].r++;
      }
      fillGrids(items[i], grids);

      if (items[i].r > 0) {
        let itemSet = new Set();
        let row = items[i].r - 1;
        for (let col = items[i].c; col < items[i].c + items[i].w; col++) {
          if (grids[row][col] !== -1) {
            itemSet.add(grids[row][col]);
          }
        }
        topItems[items[i].index!] = Array.from(itemSet) as number[];
      } else {
        topItems[items[i].index!] = [];
      }
    }
    items.sort((a, b) => a.index! - b.index!);
    return {
      items,
      grids,
      topItems,
    };
  }

  function updateLayouts(items: RectType[], grids: GridsType) {
    popTail(grids);
    batch(() => {
      // if (grids.length !== layouts.row) {
      // }
      setLayouts("row", grids.length);
      setLayouts("items", (layItems) => {
        return items.map((item, idx) => {
          return {
            ...layItems[idx],
            r: item.r,
            c: item.c,
            h: item.h,
            w: item.w,
          };
        });
      });
    });
  }

  function _getMaxTopItemRow(topItems: number[], items: RectType[], itemIndex: number) {
    let maxRow = -1;

    items.forEach((item) => {
      if (topItems.includes(item.index!)) {
        maxRow = Math.max(maxRow, item.r + item.h);
      }

      if (item.index == itemIndex) {
        maxRow = Math.max(maxRow, item.r);
      }
    });
    return maxRow;
  }

  function _fitLayouts(rect: RectType, items: RectType[], topItems?: Record<number, number[]>) {
    let grids: GridsType = new Array(layouts.row).fill(-1).map(() => new Array(layouts.col).fill(-1));
    fillGrids(rect, grids);

    items.sort(sortMethods.rowCol);

    for (let i = 0; i < items.length; i++) {
      if (items[i].index === rect.index) {
        continue;
      }
      if (topItems) {
        let maxRow = _getMaxTopItemRow(topItems[items[i].index!], items, items[i].index!);
        items[i].r = maxRow;
      }
      items[i].r = fitBubbleUp(items[i], grids);
      while (!canFit(items[i], grids)) {
        items[i].r++;
      }
      fillGrids(items[i], grids);
    }
    return {
      items,
      grids,
    };
  }

  function popTail(grids: GridsType) {
    while (grids[grids.length - 1].every((item) => item === -1)) grids.pop();
  }

  function fitLayouts(rect: RectType) {
    // 不考虑rect，排列其余元素
    let { grids, items, topItems } = _fitDefault();
    let fitResult;
    // console.log("default fit", JSON.stringify(items));
    // console.table(JSON.parse(JSON.stringify(grids)));

    // 插入rect，判断是否可以上移
    let r_up = fitBubbleUp(rect, grids);

    if (r_up < rect.r) rect.r = r_up;
    fitResult = _fitLayouts(rect, items, topItems);

    // console.log("fit result 1");
    // console.table(JSON.parse(JSON.stringify(fitResult.grids)));

    // 重新排列以后，重叠部分下移，有可能需要重新上移
    r_up = fitBubbleUp(rect, fitResult.grids);
    if (r_up < rect.r) {
      rect.r = r_up;
      fitResult = _fitLayouts(rect, fitResult.items);
    }

    // console.log("fit result 2");
    // console.table(JSON.parse(JSON.stringify(fitResult.grids)));

    let fitItems = fitResult.items;
    let fitGrids = fitResult.grids;
    fitItems.sort((a, b) => a.index - b.index);
    return { rect, fitItems, fitGrids };
  }

  function handlePointerDown(e: PointerEvent, index: number) {
    const target = e.target as HTMLElement;

    setIsInstant(false);
    batch(() => {
      setDragIndex(index);
      setIsDragging(true);
      setPointer({
        x0: e.pageX,
        y0: e.pageY,
      });
      setDragItemRect({
        left: layouts.items[index].c * (layouts.gridSize + layouts.gap),
        top: layouts.items[index].r * (layouts.gridSize + layouts.gap),
        width: layouts.items[index].w * layouts.gridSize + (layouts.items[index].w - 1) * layouts.gap,
        height: layouts.items[index].h * layouts.gridSize + (layouts.items[index].h - 1) * layouts.gap,
      });
      setPlaceholderRect({
        ...(layouts.items[index] as RectType),
      });
    });

    document.addEventListener(layouts.pointerMoveEvent, handlePointerMove);
    document.addEventListener(layouts.pointerUpEvent, handlePointerUp);
  }

  function _getNewPosition(dx, dy) {
    let rect = layouts.items[dragIndex()];
    const left = rect.c * (layouts.gridSize + layouts.gap);
    const top = rect.r * (layouts.gridSize + layouts.gap);
    const { width: itemWidth, height: itemHeight } = dragItemRect();

    let nx = left + dx;
    let ny = top + dy;

    if (nx < -PAD) nx = -PAD;
    if (ny < -PAD) ny = -PAD;
    if (nx + itemWidth > width() + PAD) nx = width() - itemWidth + PAD;
    if (ny + itemHeight > height() + PAD) ny = height() - itemHeight + PAD;

    return { left: nx, top: ny };
  }

  function _getNewRect(dx, dy): RectType {
    let dc = dx / (layouts.gridSize + layouts.gap);
    let dr = dy / (layouts.gridSize + layouts.gap);
    let { r, c, h, w } = layouts.items[dragIndex()];
    let nr = r + Math.round(dr);
    let nc = c + Math.round(dc);

    if (nr < 0) nr = 0;
    if (nc < 0) nc = 0;
    if (nr + h >= layouts.row) nr = layouts.row - h;
    if (nc + w >= layouts.col) nc = layouts.col - w;
    return { r: nr, c: nc, h, w };
  }

  let _fitTimer = null;
  function handlePointerMove(e: PointerEvent) {
    if (!isDragging()) return;
    const target = e.target as HTMLElement;

    let dx = e.pageX - pointer().x0;
    let dy = e.pageY - pointer().y0;
    let { left, top } = _getNewPosition(dx, dy);

    setDragItemRect((rect) => {
      return {
        ...rect,
        left,
        top,
      };
    });

    if (_fitTimer != null) return;
    _fitTimer = setTimeout(() => {
      _fitTimer = null;
    }, 80);

    console.log("fit timer");

    let newRect = _getNewRect(dx, dy);
    if (newRect.r === placeholderRect().r && newRect.c === placeholderRect().c) return;

    newRect.index = dragIndex();

    let { rect: fitRect, fitGrids, fitItems } = fitLayouts(newRect as RectType);
    updateLayouts(fitItems, fitGrids);
    setPlaceholderRect(fitRect);
  }

  function handlePointerUp(e: PointerEvent) {
    if (!isDragging()) return;
    // console.log("pointer up", e.target);
    let { r, c } = placeholderRect();
    batch(() => {
      setLayouts("items", dragIndex(), (item) => {
        return {
          ...item,
          r: r,
          c: c,
        };
      });
      setIsDragging(false);
    });
    setTimeout(() => {
      !isDragging() && !isInstant() && setIsInstant(true);
    }, 500);

    document.removeEventListener(layouts.pointerMoveEvent, handlePointerMove);
    document.removeEventListener(layouts.pointerUpEvent, handlePointerUp);
  }

  function canFit(rect: RectType, grids: GridsType) {
    let { r, c, h, w } = rect;
    for (let i = r; i < r + h; i++) {
      while (r + h > grids.length) {
        grids.push(new Array(layouts.col).fill(-1));
      }
      for (let j = c; j < c + w; j++) {
        if (grids[i][j] !== -1) return false;
      }
    }
    return true;
  }

  return (
    <div class="bento-wrapper">
      <div
        class="bento-container"
        ref={bentoContainerRef}
        style={{
          width: `${width()}px`,
          height: `${height()}px`,
        }}
      >
        {props.children.map((child, index) => {
          return (
            <BentoItem
              gap={layouts.gap}
              gridSize={layouts.gridSize}
              layout={layouts.items[index]}
              dragRect={dragItemRect()}
              isDragging={isDragging() && dragIndex() === index}
              isInstant={isInstant()}
              onpointerdown={(e) => handlePointerDown(e, index)}
            >
              {child}
            </BentoItem>
          );
        })}
        <Show when={isDragging()}>
          <PlaceHolder rect={placeholderRect()} gap={layouts.gap} gridSize={layouts.gridSize}></PlaceHolder>
        </Show>
      </div>
      <Show when={false}>
        <GridBoard row={layouts.row} col={layouts.col} gap={layouts.gap} gridSize={layouts.gridSize} />
      </Show>
    </div>
  );
};

export default Bento;

const PlaceHolder = (props: { rect: RectType; gap: number; gridSize: number }) => {
  // console.log("placeholder", props.rect);

  const top = () => props.rect.r * (props.gridSize + props.gap);
  const left = () => props.rect.c * (props.gridSize + props.gap);
  const height = () => props.rect.h * props.gridSize + (props.rect.h - 1) * props.gap;
  const width = () => props.rect.w * props.gridSize + (props.rect.w - 1) * props.gap;

  return (
    <div
      class="placeholder-item"
      style={{
        border: "1px solid #ccc",
        "z-index": 10,
        position: "absolute",
        transform: `translate(${left()}px, ${top()}px)`,
        height: `${height()}px`,
        width: `${width()}px`,
      }}
    ></div>
  );
};

const GridBoard = (props) => {
  const width = () => props.gridSize * props.col + props.gap * (props.col - 1);
  const height = () => props.gridSize * props.row + props.gap * (props.row - 1);
  const gap = () => props.gap;
  const row = () => props.row;
  const col = () => props.col;
  const gridSize = () => props.gridSize;

  return (
    <div
      class="grid-board"
      style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        "z-index": 0,
        display: "grid",
        gap: `${gap()}px`,
        height: `${height()}px`,
        width: `${width()}px`,
        "grid-template-rows": `repeat(${row()}, ${gridSize()}px)`,
        "grid-template-columns": `repeat(${col()}, ${gridSize()}px)`,
      }}
    >
      <For each={new Array(row())}>
        {(_, r) => {
          return (
            <For each={new Array(col())}>
              {(_, c) => {
                return (
                  <div
                    class="grid-board-item"
                    style={{
                      width: `${gridSize()}px`,
                      height: `${gridSize()}px`,
                      border: "1px solid #ccc",
                      "background-color": "#f0f0f0",
                      "line-height": `${gridSize()}px`,
                      "text-align": "center",
                      "border-radius": "10px",
                    }}
                  >
                    {/* ({r},{c}) */}
                  </div>
                );
              }}
            </For>
          );
        }}
      </For>
    </div>
  );
};
