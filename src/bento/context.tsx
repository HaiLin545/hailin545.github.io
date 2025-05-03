import { createContext } from "solid-js";

export type BentoContextProps = {
  row: number;
  col: number;
  gridSize: number;
  layouts: Array<{
    h: number;
    w: number;
    r: number;
    c: number;
  }>;
};

const defaultBentoContext: BentoContextProps = {
  gridSize: 12,
  row: 5,
  col: 4,
  layouts: [],
};

export const BentoContext =
  createContext<BentoContextProps>(defaultBentoContext);
