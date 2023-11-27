import { ChangeEvent, useCallback, useContext, useRef, useState } from "react";

import { AppContext } from "./AppContext";
import { useLock } from "./App";

function Uploader({ password, limit }: { password: string, limit: number }) {
  const { client, setSelected, refresh } = useContext(AppContext);
  const [locked, _, WithLock] = useLock();

  const [large, setLarge] = useState(false);

  const elTitle = useRef<HTMLInputElement>(null);
  const elMedia = useRef<HTMLInputElement>(null);
  const onUpload = useCallback(() => {
    const title = elTitle.current?.value ?? "untitled";
    const [media] = (elMedia.current?.files ?? []);

    if (media && media.size <= limit) {
      WithLock(client.uploadMedia(password, media, title).then(setSelected).then(refresh));
    } else {
      elMedia.current?.click();
    }
  }, [password, client, setSelected, refresh, elTitle, elMedia]);

  const onFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const [file] = event.currentTarget.files ?? [];

    setLarge((file?.size ?? 0) > limit);
    elTitle.current!.value = file?.name || "";
  }, [elTitle]);

  return (
    <fieldset disabled={locked}>
      <legend>upload media</legend>
        <input className={large ? "invalid" : ""} ref={elMedia} onChange={onFileChange} type="file" name="file" required accept=".mp3,.mp4"></input>
      <div className="form-row">
        <label>
          title
          <input ref={elTitle} type="text" name="title" required></input>
        </label>
        <button onClick={onUpload} disabled={large} title={large ? "file too large" : ""}>upload</button>
      </div>
    </fieldset>
  );
}

export default Uploader;
