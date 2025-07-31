import Image from "next/image"

export default function WeAreBitcoinPage() {
  return (
    <article className="container mx-auto px-4 py-8 prose dark:prose-invert">
      <h1>WeAreBitcoin.org</h1>
      <Image
        src="/wab.png"
        alt="WeAreBitcoin.org"
        width={400}
        height={400}
        className="rounded-md mb-4"
      />
      <p>
        Content Writer and Developer at WeAreBitcoin.org, a Bitcoin education platform focused on self-custody and sound money principles.
      </p>
      <h2>Responsibilities</h2>
      <ul>
        <li>Write, translate, and localize articles on Bitcoin, Austrian economics, and self-sovereignty.</li>
        <li>Format and publish posts using Markdown and a Next.js-based CMS.</li>
        <li>Design and test interactive tools such as onboarding wizards and DCA calculators.</li>
        <li>Optimize content for SEO and clarity with strategic headlines and metadata.</li>
        <li>Collaborate on visual layouts and UX to enhance engagement and learning.</li>
      </ul>
      <p>This is a test article for the project page.</p>
    </article>
  )
}
