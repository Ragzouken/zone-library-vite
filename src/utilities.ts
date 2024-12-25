const pad2 = (part: number) => (part.toString().length >= 2 ? part.toString() : '0' + part.toString());
export function secondsToTime(seconds: number) {
  if (isNaN(seconds)) return '??:??';

  const s = Math.floor(seconds % 60);
  const m = Math.floor(seconds / 60) % 60;
  const h = Math.floor(seconds / 3600);

  return h > 0 ? `${pad2(h)}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`; 
}
