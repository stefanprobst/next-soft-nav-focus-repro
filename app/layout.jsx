import Link from "next/link";

export const metadata = { title: { template: "%s | Repro", default: "Repro" } };

/** Header and footer are in the root layout, so their links survive every navigation. */
export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body style={{ fontFamily: "sans-serif", margin: "0 1rem" }}>
				<header>
					<nav aria-label="Header">
						<Link href="/">Header: Home</Link> · <Link href="/a">Header: A</Link> · <Link href="/b">Header: B</Link>
					</nav>
				</header>
				<main>{children}</main>
				<footer style={{ marginBlockStart: "150vh" }}>
					<nav aria-label="Footer">
						<Link href="/a">Footer: A</Link> · <Link href="/b">Footer: B</Link> · <a href="/a">Footer: A (hard)</a> ·{" "}
						<a href="/b">Footer: B (hard)</a>
					</nav>
				</footer>
			</body>
		</html>
	);
}
