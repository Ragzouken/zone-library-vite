import { useCallback, useState } from 'react'
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
  
  const danger = new URL(window.location.toString()).searchParams.has("danger");

  const tryPassword = useCallback((password: string) => {
    client.checkLibraryAuth(password).then(({ authorized }) => {
      if (authorized) setPassword(password);
    });
  }, [client, password]);

  const editor = password && selected;

  return (
    <AppContext.Provider value={{ client, password, selected, setSelected, tryPassword, danger }}>
      <div>
        {selected && <Video media={selected} />}
        {password === null && <Auth />}
        {editor && <Editor />}
        {password && <Uploader />}
      </div>
      <Browser />
    </AppContext.Provider>
  );
}

function Video(props: { media: MediaItem }) {
  let subtitles = props.media.subtitle;

  // bypass cache
  if (subtitles) {
    const url = new URL(subtitles);
    url.searchParams.set("v", Math.random().toString());
    subtitles = url.toString();
  }

  return (
    <video controls src={props.media.src} crossOrigin="anonymous">
      {subtitles && <track src={subtitles} kind="subtitles" label="English" srcLang="en" default />}
    </video>
  );
}

export default App
