# Personal Blog Website

This is a personal blog website built with Next.js, Tailwind CSS, and Shadcn UI. It integrates with the Nostr protocol to fetch and display blog posts and profile information.

## Features

-   **Nostr Integration**: Fetches blog posts (NIP-23 long-form content and NIP-01 notes) and profile data directly from Nostr relays.
-   **Responsive Design**: Optimized for various screen sizes, from mobile to desktop.
-   **Theme Toggle**: Switch between light and dark modes.
-   **Blog Section**: Displays a list of posts with search and filtering capabilities.
-   **Profile Page**: Shows user's Nostr profile information.
-   **Portfolio Section**: Showcase your projects.
-   **Resume Section**: Display your professional resume.
-   **Settings Page**: Configure Nostr public key and other preferences.
-   **Lifestyle Tracking**: (Planned/Partial) Sections for workouts, nutrition, biohacks, and routines.

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
    Navigate to the `/settings` page and enter your Nostr public key (npub1...). This is crucial for the blog to fetch your content.

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

## Contributing

Feel free to open issues or pull requests if you have suggestions or improvements.
