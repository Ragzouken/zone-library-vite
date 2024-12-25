import { ChangeEvent, useCallback, useContext, useRef, useState } from "react";

import { AppContext } from "./AppContext";
import { useFormStatus } from "react-dom";

function Uploader({ password, limit }: { password: string, limit: number }) {
  const { state, dispatch, refresh } = useContext(AppContext);

  const [large, setLarge] = useState(false);
  const { pending } = useFormStatus();

  const refTitle = useRef<HTMLInputElement>(null);
  const refMedia = useRef<HTMLInputElement>(null);

  const onFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const [file] = event.currentTarget.files ?? [];

    setLarge((file?.size ?? 0) > limit);
    refTitle.current!.value = file?.name || "";
  }, [limit, setLarge]);

  async function uploadAction(formData: FormData) {
    const title = formData.get("title") as string;
    const media = formData.get("file") as File;

    if (media && !large) {
      const item = await state.client.uploadMedia(password, media, title);
      console.log(item)
      await dispatch({ type: "selectItem", item });
      await refresh();
    }
  }

  return (
    <fieldset disabled={pending}>
      <legend>upload media</legend>
        <input className={large ? "invalid" : ""} ref={refMedia} onChange={onFileChange} type="file" name="file" required accept=".mp3,.mp4"></input>
      <div className="form-row">
        <label>
          title
          <input ref={refTitle} type="text" name="title" required></input>
        </label>
        <button formAction={uploadAction} disabled={large} title={large ? "file too large" : ""}>upload</button>
      </div>
    </fieldset>
  );
}

export default Uploader;
