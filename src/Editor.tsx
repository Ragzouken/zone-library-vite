import { SyntheticEvent, useCallback, useContext } from "react";
import { Client, MediaItem } from "./client";

import "./Editor.css";

import { AppContext } from "./AppContext";

type InputSubmitEvent = SyntheticEvent<HTMLFormElement, SubmitEvent & { submitter: HTMLInputElement }>;

function Editor() {
  const { danger, selected, client, password } = useContext(AppContext);
  
  const onRetitle = useCallback((event: InputSubmitEvent) => {
    event.preventDefault();
    if (!selected || !password) return;

    const formData = new FormData(event.currentTarget);
    const title = (formData.get("title") ?? selected.title) as string;
    client.retitleLibraryEntry(selected.mediaId, password, title).then(console.log);
  }, [selected, password, client]);

  const onDelete = useCallback((event: any) => {
    event.preventDefault();
    if (!selected || !password) return;

    client.deleteLibraryEntry(selected.mediaId, password);
  }, [selected, password, client]);

  const onRetag = useCallback((event: InputSubmitEvent) => {
    event.preventDefault();
    if (!selected || !password) return;

    const add = event.nativeEvent.submitter.value === "tag";

    const formData = new FormData(event.currentTarget);
    const tag = (formData.get("tag") ?? "") as string;
    
    if (tag.length > 0) {
      if (add) {
        client.tagLibraryEntry(selected.mediaId, password ?? "", tag).then(console.log);
      } else {
        client.untagLibraryEntry(selected.mediaId, password ?? "", tag).then(console.log);
      }
    }
  }, [selected, password, client]);

  const onSubtitle = useCallback((event: InputSubmitEvent) => {
    event.preventDefault();
    if (!selected || !password) return;

    const formData = new FormData(event.currentTarget);
    const subtitles = formData.get("file") as File;

    if (subtitles) {
      client.uploadSubtitles(password ?? "", selected.mediaId, subtitles).then(console.log);
    }
  }, [selected, password, client]);

  return (
    <fieldset className="editor">
      <legend>edit selected</legend>
      <form onSubmit={onRetitle}>
        <input name="title" type="text" defaultValue={selected?.title} key={selected?.mediaId} />
        <input type="submit" value="retitle" />
      </form>
      {danger && <button onClick={onDelete}>delete</button>}
      <p>Tags: {selected?.tags.join(", ")}</p>
      <form onSubmit={onRetag}>
        <input name="tag" type="text" />
        <input type="submit" value="tag" />
        <input type="submit" value="untag" />
      </form>
      <form onSubmit={onSubtitle}>
        <input key={selected?.mediaId} name="file" type="file" accept=".srt,.vtt" required />
        <input type="submit" value="upload subtitles" />
      </form>
      <a href={selected?.subtitle} target="_blank">{selected?.subtitle ? "Subtitles" : "No subtitles"}</a>
    </fieldset>
  );
}

export default Editor;
