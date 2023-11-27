import { createContext } from "react";
import { MediaItem } from "./client";
import { AppState } from "./App";

export const AppContext = createContext<{
  state: AppState,
  tryPassword: (password: string) => void,
  refresh: () => void,
  selectItem: (item: MediaItem | null) => void,
  updateItem: (item: MediaItem) => void,
  removeItem: (item: MediaItem) => void;
}>({} as any);
