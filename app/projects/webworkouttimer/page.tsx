export default function WebWorkOutTimerPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <article className="prose dark:prose-invert">
        <h1>Web WorkOut Timer</h1>
        <div className="w-full max-w-xs aspect-square flex items-center justify-center rounded-md mb-4 text-9xl">
          🏋️
        </div>
        <p>
          Web-based workout timer that lets you configure exercise and rest intervals
          directly in the browser.
        </p>
        <h2>Responsibilities</h2>
        <ul>
          <li>Designed intuitive controls for setting workout and rest durations.</li>
          <li>Implemented start, pause, and reset functionality with audio alerts.</li>
        </ul>
        <p>
          <a href="https://fabricio333.github.io/WebWorkOutTimer/" target="_blank" rel="noopener noreferrer">
            Live Demo
          </a>
        </p>
        <p>
          <a href="https://github.com/fabricio333/WebWorkOutTimer" target="_blank" rel="noopener noreferrer">
            Source Code on GitHub
          </a>
        </p>
      </article>
    </div>
  )
}
