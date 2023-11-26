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

function App() {
  const [client] = useState(() => new Client({ base: "https://tinybird.zone" }));
  const [password, setPassword] = useState<string | null>(null);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [items, setItems] = useState<MediaItem[]>([]); 

  const danger = new URL(window.location.toString()).searchParams.has("danger");

  const refresh = useCallback(() => {
    client.searchLibrary().then(setItems);
  }, [client, setItems]);

  const tryPassword = useCallback((password: string) => {
    client.checkLibraryAuth(password).then(({ authorized }) => {
      if (authorized) setPassword(password);
    });
  }, [client, password]);

  const updateItem = useCallback((item: MediaItem) => {
    const next = [...items];
    const index = next.findIndex((other) => item.mediaId === other.mediaId);
    if (index >= 0) {
      next[index] = item;
    } else {
      next.push(item);
    }
    setItems(next);
  }, [items, setItems]);

  const removeItem = useCallback((item: MediaItem) => {
    const index = items.findIndex((other) => item.mediaId === other.mediaId);
    if (index >= 0) {
      const next = [...items];
      next.splice(index, 1);
      setItems(next);

      if (selected?.mediaId === item.mediaId) {
        setSelected(null);
      }
    }
  }, [items, setItems, selected, setSelected]);

  useEffect(refresh, []);

  useEffect(() => {
    const item = items.find((other) => selected?.mediaId === other.mediaId);
    setSelected(item ?? null);
  }, [items, selected, setSelected]);

  return (
    <AppContext.Provider value={{ client, password, selected, setSelected, tryPassword, danger, items, refresh, updateItem, removeItem }}>
      <div>
        {password === null && <Auth />}
        {selected && <Editor />}
        {password && <Uploader />}
      </div>
      <Browser />
    </AppContext.Provider>
  );
}

export default App
