# Personal Blog Website

This is a personal blog website built with Next.js, Tailwind CSS, and Shadcn UI. It integrates with the Nostr protocol to fetch and display blog posts and profile information.

## Features

- **Nostr Integration** – Fetches NIP‑23 long‑form articles and NIP‑01 notes from the relays listed in `settings.json`. Posts are cached to `public/<locale>/nostr` so they can be served as static pages for search engines. Profile information and the profile picture are pulled from Nostr and cached locally for metadata.
- **Blog** – Lists your posts with search and type filters. Each post has its own page with Markdown rendering and optional tags.
- **Digital Garden** – Markdown notes in `digital-garden/` are rendered with `[[wikilink]]` style linking between pages.
- **Lifestyle Page** – Shows posts tagged `#lifestyle` from Nostr alongside configurable lists of workouts, nutrition, biohacks and routines.
- **Contact Form** – Sends an encrypted direct message via Nostr to the owner npub.
- **Portfolio & Resume** – Dedicated pages to showcase projects and display a résumé/CV.
- **Settings Pages** – UI for editing site options and Nostr relay settings which are saved to `settings.json`.
- **Theme Toggle & Responsive Design** – Light/dark mode support and layouts that work on mobile or desktop.
- **SEO** – Generates `sitemap.xml` and `robots.txt` with links to your Nostr posts so they can be indexed by search engines. Set the `NEXT_PUBLIC_SITE_URL` environment variable (required) so generated links point to your domain.

## Getting Started

1.  **Clone the repository**:
    \`\`\`bash
    git clone https://github.com/your-username/your-blog.git
    cd your-blog
    \`\`\`
2.  **Install dependencies**:
    \`\`\`bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    \`\`\`
3.  **Run the development server**:
    \`\`\`bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    \`\`\`
    Open [http://localhost:3000](http://localhost:3000) in your browser.

4.  **Configure your Nostr npub**:
    Edit the `settings.json` file in the project root and add your Nostr public key (`npub1...`). This is crucial for the blog to fetch your content.

## Project Structure

-   `app/`: Next.js App Router pages and layouts.
-   `components/`: Reusable React components, including Shadcn UI components.
-   `lib/`: Utility functions and Nostr integration logic.
-   `public/`: Static assets like images.
-   `styles/`: Global CSS.

## Customization

-   **Styling**: Modify `app/globals.css` and `tailwind.config.ts` for theme and custom styles.
-   **Nostr Relays**: Adjust the list of relays in `lib/nostr.ts` to connect to your preferred Nostr relays.
-   **Content**: Your blog content is fetched directly from your Nostr public key. Publish NIP-23 long-form events or NIP-01 notes to your configured relays.
-   **SEO Settings**: Set the `NEXT_PUBLIC_SITE_URL` environment variable (required) so generated links in the sitemap and metadata point to your domain.

## Contributing

Feel free to open issues or pull requests if you have suggestions or improvements. 

Thanks.
