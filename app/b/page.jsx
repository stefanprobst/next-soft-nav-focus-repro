import Link from "next/link";

export const metadata = { title: "Page B" };

export default function PageB() {
	return (
		<>
			<h1>Page B</h1>
			<p>Content of page B.</p>
			<p>
				<Link href="/">First link in page B</Link>
			</p>
		</>
	);
}
