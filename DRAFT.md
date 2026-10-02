**Where:** comment on https://github.com/vercel/next.js/issues/49386

---

@eps1lon, following up on #95378 ("Please file an issue and ping me if the new behavior is undesired") and on the note
in #89903 that you were waiting for somebody to complain about the new behavior. Here are two concrete cases where
focus after a soft navigation does not match a hard navigation, on 16.4.0-canary.57:

Repro: https://github.com/stefanprobst/next-soft-nav-focus-repro (a script that presses Enter on a link, then Tab, and records where focus lands, for each
`next/link` and a plain `<a>` twin as the hard-navigation baseline; same results in Chromium, Firefox and WebKit)

**1. With `cacheComponents`, Tab after a soft navigation skips the whole new page.** The activated link is in the
previous page, which `cacheComponents` keeps in the DOM, hidden in an `<Activity>` placed *after* the new page. Focus
falls back to `<body>`, and sequential focus navigation continues from the link's position in the hidden page, so the
next Tab lands in the footer:

| content link → `/a` | focus after Tab |
| --- | --- |
| hard (`<a>`) | first link in the header |
| soft, default config | first link in the new page |
| soft, `cacheComponents: true` | **first link in the footer** |

This one seems like a regression with `cacheComponents` rather than a missing feature, and I'm happy to file it
separately.

**2. A link in a shared layout keeps focus while the page scrolls away from it.** Pressing Enter on a footer link
scrolls to the top, but focus stays on the footer link, now about 1200px below the top of the viewport. The next Tab goes to the next
footer link and scrolls back down; a screen reader user hears the new title (route announcer) but is still at the end
of the page. After a hard navigation, the next Tab starts at the top.

For a link that stays mounted and is meant to keep focus (status tabs in a shared layout, `scroll={false}`), staying
put is right, so I'm not suggesting moving focus unconditionally. But today the app has no hook to tell that a
navigation committed (`onNavigate` runs before it, `useLinkStatus` is skipped for prefetched routes and unmounts with
the link), so every app-level fix has to guess. A per-link or global "reset focus like a hard navigation" option, or
the "temporarily insert a focusable element at the start of the segment" idea from #89903, would cover both cases.
