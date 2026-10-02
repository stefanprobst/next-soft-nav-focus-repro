**Title:** With `cacheComponents`, Tab after a soft navigation skips the new page: focus continues inside the hidden previous page

### Link to the code that reproduces this issue

https://github.com/stefanprobst/next-soft-nav-focus-repro

### To Reproduce

1. `pnpm install`
2. `CACHE_COMPONENTS=1 pnpm build` (the env var toggles `cacheComponents` in `next.config.mjs`)
3. `CACHE_COMPONENTS=1 node repro.mjs`

The script starts `next start`, focuses a link, presses Enter, then Tab, and records where focus is after each, in
Chromium, Firefox and WebKit. Every `next/link` has a plain `<a>` twin as the hard-navigation baseline. The header and
footer are in the root layout, the content links in the pages, and the footer is below the fold.

To see it by hand: on `/`, Tab to "Content: A", press Enter, then press Tab once.

### Current vs. Expected behavior

**Current:** With `cacheComponents: true`, after activating a link inside the page, the next Tab lands in the
**footer**, skipping all of the new page's content:

| "Content: A" on `/` → `/a` | focus after Enter | focus after Tab |
| --- | --- | --- |
| hard navigation (`<a>`) | `<body>` | first link in the header |
| soft, default config | `<body>` | first link in the new page |
| soft, `cacheComponents: true` | `<body>` | **first link in the footer** |

The activated link is in the previous page, which `cacheComponents` keeps in the DOM, hidden (`display: none`) in an
`<Activity>` that comes *after* the new page. Focus falls back to `<body>`, but the browser's sequential focus
navigation starting point stays at the link's position inside the hidden page, so the next focusable element is in
the footer. Same result in Chromium 153, Firefox 155 and WebKit 26.6. With a screen reader (Orca on Firefox), the next
Tab announces the first footer link; on a real site this skipped about 20 focusable elements in the new page.

**Expected:** The next Tab goes where it does after a hard navigation (the start of the document), or at least to the
new page's content, as without `cacheComponents`. #95378 describes the new scroll handler as matching "default
browser behavior on hard-navigation"; with `cacheComponents` it does not.

### Provide environment information

```
Operating System:
  Platform: linux
  Arch: x64
  Version: #34~24.04.1-Ubuntu SMP PREEMPT_DYNAMIC Fri Sep  4 15:38:29 UTC 2
  Available memory (MB): 32035
  Available CPU cores: 4
Binaries:
  Node: 24.21.0
  npm: N/A
  Yarn: N/A
  pnpm: 12.8.1
Relevant Packages:
  next: 16.4.0-canary.57 // Latest available version is detected (16.4.0-canary.57).
  eslint-config-next: N/A
  react: 19.3.0
  react-dom: 19.3.0
  typescript: N/A
Next.js Config:
  output: N/A
```

### Which area(s) are affected?

Linking and Navigating, cacheComponents

### Which stage(s) are affected?

`next start` (local)

### Additional context

cc @eps1lon, since #95378 asked to be pinged if the new behavior is undesired, and #89903 mentioned waiting for
somebody to complain about it.

A related case, with or without `cacheComponents`: a link in a shared layout (e.g. the footer) survives the
navigation, so it keeps focus while the page scrolls to the top. The focused link ends up about 1200px below the top
of the viewport, and the next Tab goes to the next footer link and scrolls back down. After a hard navigation, the
next Tab starts at the top. The repro covers this too (the "footer link" rows in `out-*.md`).

Keeping focus is right for some links that stay mounted, e.g. tabs in a shared layout that switch between sibling
routes with `scroll={false}`, so resetting focus unconditionally would not be right either. But the app has no way to
handle this itself: `onNavigate` runs before the navigation commits, and `useLinkStatus` is skipped for prefetched
routes and unmounts with the link. A per-link or global option to reset focus like a hard navigation, or the
"temporarily insert a focusable element at the start of the segment" idea from #89903, would cover both cases. The
general feature request is #49386, from before `cacheComponents` and the new scroll handler.
