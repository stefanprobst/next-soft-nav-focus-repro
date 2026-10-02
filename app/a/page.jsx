import Link from "next/link";

export const metadata = { title: "Page A" };

export default function PageA() {
	return (
		<>
			<h1>Page A</h1>
			<p>Content of page A.</p>
			<p>
				<Link href="/">First link in page A</Link>
			</p>
		</>
	);
}
