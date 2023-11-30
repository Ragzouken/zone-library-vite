import { ChangeEvent, useCallback, useContext, useRef, useState } from "react";

import { AppContext } from "./AppContext";
import { useLock } from "./utilities";

function Uploader({ password, limit }: { password: string, limit: number }) {
  const { state, dispatch, refresh } = useContext(AppContext);
  const [locked, , WithLock] = useLock();

  const [large, setLarge] = useState(false);

  const refTitle = useRef<HTMLInputElement>(null);
  const refMedia = useRef<HTMLInputElement>(null);
  const onUpload = useCallback(() => {
    const title = refTitle.current?.value ?? "untitled";
    const [media] = (refMedia.current?.files ?? []);

    if (media && !large) {
      WithLock(state.client.uploadMedia(password, media, title).then((item) => dispatch({ type: "selectItem", item })).then(refresh));
    } else {
      refMedia.current?.click();
    }
  }, [large, WithLock, state.client, password, refresh, dispatch]);

  const onFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const [file] = event.currentTarget.files ?? [];

    setLarge((file?.size ?? 0) > limit);
    refTitle.current!.value = file?.name || "";
  }, [limit, setLarge]);

  return (
    <fieldset disabled={locked}>
      <legend>upload media</legend>
        <input className={large ? "invalid" : ""} ref={refMedia} onChange={onFileChange} type="file" name="file" required accept=".mp3,.mp4"></input>
      <div className="form-row">
        <label>
          title
          <input ref={refTitle} type="text" name="title" required></input>
        </label>
        <button onClick={onUpload} disabled={large} title={large ? "file too large" : ""}>upload</button>
      </div>
    </fieldset>
  );
}

export default Uploader;
