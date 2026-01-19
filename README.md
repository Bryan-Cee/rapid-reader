# RapidReader

RapidReader is a focused reading tool built around the RSVP (Rapid Serial Visual Presentation) technique. It helps you consume text and PDFs faster and with less eye strain by showing one word at a time in a fixed position, while keeping your place and progress for you.

## Why use RapidReader?

- **Read faster with less effort** – By presenting one word at a time in the same spot, RapidReader reduces eye movements (saccades) and re-fixations, letting you read at higher words‑per‑minute (WPM) without manually "pushing" yourself.
- **Stay locked on the important part of each word** – The app highlights a pivot letter (the ORP – Optimal Recognition Point) so your eyes know exactly where to focus on every word.
- **Maintain context, not just speed** – A soft context preview shows the words around the current one, helping comprehension so it doesn’t feel like “flash cards.”
- **Comfortable for long sessions** – Multiple themes (light, dark, sepia) and a clean, distraction‑free layout are designed to reduce fatigue.
- **Bring your own content** – Save text snippets to your library or upload PDFs; RapidReader remembers your position so you can pick up where you left off.

## What is the RSVP method?

RSVP stands for **Rapid Serial Visual Presentation**. Instead of reading lines of text across a page, you see a single word (or very small chunk) at a time in the **same location on the screen**.

Key ideas behind RSVP:

- **Single fixed focus point** – Because the word appears in one place, you don’t scan left‑to‑right across lines. This cuts down on eye movement overhead.
- **Optimal Recognition Point (ORP)** – Every word has a character that is most efficient for recognition. In RapidReader, this pivot letter is centered and emphasized, with the letters before and after spaced around it. Your eyes quickly learn to lock onto this pivot.
- **Adjustable speed** – Reading speed is controlled by WPM. RapidReader uses a timer to advance words automatically, so you can find a pace that feels natural and gradually increase it.
- **Optional context** – Pure RSVP can feel disorienting. RapidReader adds a short, dimmed context snippet around the current word so you still see the surrounding sentence.

In practice, this means you press play, fix your gaze near the center of the reader, and let the words stream by. The combination of ORP highlighting, fixed position, and adjustable WPM aims to increase reading speed while preserving comprehension and comfort.

## Development

### Prerequisites

- Node.js 20 or higher
- npm

### Setup

```bash
# Install dependencies
npm install

# Configure analytics (optional)
cp .env.example .env
# Edit .env and add your Umami website ID

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Analytics Configuration

RapidReader uses [Umami](https://umami.is) for privacy-focused analytics tracking via cloud.umami.is.

To enable analytics:

1. Sign up at [cloud.umami.is](https://cloud.umami.is)
2. Create a new website in your Umami dashboard
3. Copy your website ID
4. Create a `.env` file in the project root (or copy from `.env.example`):
   ```bash
   VITE_UMAMI_WEBSITE_ID=your-website-id-here
   ```
5. The analytics script will automatically be included when you build the app

**Note:** Analytics tracking is optional. The app works perfectly without it. If no website ID is configured, the script tag will be present but won't track any data.

## Deployment

This app is configured to deploy to GitHub Pages automatically.

### Automatic Deployment

The app automatically deploys to GitHub Pages when changes are pushed to the `main` branch via GitHub Actions.

**Prerequisites:**
1. Go to your repository Settings → Pages
2. Set Source to "GitHub Actions"

The workflow will:
- Build the app using Vite
- Deploy to GitHub Pages
- Make the app available at `https://bryan-cee.github.io/rapid-reader/`

### Manual Deployment

To build the app manually:

```bash
npm run deploy
```

This will create an optimized production build in the `dist` directory with the correct base path for GitHub Pages.
