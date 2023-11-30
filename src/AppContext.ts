import { Dispatch, createContext } from "react";
import { AppAction, AppState } from "./App";

export const AppContext = createContext<{
  state: AppState,
  dispatch: Dispatch<AppAction>,
  refresh: () => void,
}>({} as any);
