import { useCallback, useEffect, useReducer } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

import { Client, MediaItem } from "./client";

import { AppContext } from './AppContext';

import Auth from './Auth';
import Uploader from './Uploader';
import Editor from './Editor';
import Browser from "./Browser";

export type AppState = {
  client: Client,
  password: string | null,
  selected: MediaItem | null,
  items: MediaItem[],
  limit: number,
  danger: boolean,
}

export type AppAction =
  {
    type: "setItems",
    items: MediaItem[], 
  } | {
    type: "selectItem",
    item: MediaItem | null,
  } | {
    type: "updateItem",
    item: MediaItem,
  } | {
    type: "removeItem",
    item: MediaItem,
  } | {
    type: "password",
    password: string,
  } | {
    type: "limit",
    limit: number,
  };

function reduce(state: AppState, action: AppAction) {
  if (action.type === "setItems") {
    return { ...state, items: action.items };
  } else if (action.type === "selectItem") {
    return { ...state, selected: action.item };
  } else if (action.type === "updateItem") {
    const items = [...state.items];
    const index = items.findIndex((other) => action.item.mediaId === other.mediaId);
    if (index >= 0) {
      items[index] = action.item;
    } else {
      items.push(action.item);
    }
    return { ...state, items };
  } else if (action.type === "removeItem") {
    const index = state.items.findIndex((other) => action.item.mediaId === other.mediaId);
    if (index >= 0) {
      const items = [...state.items];
      items.splice(index, 1);

      const selected = state.selected?.mediaId === action.item.mediaId ? action.item : state.selected;

      return { ...state, selected, items };
    }
  } else if (action.type === "password") {
    return { ...state, password: action.password };
  } else if (action.type === "limit") {
    return { ...state, limit: action.limit };
  }
    
  return state;
}

function App() {
  const [state, dispatch] = useReducer(reduce, {
    client: new Client({ base: "https://tinybird.zone" }),
    password: null,
    selected: null,
    items: [],
    limit: 0,
    danger: new URL(window.location.toString()).searchParams.has("danger"),
  });

  useEffect(() => {
    const item = state.items.find((other) => state.selected?.mediaId === other.mediaId) ?? null;
    dispatch({ type: "selectItem", item });
  }, [state.items, state.selected?.mediaId]);

  const refresh = useCallback(() => {
    state.client.searchLibrary().then((items) => dispatch({ type: "setItems", items }));
    state.client.getSizeLimit().then((limit) => dispatch({ type: "limit", limit }));
  }, [state.client]);

  useEffect(refresh, [refresh]);

  return (
    <AppContext.Provider value={{ state, dispatch, refresh }}>
      <div className="controls">
        {state.password === null && <Auth />}
        {state.selected ? <Editor selected={state.selected} /> : <fieldset><legend>nothing selected</legend></fieldset>}
        {state.password && <Uploader password={state.password} limit={state.limit} />}
      </div>
      <Browser />
    </AppContext.Provider>
  );
}

export default App
