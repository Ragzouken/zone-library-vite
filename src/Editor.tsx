import { MouseEvent, ChangeEvent, useCallback, useContext, useRef, useMemo, useActionState } from "react";

import { AppContext } from "./AppContext";
import { MediaItem } from "./client";
import { useFormStatus } from "react-dom";

function Editor({ selected }: { selected: MediaItem }) {
  const { state, } = useContext(AppContext);
  const { pending } = useFormStatus();

  return (
    <form>
      <fieldset key={selected.mediaId} disabled={pending}>
        <legend>{state.password ? "edit selected" : "view selected"}</legend>
        <Video media={selected} />
        <Subtitle selected={selected} />
        {state.password && <Retitle selected={selected} />}
        <Tags selected={selected} />
        {state.danger && state.password && <Delete selected={selected} />}
      </fieldset>
    </form>
  );
}

function Retitle({ selected }: { selected: MediaItem }) {
  const { state, dispatch } = useContext(AppContext);

  const [, formAction,] = useActionState(
    async (previousState: void | null, formData: FormData) => {
      const title = formData.get("title") as string;
      const item = await state.client.retitleLibraryEntry(selected.mediaId, state.password!, title);
      await dispatch({ type: "updateItem", item });
    },
    null,
  );

  return (
    <fieldset>
      <legend>title</legend>
      <div className="form-row">
        <input name="title" type="text" defaultValue={selected.title} />
        <button formAction={formAction}>retitle</button>
      </div>
    </fieldset>
  );
}

function Subtitle({ selected }: { selected: MediaItem }) {
  const { state, dispatch } = useContext(AppContext);

  const refFile = useRef<HTMLInputElement>(null);
  const onSubtitleClick = useCallback(() => {
    refFile.current?.click();
  }, [refFile]);

  const refSubmit = useRef<HTMLButtonElement>(null);
  const onSubtitleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const [subtitles] = event.currentTarget.files!;

    if (subtitles) {
      refSubmit.current?.click();
    }
  }, [refSubmit]);

  const [, formAction,] = useActionState(
    async (previousState: void | null, formData: FormData) => {
      const subtitles = formData.get("file") as File;
      const item = await state.client.uploadSubtitles(state.password!, selected.mediaId, subtitles);
      await dispatch({ type: "updateItem", item });
    },
    null,
  );

  return (
    <fieldset>
      <legend>subtitles</legend>
      <div className="form-row">
        <div className="form-row"><a href={selected.subtitle} target="_blank">{selected.subtitle ? "view subtitles" : "no subtitles"}</a></div>
        {state.password && <>
          <input onChange={onSubtitleChange} ref={refFile} hidden name="file" type="file" accept=".srt,.vtt" />
          <button type="button" onClick={onSubtitleClick}>{selected.subtitle ? "replace subtitles" : "add subtitles"}</button>
          <button formAction={formAction} ref={refSubmit} hidden></button>
        </>}
      </div>
    </fieldset>
  );
}

function Tags({ selected }: { selected: MediaItem }) {
  const { state, dispatch } = useContext(AppContext);

  const [, tagAction,] = useActionState(
    async (previousState: void | null, formData: FormData) => {
      const tag = formData.get("tag") as string;
      const item = await state.client.tagLibraryEntry(selected.mediaId, state.password!, tag);
      await dispatch({ type: "updateItem", item });
    },
    null,
  );

  const [, untagAction,] = useActionState(
    async (previousState: void | null, formData: FormData) => {
      const tag = formData.get("tag") as string;
      const item = await state.client.untagLibraryEntry(selected.mediaId, state.password!, tag);
      await dispatch({ type: "updateItem", item });
    },
    null,
  );

  const refTag = useRef<HTMLInputElement>(null);
  const onTagClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    refTag.current!.value = event.currentTarget.textContent ?? "";
  }, [refTag]);

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
    <fieldset>
      <legend>tags</legend>
      {state.password ? <>
        <div className="form-row">{selected.tags.map((tag) => <button key={tag} onClick={onTagClick} type="button">{tag}</button>)}</div>
        <div className="form-row">
          <input ref={refTag} list="tags" name="tag" type="text" />
          <button formAction={tagAction}>tag</button>
          <button formAction={untagAction}>untag</button>
          <datalist id="tags">
            {tags.map((tag) => <option value={tag} key={tag} />)}
          </datalist>
        </div>
      </> : <span>{(selected.tags.join(", ") || "no tags")}</span>}
    </fieldset>
  )
}

function Delete({ selected }: { selected: MediaItem }) {
  const { state, dispatch } = useContext(AppContext);

  const [, formAction,] = useActionState(
    async () => {
      const item = await state.client.deleteLibraryEntry(selected.mediaId, state.password!);
      await dispatch({ type: "removeItem", item });
    },
    null,
  );

  return (
    <fieldset className="danger">
      <legend>danger</legend>
      <button formAction={formAction}>delete media</button>
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
