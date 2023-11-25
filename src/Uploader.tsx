import { SyntheticEvent, useCallback } from "react";
import { Client } from "./client";

function Uploader(props: { password: string | null, client: Client }) {
  const onSubmit = useCallback((event: SyntheticEvent<HTMLFormElement, SubmitEvent> ) => {
    event.preventDefault();
    if (!props.password) return;

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const media = formData.get("file") as File;

    if (media) {
      props.client.uploadMedia(props.password, media, title).then(console.log);
    }
  }, [props.password, props.client]);
  
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
