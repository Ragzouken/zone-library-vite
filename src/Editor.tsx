import { ChangeEvent, SyntheticEvent, useCallback, useContext, useRef } from "react";

import "./Editor.css";

import { AppContext } from "./AppContext";

type InputSubmitEvent = SyntheticEvent<HTMLFormElement, SubmitEvent & { submitter: HTMLInputElement }>;

function Editor() {
  const { danger, selected, client, password, setSelected } = useContext(AppContext);

  const onRetitle = useCallback((event: InputSubmitEvent) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const title = (formData.get("title") ?? selected!.title) as string;
    client.retitleLibraryEntry(selected!.mediaId, password!, title).then(setSelected);
  }, [selected, password, client, setSelected]);

  const onDelete = useCallback(() => {
    client.deleteLibraryEntry(selected!.mediaId, password!).then(() => setSelected(null));
  }, [selected, password, client, setSelected]);

  const onRetag = useCallback((event: InputSubmitEvent) => {
    event.preventDefault();

    const add = event.nativeEvent.submitter.value === "tag";

    const formData = new FormData(event.currentTarget);
    const tag = (formData.get("tag") ?? "") as string;

    if (tag.length > 0) {
      if (add) {
        client.tagLibraryEntry(selected!.mediaId, password!, tag).then(console.log);
      } else {
        client.untagLibraryEntry(selected!.mediaId, password!, tag).then(console.log);
      }
    }
  }, [selected, password, client]);

  const elFile = useRef<HTMLInputElement>(null);
  const onSubtitleClick = useCallback(() => {
    elFile.current?.click();
  }, [client, selected, password, elFile]);

  const onSubtitleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const [subtitles] = event.currentTarget.files!;

    if (subtitles) {
      client.uploadSubtitles(password!, selected!.mediaId, subtitles).then(setSelected);
    }
  }, [client, selected, password, setSelected]);

  return (
    <fieldset className="editor" key={selected?.mediaId}>
      <legend>edit selected</legend>
      <fieldset>
        <legend>title</legend>
        <form onSubmit={onRetitle}>
          <input name="title" type="text" defaultValue={selected?.title} />
          <input type="submit" value="retitle" />
        </form>
      </fieldset>
      <fieldset>
        <legend>tags</legend>
        {selected?.tags.join(", ")}
        <form onSubmit={onRetag}>
          <input name="tag" type="text" />
          <input type="submit" value="tag" />
          <input type="submit" value="untag" />
        </form>
      </fieldset>
      <fieldset>
        <legend>subtitles</legend>
        <input onChange={onSubtitleChange} ref={elFile} hidden name="file" type="file" accept=".srt,.vtt" />
        <button onClick={onSubtitleClick}>{selected!.subtitle ? "replace subtitles" : "add subtitles"}</button>
        <a href={selected?.subtitle} target="_blank">{selected?.subtitle ? "view subtitles" : "no subtitles"}</a>
      </fieldset>
      {danger && 
      <fieldset>
        <legend>danger</legend>
        <button className="danger" onClick={onDelete}>delete media</button>
      </fieldset>}
    </fieldset>
  );
}

export default Editor;
