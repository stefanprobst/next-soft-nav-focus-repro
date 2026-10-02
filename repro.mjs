// Starts `next start`, then activates links with the keyboard and records where focus is after the navigation and
// after the next Tab, for a soft navigation (`next/link`) and the same link as a plain `<a>` (hard navigation).
// Set `CACHE_COMPONENTS=1` for both `pnpm build` and this script to compare with `cacheComponents: true`: `next start`
// re-reads `next.config.mjs`.

import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { chromium, firefox, webkit } from "playwright";

const port = 3200;
const base = `http://localhost:${port}`;

const scenarios = [
	{ name: "content link, soft", from: "/", link: "Content: A", to: "/a" },
	{ name: "content link, hard", from: "/", link: "Content: A (hard)", to: "/a" },
	{ name: "footer link, soft", from: "/a", link: "Footer: B", to: "/b" },
	{ name: "footer link, hard", from: "/a", link: "Footer: B (hard)", to: "/b" },
];

const server = spawn("node_modules/.bin/next", ["start", "-p", String(port)], { stdio: "ignore" });

try {
	await waitForServer();

	for (const browserType of [chromium, firefox, webkit]) {
		const browser = await browserType.launch();
		console.log(`\n## ${browserType.name()} ${browser.version()}\n`);
		console.log("| scenario | focus after navigation | in viewport | focus after Tab | `<h1>`s in the DOM |");
		console.log("| --- | --- | --- | --- | --- |");

		for (const scenario of scenarios) {
			const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
			await page.goto(base + scenario.from);
			const link = page.getByRole("link", { name: scenario.link, exact: true });
			await link.focus();
			await page.keyboard.press("Enter");
			await page.waitForURL(base + scenario.to);
			await page.getByRole("heading", { level: 1, name: `Page ${scenario.to.slice(1).toUpperCase()}` }).waitFor();
			await sleep(500);
			const after = await describeFocus(page);
			const headings = await describeHeadings(page);
			await page.keyboard.press("Tab");
			const afterTab = await describeFocus(page);
			console.log(`| ${scenario.name} | ${after.focus} | ${after.inViewport} | ${afterTab.focus} | ${headings} |`);
			await page.close();
		}

		await browser.close();
	}
} finally {
	server.kill();
}

/** The focused element, and whether it is within the viewport. */
function describeFocus(page) {
	return page.evaluate(() => {
		const element = document.activeElement;
		if (element == null || element === document.body) return { focus: "`<body>`", inViewport: "-" };
		const rect = element.getBoundingClientRect();
		return {
			focus: `link "${element.textContent.trim()}"`,
			inViewport: rect.bottom > 0 && rect.top < innerHeight ? "yes" : `no (top ${Math.round(rect.top)}px)`,
		};
	});
}

/** Every `<h1>` in document order, marked when hidden: with `cacheComponents`, the previous page is kept in the DOM. */
function describeHeadings(page) {
	return page.evaluate(() =>
		[...document.querySelectorAll("h1")]
			.map((heading) => (heading.checkVisibility() ? heading.textContent : `${heading.textContent} (hidden)`))
			.join(", "),
	);
}

async function waitForServer() {
	for (let attempt = 0; attempt < 60; attempt++) {
		try {
			await fetch(base);
			return;
		} catch {
			await sleep(500);
		}
	}
	throw new Error("next start did not come up");
}
