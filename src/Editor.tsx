import { SyntheticEvent, useCallback } from "react";
import { Client, MediaItem } from "./client";

import "./Editor.css";

type InputSubmitEvent = SyntheticEvent<HTMLFormElement, SubmitEvent & { submitter: HTMLInputElement }>;

function Editor(props: { selected: MediaItem | null, hidden: boolean, client: Client, password: string | null }) {
  const onRetitle = useCallback((event: InputSubmitEvent) => {
    event.preventDefault();
    if (!props.selected || !props.password) return;

    const formData = new FormData(event.currentTarget);
    const title = (formData.get("title") ?? props.selected.title) as string;
    props.client.retitleLibraryEntry(props.selected.mediaId, props.password, title).then(console.log);
  }, []);

  const onRetag = useCallback((event: InputSubmitEvent) => {
    event.preventDefault();
    if (!props.selected || !props.password) return;

    const add = event.nativeEvent.submitter.value === "tag";

    const formData = new FormData(event.currentTarget);
    const tag = (formData.get("tag") ?? "") as string;
    
    if (tag.length > 0) {
      if (add) {
        props.client.tagLibraryEntry(props.selected.mediaId, props.password ?? "", tag).then(console.log);
      } else {
        props.client.untagLibraryEntry(props.selected.mediaId, props.password ?? "", tag).then(console.log);
      }
    }
  }, []);

  const onSubtitle = useCallback((event: InputSubmitEvent) => {
    event.preventDefault();
    if (!props.selected || !props.password) return;

    const formData = new FormData(event.currentTarget);
    const subtitles = formData.get("file") as File;

    if (subtitles) {
      props.client.uploadSubtitles(props.password ?? "", props.selected.mediaId, subtitles).then(console.log);
    }
  }, []);

  return (
    <fieldset className="editor" hidden={props.hidden}>
      <legend>edit selected</legend>
      <Video src={props.selected?.src ?? ""} subtitles={props.selected?.subtitle ?? ""} />
      <form onSubmit={onRetitle}>
        <input name="title" type="text" defaultValue={props.selected?.title} key={props.selected?.mediaId} />
        <input type="submit" value="retitle" />
      </form>
      <p>Tags: {props.selected?.tags.join(", ")}</p>
      <form onSubmit={onRetag}>
        <input name="tag" type="text" />
        <input type="submit" value="tag" />
        <input type="submit" value="untag" />
      </form>
      <form onSubmit={onSubtitle}>
        <input key={props.selected?.mediaId} name="file" type="file" accept=".srt,.vtt" required />
        <input type="submit" value="upload subtitles" />
      </form>
      <a href={props.selected?.subtitle} target="_blank">{props.selected?.subtitle ? "Subtitles" : "No subtitles"}</a>
    </fieldset>
  );
}

function Video(props: { subtitles: string, src: string }) {
  let subtitles = props.subtitles;

  // bypass cache
  if (subtitles) {
    const url = new URL(subtitles);
    url.searchParams.set("v", Math.random().toString());
    subtitles = url.toString();
  }

  return (
    <video controls src={props.src} crossOrigin="anonymous">
      <track src={subtitles} kind="subtitles" label="English" srcLang="en" default />
    </video>
  );
}

export default Editor;
