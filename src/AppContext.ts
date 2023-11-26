import { createContext } from "react";
import { Client, MediaItem } from "./client";

export const AppContext = createContext({
  danger: false,
  client: new Client(),
  password: null as string | null,
  selected: null as MediaItem | null,
  setSelected: (_: MediaItem | null) => {},
  tryPassword: (_: string) => {},
  refresh: () => {},
  items: [] as MediaItem[],
  updateItem: (_:MediaItem) => {},
  removeItem: (_:MediaItem) => {},
});
