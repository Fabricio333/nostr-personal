export default function PasswordManagerWebPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <article className="prose dark:prose-invert">
        <h1>Password Manager v2</h1>
        <div className="w-full max-w-xs aspect-square flex items-center justify-center rounded-md mb-4 text-10xl">
          🔒
        </div>
        <p>Deterministic password vault with decentralized Nostr backup.</p>
        <h2>Features</h2>
        <ul>
          <li>
            Browser-based, offline-capable password manager using BIP39 seed phrases and SHA-256 for deterministic password
            generation.
          </li>
          <li>
            Optional encrypted cloud backups via the Nostr protocol using nip04, kind:1 events, and key derivation from the
            seed phrase.
          </li>
          <li>
            Local session encryption with password-based AES protection stored in localStorage.
          </li>
          <li>
            Privacy-focused and portable: works entirely offline, mobile-friendly, and avoids central storage or server
            reliance.
          </li>
        </ul>
        <p>
          <a href="https://fabricio333.github.io/PasswordManagerWeb/" target="_blank" rel="noopener noreferrer">
            Live Demo
          </a>
        </p>
        <p>
          <a href="https://github.com/Fabricio333/PasswordManagerWeb" target="_blank" rel="noopener noreferrer">
            Source Code on GitHub
          </a>
        </p>
      </article>
    </div>
  )
}
