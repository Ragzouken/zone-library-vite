import { ChangeEvent, useCallback, useContext, useMemo, useState } from "react";
import { MediaItem } from "./client";
import "./Browser.css"
import tags from "./tags.module.css";

import { AppContext } from "./AppContext";

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

  const { selected, items, refresh } = useContext(AppContext);

  function filterInput(event: ChangeEvent<HTMLInputElement>) {
    setState({ ...state, filter: event.currentTarget.value });
  }

  function onSortChange(event: ChangeEvent<HTMLInputElement>) {
    setState({ ...state, sort: event.currentTarget.value as SortType });
  }

  const filtered = useMemo(() => {
    const result = items.filter((item) => item.title.includes(state.filter));
    if (sorts[state.sort]) result.sort(sorts[state.sort]);
    if (state.sort === "newest") result.reverse();
    return result;
  }, [items, state.filter, state.sort]);

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
            <BrowserItem item={item} isSelected={selected?.mediaId === item.mediaId} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function BrowserItem(props: { item: any, isSelected: boolean }) {
  const { setSelected } = useContext(AppContext);

  const select = useCallback(() => {
    setSelected(props.item);
  }, [props.item, setSelected]);

  return (
    <button className="browser-item" aria-selected={props.isSelected} onClick={select}>
      <span>{props.item.title}</span>
      <time>{secondsToTime(props.item.duration / 1000)}</time>
    </button>
  );
}

const pad2 = (part: any) => (part.toString().length >= 2 ? part.toString() : '0' + part.toString());
function secondsToTime(seconds: number) {
  if (isNaN(seconds)) return '??:??';

  const s = Math.floor(seconds % 60);
  const m = Math.floor(seconds / 60) % 60;
  const h = Math.floor(seconds / 3600);

  return h > 0 ? `${pad2(h)}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;
}

export default Browser;
