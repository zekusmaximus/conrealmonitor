## Devvit React Starter

A starter to build web applications on Reddit's developer platform

- [Devvit](https://developers.reddit.com/): A way to build and deploy immersive games on Reddit
- [Vite](https://vite.dev/): For compiling the webView
- [React](https://react.dev/): For UI
- [Express](https://expressjs.com/): For backend logic
- [Tailwind](https://tailwindcss.com/): For styles
- [Typescript](https://www.typescriptlang.org/): For type safety

## Getting Started

> Make sure you have Node 22 downloaded on your machine before running!

1. Run `npm create devvit@latest --template=react`
2. Go through the installation wizard. You will need to create a Reddit account and connect it to Reddit developers
3. Copy the command on the success page into your terminal

## Commands

- `npm run dev`: Starts a development server where you can develop your application live on Reddit.
- `npm run build`: Builds your client and server projects
- `npm run deploy`: Uploads a new version of your app
- `npm run launch`: Publishes your app for review
- `npm run login`: Logs your CLI into Reddit
- `npm run check`: Type checks, lints, and prettifies your app

## Known Issues

- **Tracking Resources Blocked**: Some users may experience `ERR_BLOCKED_BY_CLIENT` errors for tracking resources due to ad blockers or privacy extensions. This is from Reddit's platform and does not affect app functionality.
- **Sentry Rate Limiting**: If errors occur frequently, Sentry may return 429 errors. The app includes retry logic to handle this.
- **Devvit Gateway Errors**: Occasional 400 errors from the Devvit gateway may occur due to network issues or server load.

## Architecture

This project follows a modular architecture with three main components:

- **Client**: React-based frontend built with Vite, using Tailwind CSS for styling. Handles user interactions and displays data visualizations.
- **Server**: Express.js backend that processes API requests, manages data, and serves the client build.
- **Shared**: Common TypeScript types and utilities shared between client and server for type safety and consistency.

The architecture supports Reddit's Devvit platform, allowing seamless integration with Reddit's ecosystem.

## File Structure

```
src/
├── client/          # React frontend
│   ├── components/  # Reusable UI components
│   ├── hooks/       # Custom React hooks
│   ├── styles/      # CSS and styling files
│   ├── public/      # Static assets
│   └── vite.config.ts
├── server/          # Express backend
│   ├── core/        # Core business logic
│   ├── __tests__/   # Server-side tests
│   └── vite.config.ts
└── shared/          # Shared types and utilities
    └── types/       # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and ensure tests pass: `npm run check`
4. Commit your changes: `git commit -am 'Add some feature'`
5. Push to the branch: `git push origin feature/your-feature-name`
6. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices and maintain type safety
- Write tests for new features
- Ensure code passes linting and formatting checks
- Update documentation for any API changes
- Use conventional commit messages

## Cursor Integration

This template comes with a pre-configured cursor environment. To get started, [download cursor](https://www.cursor.com/downloads) and enable the `devvit-mcp` when prompted.
