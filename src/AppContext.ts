import { createContext } from "react";
import { Client, MediaItem } from "./client";

export const AppContext = createContext<{
  client: Client,
  danger: boolean,
  password: string | null,
  selected: MediaItem | null,
  setSelected: (item: MediaItem | null) => void,
  tryPassword: (password: string) => void,
  refresh: () => void,
  items: MediaItem[],
  updateItem: (item: MediaItem) => void,
  removeItem: (item: MediaItem) => void;
}>({} as any);
