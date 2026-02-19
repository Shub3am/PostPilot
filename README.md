# PostPilot 🚀

A powerful Chrome extension that allows you to automate and schedule social media posts across multiple platforms directly from your browser.

## What is PostPilot?

PostPilot is a browser extension designed to streamline your social media workflow. Instead of manually posting on each platform, PostPilot lets you:

- **Create posts once** - Draft content with images and hashtags in one place
- **Post to multiple platforms** - Simultaneously publish to LinkedIn, Twitter/X, and Dev.to
- **Maintain consistency** - Keep a history of all posts made through the extension
- **Save time** - Automate repetitive posting tasks across platforms

## Features

### Current Features ✅
- Multi-platform posting (LinkedIn, Twitter/X, Dev.to)
- Post drafting with title, content, tags, and images
- Post history tracking with timestamps
- Platform connection status management
- Settings panel for API tokens and method selection
- Both API and scrape-based posting methods

### Supported Platforms
- **LinkedIn** - Post to your LinkedIn feed (API or scrape method)
- **Twitter/X** - Tweet directly to your Twitter account (API or scrape method)  
- **Dev.to** - Publish articles to Dev.to (API or scrape method)

## Project Status

### Current State: Beta (v0.0.1)

**Implemented:**
- ✅ Core extension infrastructure with Manifest V3
- ✅ React-based UI with Tailwind CSS
- ✅ Draft page for creating posts
- ✅ History page for viewing posted content
- ✅ Settings page for platform configuration
- ✅ Storage system for posts and settings
- ✅ Content scripts for LinkedIn and Twitter scraping
- ✅ Background service worker for message handling

**In Progress:**
- 🔄 Image upload functionality for LinkedIn
- 🔄 API-based posting methods
- 🔄 Platform integration testing

**Planned Features:**
- 📋 Schedule posts for later
- 🔔 Notifications for successful/failed posts
- 🎨 Rich text editor with preview
- 📊 Analytics and engagement tracking
- 🔐 Enhanced security for credentials
- 🌙 Dark mode support
- 🌍 Multi-language support

## Installation

### Prerequisites
- Google Chrome or Chromium-based browser
- Node.js 18+ and npm/pnpm
- Git (for development)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/postpilot.git
   cd postpilot/extension
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or with npm
   npm install
   ```

3. **Build the extension**
   ```bash
   pnpm build
   # or with npm
   npm run build
   ```

4. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist/` folder from your project directory
   - The PostPilot extension should now appear in your Chrome toolbar

5. **Start using PostPilot**
   - Click the PostPilot icon in your Chrome toolbar
   - Visit the Settings tab to connect your platforms
   - Create your first post in the Draft tab
   - Check History to see all your posts

### Development Setup

For development with hot reload:

```bash
pnpm dev
```

This will start the Vite development server. After making changes:
1. The extension will automatically reload
2. Visit the extension popup or options page to see your changes

## Usage

### Creating Your First Post

1. Open PostPilot from the Chrome toolbar
2. Go to the **Draft** tab
3. Fill in:
   - **Title** - Your post title
   - **Content** - The main text of your post
   - **Tags** - Add relevant hashtags (will be appended to content)
   - **Image** - Upload an image (optional)
4. Select which platforms to post to
5. Click "Publish"

### Connecting Platforms

1. Go to the **Settings** tab
2. For each platform:
   - Enter your API token (if using API method) or keep blank for scraping
   - Select your preferred posting method (API or Scrape)
3. Click "Connect" to verify your connection
4. Once connected, you'll see your profile info

### Viewing Post History

1. Go to the **History** tab
2. All your posted content appears here with:
   - Post title and preview
   - Associated tags
   - Posted date and time
   - Post image (if included)

## How to Contribute

We welcome contributions from the community! Here's how you can help:

### Getting Started

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/postpilot.git
   cd postpilot/extension
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Install dependencies**
   ```bash
   pnpm install
   ```

### Development Guidelines

- **Code Style**: Follow the existing code structure and TypeScript conventions
- **Testing**: Test your changes thoroughly on actual social media platforms
- **Commits**: Use clear, descriptive commit messages
- **Pull Requests**: 
  - Provide a clear description of what you've changed
  - Reference any related issues
  - Include screenshots for UI changes
  - Ensure all code builds without errors (`pnpm build`)

### Areas for Contribution

- **Platform Support**: Add new social media platforms
- **Features**: Implement scheduling, analytics, or rich text editing
- **Bug Fixes**: Help squash bugs and improve stability
- **Documentation**: Improve README, add comments, create guides
- **Testing**: Write tests and test on different browsers/platforms
- **UI/UX**: Improve the design and user experience
- **Localization**: Add support for different languages

### Code Structure

```
src/
├── background/          # Service worker and API actions
├── components/          # Reusable React components
├── pages/              # Main UI pages (Draft, History, Settings)
├── platforms/          # Platform-specific code
│   ├── linkedin/       # LinkedIn integration
│   ├── twitter/        # Twitter/X integration
│   └── devto/          # Dev.to integration
└── utils/              # Utilities and storage helpers
```

### Testing Your Changes

1. Build the extension
   ```bash
   pnpm build
   ```

2. Load it in Chrome:
   - Navigate to `chrome://extensions/`
   - Click "Load unpacked" and select the `dist/` folder

3. Test on actual platforms:
   - Keep your platform accounts logged in
   - Test all posting paths (both API and scrape methods)
   - Verify all data is stored correctly

## Project Structure

```
extension/
├── src/
│   ├── background/           # Service worker
│   ├── components/           # React components
│   ├── pages/               # UI pages
│   ├── platforms/           # Multi-platform integrations
│   ├── utils/               # Utilities and types
│   ├── main.tsx             # React entry point
│   └── index.css             # Global styles
├── public/                   # Public assets
├── manifest.json             # Chrome extension manifest
├── package.json              # Dependencies and scripts
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **CRXJS** - Chrome extension bundler
- **Lucide React** - Icons
- **Sonner** - Toast notifications

## Known Issues & Limitations

- Image uploads currently work via paste events on LinkedIn
- Twitter scraping method requires manual interaction
- Dev.to currently requires API token for posting
- Extension works only on LinkedIn, Twitter/X, and Dev.to

## Troubleshooting

### Extension not loading?
- Make sure you're in Developer mode (`chrome://extensions/`)
- Try rebuilding: `pnpm build`
- Clear browser cache and reload the extension

### Posts not appearing?
- Verify you're connected to the platform (check Settings)
- Ensure appropriate permissions are granted
- Check the browser console for error messages

### Can't upload images?
- Some browsers have restrictions on clipboard access
- Try refreshing the platform page before posting

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- 💬 GitHub Issues: [Report bugs and request features](https://github.com/shub3am/postpilot/issues)
- 🐦 Twitter: [@Shubh3m]

## Acknowledgments

- Built with React, TypeScript, and Vite
- Icons from Lucide React
- Notifications powered by Sonner
- Styling with Tailwind CSS

---

Made with ❤️ by the PostPilot team
