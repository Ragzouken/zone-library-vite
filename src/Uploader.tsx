import { SyntheticEvent, useCallback, useContext } from "react";

import { AppContext } from "./AppContext";

function Uploader() {
  const { password, client, setSelected } = useContext(AppContext);

  const onSubmit = useCallback((event: SyntheticEvent<HTMLFormElement, SubmitEvent> ) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const media = formData.get("file") as File;

    if (media) {
      client.uploadMedia(password!, media, title).then(setSelected);
    }
  }, [password, client]);
  
  return (
    <form onSubmit={onSubmit}>
      <fieldset>
        <legend>upload media</legend>
        <label>
          title
          <input type="text" name="title" required></input>
        </label>
        <input type="file" name="file" required></input>
        <input type="submit" value="upload" />
      </fieldset>
    </form>
  );
}

export default Uploader;
