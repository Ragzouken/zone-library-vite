import { ChangeEvent, SyntheticEvent, useCallback, useContext, useRef } from "react";

import { AppContext } from "./AppContext";

function Uploader() {
  const { password, client, setSelected, refresh } = useContext(AppContext);

  const onSubmit = useCallback((event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const media = formData.get("file") as File;

    if (media) {
      client.uploadMedia(password!, media, title).then((item) => {
        setSelected(item);
        refresh();
      });
    }
  }, [password, client, setSelected, refresh]);

  const elTitleInput = useRef<HTMLInputElement>(null);
  const onFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const [file] = event.currentTarget.files ?? [];
    if (file && elTitleInput.current?.value.length === 0) {
      elTitleInput.current.value = file.name;
    }
  }, [elTitleInput]);

  return (
    <form onSubmit={onSubmit}>
      <fieldset>
        <legend>upload media</legend>
        <input onChange={onFileChange} type="file" name="file" required accept=".mp3,.mp4"></input>
        <label>
          title
          <input ref={elTitleInput} type="text" name="title" required></input>
        </label>
        <input type="submit" value="upload" />
      </fieldset>
    </form>
  );
}

export default Uploader;
