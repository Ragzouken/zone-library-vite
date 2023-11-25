import { useCallback, useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

import Auth from './Auth';
import Uploader from './Uploader';
import Editor from './Editor';
import Browser from "./Browser";
import { Client, MediaItem } from "./client";

function App() {
  const [client] = useState(new Client({ base: "https://tinybird.zone" }));
  const [password, setPassword] = useState<string | null>(null);
  const [selected, setSelected] = useState<MediaItem | null>(null);

  const tryPassword = useCallback((password: string) => {
    client.checkLibraryAuth(password).then(({ authorized }) => {
      if (authorized) setPassword(password);
    });
  }, [client, password]);

  return (
    <>
      <div>
        {password === null ?
          <Auth tryPassword={tryPassword} /> :
          <>
            <Uploader password={password} client={client} />
            <Editor hidden={password === null || !selected} password={password} selected={selected} client={client} />
          </>
        }
      </div>
      <Browser selected={selected} setSelected={setSelected} client={client} />
    </>
  );
}

export default App
