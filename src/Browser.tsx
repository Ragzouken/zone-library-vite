import { useContext, useEffect, useMemo, useState } from "react";
import { MediaItem } from "./client";
import "./Browser.css"

import { AppContext } from "./AppContext";

type SortType = "title" | "duration" | "newest";
type MediaCompare = (a: MediaItem, b: MediaItem) => number;

const sorts: Partial<Record<SortType, MediaCompare>> = {
  title: (a: MediaItem, b: MediaItem) => a.title.localeCompare(b.title),
  duration: (a: MediaItem, b: MediaItem) => b.duration - a.duration,
};

type BrowserState = {
  items: MediaItem[],
  filter: string,
  sort: SortType,
}

function Browser() {
  const [state, setState] = useState<BrowserState>({ items: [], filter: "", sort: "newest" });

  const { selected, client } = useContext(AppContext);

  function setItems(items: MediaItem[]) {
    setState((state) => ({ ...state, items }));
  }

  function refresh() {
    client.searchLibrary().then(setItems);
  }

  function filterInput(e: any) {
    setState({ ...state, filter: e.currentTarget.value });
  }

  function onSortChange(e: any) {
    setState({ ...state, sort: e.currentTarget.value });
  }

  useEffect(refresh, []);

  const filtered = useMemo(() => {
    const result = state.items.filter((item) => item.title.includes(state.filter));
    if (sorts[state.sort]) result.sort(sorts[state.sort]);
    if (state.sort === "newest") result.reverse();
    return result;
  }, [state.items, state.filter, state.sort]);

  const sortOptions = [
    { label: "Newest", value: "newest" },
    { label: "Longest", value: "duration" },
    { label: "Title", value: "title" },
  ]

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
          <li key={item.mediaId}>
            <BrowserItem item={item} isSelected={selected?.mediaId === item.mediaId} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function BrowserItem(props: { item: any, isSelected: boolean }) {
  const { setSelected } = useContext(AppContext);

  function select() {
    setSelected(props.item);
  }

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
