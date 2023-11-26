import { MouseEvent, ChangeEvent, SyntheticEvent, useCallback, useContext, useRef, useState } from "react";

import { AppContext } from "./AppContext";
import { MediaItem } from "./client";

type InputSubmitEvent = SyntheticEvent<HTMLFormElement, SubmitEvent & { submitter: HTMLInputElement }>;

function Editor() {
  const { danger, selected, client, password, updateItem, removeItem } = useContext(AppContext);
  const [locked, setLocked] = useState(false);

  const onRetitle = useCallback((event: InputSubmitEvent) => {
    event.preventDefault();
    setLocked(true);

    const formData = new FormData(event.currentTarget);
    const title = (formData.get("title") ?? selected!.title) as string;
    client.retitleLibraryEntry(selected!.mediaId, password!, title).then(updateItem).then(() => setLocked(false));
  }, [selected, password, client, updateItem, setLocked]);

  const onDelete = useCallback(() => {
    setLocked(true);
    client.deleteLibraryEntry(selected!.mediaId, password!).then((item) => {
      removeItem(item);
      setLocked(false);
    });
  }, [selected, password, client, removeItem, setLocked]);

  const onRetag = useCallback((event: InputSubmitEvent) => {
    event.preventDefault();
    setLocked(true);

    const add = event.nativeEvent.submitter.value === "tag";

    const formData = new FormData(event.currentTarget);
    const tag = (formData.get("tag") ?? "") as string;

    if (tag.length > 0) {
      if (add) {
        client.tagLibraryEntry(selected!.mediaId, password!, tag).then(updateItem).then(() => setLocked(false));
      } else {
        client.untagLibraryEntry(selected!.mediaId, password!, tag).then(updateItem).then(() => setLocked(false));
      }
    } else {
      setLocked(false);
    }
  }, [selected, password, client, updateItem, setLocked]);

  const elFile = useRef<HTMLInputElement>(null);
  const onSubtitleClick = useCallback(() => {
    elFile.current?.click();
  }, [client, selected, password, elFile]);

  const onSubtitleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setLocked(true);
    const [subtitles] = event.currentTarget.files!;

    if (subtitles) {
      client.uploadSubtitles(password!, selected!.mediaId, subtitles).then(updateItem).then(() => setLocked(false));
    }
  }, [client, selected, password, updateItem, setLocked]);

  const elTagInput = useRef<HTMLInputElement>(null);
  const onTagClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    elTagInput.current!.value = event.currentTarget.textContent ?? "";
  }, [elTagInput]);

  return (
    <fieldset key={selected?.mediaId} disabled={locked}>
      <legend>{password ? "edit selected" : "view selected"}</legend>
      <Video media={selected!} />
      {password && <fieldset>
        <legend>title</legend>
        <form onSubmit={onRetitle}>
          <input name="title" type="text" defaultValue={selected?.title} />
          <input type="submit" value="retitle" />
        </form>
      </fieldset>}
      <fieldset>
        <legend>tags</legend>
        {password ? <>
          <form>{selected?.tags.map((tag) => <button key={tag} onClick={onTagClick}>{tag}</button>)}</form>
          <form onSubmit={onRetag}>
            <input ref={elTagInput} name="tag" type="text" />
            <input type="submit" value="tag" />
            <input type="submit" value="untag" />
          </form>
        </> : <span>{(selected?.tags.join(", ") || "no tags")}</span>}
      </fieldset>
      <fieldset>
        <legend>subtitles</legend>
        <a href={selected?.subtitle} target="_blank">{selected?.subtitle ? "view subtitles" : "no subtitles"}</a>
        {password && <form>
          <input onChange={onSubtitleChange} ref={elFile} hidden name="file" type="file" accept=".srt,.vtt" />
          <button onClick={onSubtitleClick}>{selected!.subtitle ? "replace subtitles" : "add subtitles"}</button>
        </form>}
      </fieldset>
      {danger && password &&
        <fieldset className="danger">
          <legend>danger</legend>
          <button onClick={onDelete}>delete media</button>
        </fieldset>}
    </fieldset>
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

export default Editor;
