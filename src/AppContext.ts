import { createContext } from "react";
import { MediaItem } from "./client";
import { AppState } from "./App";

export const AppContext = createContext<{
  state: AppState,
  setSelected: (item: MediaItem | null) => void,
  tryPassword: (password: string) => void,
  refresh: () => void,
  updateItem: (item: MediaItem) => void,
  removeItem: (item: MediaItem) => void;
}>({} as any);
