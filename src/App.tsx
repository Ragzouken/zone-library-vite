import { useCallback, useEffect, useState } from 'react'
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

function App() {
  const [state, setState] = useState<AppState>({
    client: new Client({ base: "https://tinybird.zone" }),
    password: null,
    selected: null,
    items: [],
    limit: 0,
    danger: new URL(window.location.toString()).searchParams.has("danger"),
  });

  const refresh = useCallback(() => {
    state.client.searchLibrary().then((items) => setState((state) => ({ ...state, items })));
    state.client.getSizeLimit().then((limit) => setState((state) => ({ ...state, limit })));
  }, [state.client]);

  const tryPassword = useCallback((password: string) => {
    state.client.checkLibraryAuth(password).then(({ authorized }) => {
      if (authorized) setState((state) => ({ ...state, password }));
    });
  }, [state.client]);

  const setSelected = useCallback((selected: MediaItem | null) => setState((state) => ({ ...state, selected })), []);

  const updateItem = useCallback((item: MediaItem) => {
    const items = [...state.items];
    const index = items.findIndex((other) => item.mediaId === other.mediaId);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    setState({ ...state, items });
  }, [state]);

  const removeItem = useCallback((item: MediaItem) => {
    const index = state.items.findIndex((other) => item.mediaId === other.mediaId);
    if (index >= 0) {
      const items = [...state.items];
      items.splice(index, 1);
      setState((state) => ({ ...state, items }));

      if (state.selected?.mediaId === item.mediaId) {
        setSelected(null);
      }
    }
  }, [setSelected, state.items, state.selected?.mediaId]);

  useEffect(refresh, [refresh]);

  useEffect(() => {
    const item = state.items.find((other) => state.selected?.mediaId === other.mediaId);
    setSelected(item ?? null);
  }, [state.items, setSelected, state.selected?.mediaId]);

  return (
    <AppContext.Provider value={{ state, setSelected, tryPassword, refresh, updateItem, removeItem }}>
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
