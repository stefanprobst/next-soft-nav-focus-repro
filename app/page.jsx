import Link from "next/link";

export const metadata = { title: "Home" };

/** The page's links are removed with the page on navigation. */
export default function Home() {
	return (
		<>
			<h1>Home</h1>
			<ul>
				<li>
					<Link href="/a">Content: A</Link>
				</li>
				<li>
					<a href="/a">Content: A (hard)</a>
				</li>
			</ul>
		</>
	);
}
