# Keyboard focus after a soft navigation does not match a hard navigation

Since the new scroll handler became the default ([#95378](https://github.com/vercel/next.js/pull/95378), flag removed in [#95602](https://github.com/vercel/next.js/pull/95602)), the App Router does nothing to focus
on a soft navigation ([#96113](https://github.com/vercel/next.js/pull/96113) removed the blur from [#89903](https://github.com/vercel/next.js/pull/89903)). [#95378](https://github.com/vercel/next.js/pull/95378) says this "matches default browser behavior on
hard-navigation". It does not: after a hard navigation, the next Tab starts at the top of the new document. After a
soft navigation, it continues from wherever the activated link was:

- **A link in the page** (removed by the navigation): focus falls back to `<body>`. Without `cacheComponents`, the next
  Tab goes to the new page's first link, which is reasonable. **With `cacheComponents`, it goes to the footer**,
  skipping the whole new page: the previous page is kept in the DOM, hidden in an `<Activity>` *after* the new one, and
  sequential focus navigation continues from the removed link's position inside it.
- **A link in a shared layout** (survives the navigation, e.g. in the footer): focus stays on it, while the page scrolls
  to the top, so the focused link is off screen. The next Tab goes to the next footer link and scrolls back down. A
  screen reader user hears the new title but is still at the end of the page.

## Versions

- `next` 16.4.0-canary.57, `react` 19.3.0
- Node 24.21.0, pnpm 12.8.1, Linux
- Chromium 153, Firefox 155, WebKit 26.6 (Playwright 1.63.0); same results in all three

## Reproduce

```sh
pnpm install

pnpm build
node repro.mjs

CACHE_COMPONENTS=1 pnpm build
CACHE_COMPONENTS=1 node repro.mjs
```

`CACHE_COMPONENTS` toggles `cacheComponents` in `next.config.mjs`; it has to be set for the script too, since
`next start` re-reads the config.

`repro.mjs` starts `next start`, focuses a link, presses Enter, then Tab, and records where focus is after each. Every
`next/link` has a plain `<a>` twin, as the hard-navigation baseline. The header and footer are in the root layout, the
content links in the pages; the footer is pushed below the fold.

## Results (Firefox; Chromium and WebKit are the same)

Default config ([out-default.md](./out-default.md)):

| scenario | focus after navigation | in viewport | focus after Tab |
| --- | --- | --- | --- |
| content link, soft | `<body>` | - | link "First link in page A" |
| content link, hard | `<body>` | - | link "Header: Home" |
| footer link, soft | link "Footer: B" | no (1223px below the top) | link "Footer: A (hard)" |
| footer link, hard | `<body>` | - | link "Header: Home" |

With `cacheComponents: true` ([out-cache-components.md](./out-cache-components.md)):

| scenario | focus after navigation | in viewport | focus after Tab | `<h1>`s in the DOM |
| --- | --- | --- | --- | --- |
| content link, soft | `<body>` | - | **link "Footer: A"** | Page A, Home (hidden) |
| content link, hard | `<body>` | - | link "Header: Home" | Page A |
| footer link, soft | link "Footer: B" | no (1223px below the top) | link "Footer: A (hard)" | Page B, Page A (hidden) |
| footer link, hard | `<body>` | - | link "Header: Home" | Page B |

I first saw this on a real site with Orca on Firefox: after a soft navigation from a list of cards to a detail page,
Tab went straight to the footer, past about 20 focusable elements in the new page's content.
