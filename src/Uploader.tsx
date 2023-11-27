import { ChangeEvent, useCallback, useContext, useRef, useState } from "react";

import { AppContext } from "./AppContext";
import { useLock } from "./utilities";

function Uploader({ password, limit }: { password: string, limit: number }) {
  const { state, selectItem: setSelected, refresh } = useContext(AppContext);
  const [locked, , WithLock] = useLock();

  const [large, setLarge] = useState(false);

  const elTitle = useRef<HTMLInputElement>(null);
  const elMedia = useRef<HTMLInputElement>(null);
  const onUpload = useCallback(() => {
    const title = elTitle.current?.value ?? "untitled";
    const [media] = (elMedia.current?.files ?? []);

    if (media && !large) {
      WithLock(state.client.uploadMedia(password, media, title).then(setSelected).then(refresh));
    } else {
      elMedia.current?.click();
    }
  }, [large, WithLock, state.client, password, setSelected, refresh]);

  const onFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const [file] = event.currentTarget.files ?? [];

    setLarge((file?.size ?? 0) > limit);
    elTitle.current!.value = file?.name || "";
  }, [limit, setLarge]);

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
