/** A reply cut mid-stream, partway through its code fence. */
export const REPLY = `### Debouncing the search box

Run the handler **once typing stops**, not on every key:

- keep one timer outside the handler
- clear it on each call, then start it again

\`\`\`ts
export function debounce(fn, ms = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

input.oninput = debounce((e) => sea`;
