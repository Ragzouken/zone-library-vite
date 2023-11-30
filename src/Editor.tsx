import { MouseEvent, ChangeEvent, useCallback, useContext, useRef, useMemo } from "react";

import { AppContext } from "./AppContext";
import { MediaItem } from "./client";
import { useLock } from "./utilities";

function Editor({ selected }: { selected: MediaItem }) {
  const { state, dispatch } = useContext(AppContext);
  const [locked, , WithLock] = useLock();

  const refTitle = useRef<HTMLInputElement>(null);
  const onRetitle = useCallback(() => {
    const title = refTitle.current?.value ?? "untitled";

    WithLock(state.client.retitleLibraryEntry(selected.mediaId, state.password!, title).then((item) => dispatch({ type: "updateItem", item })));
  }, [WithLock, state.client, state.password, selected.mediaId, dispatch]);

  const refTag = useRef<HTMLInputElement>(null);
  const onTag = useCallback(() => {
    const tag = refTag.current?.value ?? "";
    if (!tag) return;
    WithLock(state.client.tagLibraryEntry(selected.mediaId, state.password!, tag).then((item) => dispatch({ type: "updateItem", item })));
  }, [WithLock, dispatch, selected.mediaId, state.client, state.password]);

  const onUntag = useCallback(() => {
    const tag = refTag.current?.value ?? "";
    if (!tag) return;
    WithLock(state.client.untagLibraryEntry(selected.mediaId, state.password!, tag).then((item) => dispatch({ type: "updateItem", item })));
  }, [WithLock, dispatch, selected.mediaId, state.client, state.password]);

  const onTagClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    refTag.current!.value = event.currentTarget.textContent ?? "";
  }, [refTag]);

  const refFile = useRef<HTMLInputElement>(null);
  const onSubtitleClick = useCallback(() => {
    refFile.current?.click();
  }, [refFile]);

  const onSubtitleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const [subtitles] = event.currentTarget.files!;

    if (subtitles) {
      WithLock(state.client.uploadSubtitles(state.password!, selected.mediaId, subtitles).then((item) => dispatch({ type: "updateItem", item })));
    }
  }, [WithLock, state.client, state.password, selected.mediaId, dispatch]);

  const onDelete = useCallback(() => {
    WithLock(state.client.deleteLibraryEntry(selected.mediaId, state.password!).then((item) => dispatch({ type: "removeItem", item })));
  }, [WithLock, state.client, state.password, selected.mediaId, dispatch]);

  const tags = useMemo(() => {
    return Object.entries(
      state.items
        .flatMap(i => i.tags)
        .reduce((tags, tag) => {
          tags[tag] = (tags[tag] || 0) + 1;
          return tags;
        }, {} as Record<string, number>)
    )
      .sort(([, a], [, b]) => b - a)
      .map(([tag,]) => tag);
  }, [state.items]);

  return (
    <fieldset key={selected.mediaId} disabled={locked}>
      <legend>{state.password ? "edit selected" : "view selected"}</legend>
      <Video media={selected} />
      <fieldset>
        <legend>subtitles</legend>
        <div className="form-row">
          <div className="form-row"><a href={selected.subtitle} target="_blank">{selected.subtitle ? "view subtitles" : "no subtitles"}</a></div>
          {state.password && <>
            <input onChange={onSubtitleChange} ref={refFile} hidden name="file" type="file" accept=".srt,.vtt" />
            <button onClick={onSubtitleClick}>{selected.subtitle ? "replace subtitles" : "add subtitles"}</button>
          </>}
        </div>
      </fieldset>
      {state.password && <fieldset>
        <legend>title</legend>
        <div className="form-row">
          <input ref={refTitle} name="title" type="text" defaultValue={selected.title} />
          <button onClick={onRetitle}>retitle</button>
        </div>
      </fieldset>}
      <fieldset>
        <legend>tags</legend>
        {state.password ? <>
          <div className="form-row">{selected.tags.map((tag) => <button key={tag} onClick={onTagClick}>{tag}</button>)}</div>
          <div className="form-row">
            <input ref={refTag} list="tags" name="tag" type="text" required />
            <button onClick={onTag}>tag</button>
            <button onClick={onUntag}>untag</button>
            <datalist id="tags">
              {tags.map((tag) => <option value={tag} />)}
            </datalist>
          </div>
        </> : <span>{(selected.tags.join(", ") || "no tags")}</span>}
      </fieldset>
      {state.danger && state.password &&
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
