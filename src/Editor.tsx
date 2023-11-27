import { MouseEvent, ChangeEvent, useCallback, useContext, useRef, useMemo } from "react";

import { AppContext } from "./AppContext";
import { MediaItem } from "./client";
import { useLock } from "./utilities";

function Editor({ selected }: { selected: MediaItem }) {
  const { danger, client, password, updateItem, removeItem, items } = useContext(AppContext);
  const [locked, , WithLock] = useLock();

  const elTitle = useRef<HTMLInputElement>(null);
  const onRetitle = useCallback(() => {
    const title = elTitle.current?.value ?? "untitled";

    WithLock(client.retitleLibraryEntry(selected.mediaId, password!, title).then(updateItem));
  }, [selected.mediaId, password, client, updateItem, WithLock]);

  const elTag = useRef<HTMLInputElement>(null);
  const onTag = useCallback(() => {
    const tag = elTag.current?.value ?? "";
    if (!tag) return;
    WithLock(client.tagLibraryEntry(selected.mediaId, password!, tag).then(updateItem));
  }, [WithLock, client, selected.mediaId, password, updateItem]);

  const onUntag = useCallback(() => {
    const tag = elTag.current?.value ?? "";
    if (!tag) return;
    WithLock(client.untagLibraryEntry(selected.mediaId, password!, tag).then(updateItem));
  }, [WithLock, client, selected.mediaId, password, updateItem]);

  const onTagClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    elTag.current!.value = event.currentTarget.textContent ?? "";
  }, [elTag]);

  const elFile = useRef<HTMLInputElement>(null);
  const onSubtitleClick = useCallback(() => {
    elFile.current?.click();
  }, [elFile]);

  const onSubtitleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const [subtitles] = event.currentTarget.files!;

    if (subtitles) {
      WithLock(client.uploadSubtitles(password!, selected.mediaId, subtitles).then(updateItem));
    }
  }, [client, selected.mediaId, password, updateItem, WithLock]);

  const onDelete = useCallback(() => {
    WithLock(client.deleteLibraryEntry(selected.mediaId, password!).then(removeItem));
  }, [selected.mediaId, password, client, removeItem, WithLock]);

  const tags = useMemo(() => {
    return Object.entries(
      items
        .flatMap(i => i.tags)
        .reduce((tags, tag) => {
          tags[tag] = (tags[tag] || 0) + 1;
          return tags;
        }, {} as Record<string, number>)
    )
      .sort(([, a], [, b]) => b - a)
      .map(([tag,]) => tag);
  }, [items]);

  return (
    <fieldset key={selected.mediaId} disabled={locked}>
      <legend>{password ? "edit selected" : "view selected"}</legend>
      <Video media={selected} />
      <fieldset>
        <legend>subtitles</legend>
        <div className="form-row">
          <div className="form-row"><a href={selected.subtitle} target="_blank">{selected.subtitle ? "view subtitles" : "no subtitles"}</a></div>
          {password && <>
            <input onChange={onSubtitleChange} ref={elFile} hidden name="file" type="file" accept=".srt,.vtt" />
            <button onClick={onSubtitleClick}>{selected.subtitle ? "replace subtitles" : "add subtitles"}</button>
          </>}
        </div>
      </fieldset>
      {password && <fieldset>
        <legend>title</legend>
        <div className="form-row">
          <input ref={elTitle} name="title" type="text" defaultValue={selected.title} />
          <button onClick={onRetitle}>retitle</button>
        </div>
      </fieldset>}
      <fieldset>
        <legend>tags</legend>
        {password ? <>
          <div className="form-row">{selected.tags.map((tag) => <button key={tag} onClick={onTagClick}>{tag}</button>)}</div>
          <div className="form-row">
            <input ref={elTag} list="tags" name="tag" type="text" required />
            <button onClick={onTag}>tag</button>
            <button onClick={onUntag}>untag</button>
            <datalist id="tags">
              {tags.map((tag) => <option value={tag} />)}
            </datalist>
          </div>
        </> : <span>{(selected.tags.join(", ") || "no tags")}</span>}
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
