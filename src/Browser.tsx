import { ChangeEvent, useCallback, useContext, useMemo, useState } from "react";
import { MediaItem } from "./client";
import "./Browser.css"
import tags from "./tags.module.css";

import { AppContext } from "./AppContext";
import { secondsToTime } from "./utilities";

type SortType = "title" | "duration" | "newest";
type MediaCompare = (a: MediaItem, b: MediaItem) => number;

const sorts: Partial<Record<SortType, MediaCompare>> = {
  title: (a, b) => a.title.localeCompare(b.title),
  duration: (a, b) => b.duration - a.duration,
};

type BrowserState = {
  filter: string,
  sort: SortType,
}

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Longest", value: "duration" },
  { label: "Title", value: "title" },
];

function Browser() {
  const [state, setState] = useState<BrowserState>({ filter: "", sort: "newest" });

  const { state: appState, refresh } = useContext(AppContext);

  function filterInput(event: ChangeEvent<HTMLInputElement>) {
    setState({ ...state, filter: event.currentTarget.value });
  }

  function onSortChange(event: ChangeEvent<HTMLInputElement>) {
    setState({ ...state, sort: event.currentTarget.value as SortType });
  }

  const filtered = useMemo(() => {
    const result = appState.items.filter((item) => item.title.includes(state.filter));
    if (sorts[state.sort]) result.sort(sorts[state.sort]);
    if (state.sort === "newest") result.reverse();
    return result;
  }, [appState.items, state.filter, state.sort]);

  return (
    <div className="browser">
      <div className="controls">
        <button onClick={refresh}>refresh</button>
        <ul className="sort">
          Sort by:
          {sortOptions.map(({ label, value }) => (
            <li>
              <label>
                <input name="sort" type="radio" value={value} checked={state.sort === value} onChange={onSortChange} />
                {label}
              </label>
            </li>
          ))}
        </ul>
        <label className="filter">
          Filter:
          <input type="text" onChange={filterInput} value={state.filter} />
        </label>
      </div>
      <ul className="listing">
        {filtered.map((item) => (
          <li key={item.mediaId} className={["default", ...item.tags].map((tag) => tags[tag]).join(" ")}>
            <BrowserItem item={item} isSelected={appState.selected?.mediaId === item.mediaId} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function BrowserItem(props: { item: MediaItem, isSelected: boolean }) {
  const { dispatch } = useContext(AppContext);

  const select = useCallback(() => {
    dispatch({ type: "selectItem", item: props.item })
  }, [dispatch, props.item]);

  return (
    <button className="browser-item" aria-selected={props.isSelected} onClick={select}>
      <span>{props.item.title}</span>
      <time>{secondsToTime(props.item.duration / 1000)}</time>
    </button>
  );
}

export default Browser;
