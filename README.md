# SolidStart

Everything you need to build a Solid project, powered by [`solid-start`](https://start.solidjs.com);

## Creating a project

```bash
# create a new project in the current directory
npm init solid@latest

# create a new project in my-app
npm init solid@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

Solid apps are built with _presets_, which optimise your project for deployment to different environments.

By default, `npm run build` will generate a Node app that you can run with `npm start`. To use a different preset, add it to the `devDependencies` in `package.json` and specify in your `app.config.js`.

## This project was created with the [Solid CLI](https://github.com/solidjs-community/solid-cli)

----------------------------------------------

## Yllure - Elegant Dress Rental Platform
A modern, full-stack dress rental application built with SolidStart, featuring server-side rendering, optimistic updates, and a seamless user experience.

# Features

- Elegant Design - Beautiful, responsive interface for browsing dress collections
- Wishlist System - Add/remove dresses with real-time updates across all pages
- User Authentication - Secure login and user management
-  Responsive Design - Works perfectly on desktop, tablet, and mobile
- Server-Side Rendering - Fast initial page loads and SEO-friendly
- Optimistic Updates - Immediate UI feedback with automatic error handling
- Progressive Enhancement - Works without JavaScript enabled

# Tech Stack

- Frontend: SolidJS with SolidStart
- Backend: Server actions with "use server"
- Database: SQLite with Prisma ORM
- Styling: TailwindCSS
- Authentication: Session-based auth
- Forms: Progressive enhancement with form actions

# Demo Creds
- username: demo@example.com
- password: password123

## Installation
# Clone the repository
git clone <repository-url>
cd dress-rental

# Install dependencies
npm install

# Set up the database
npx prisma generate
npx prisma db push

# Seed the database (optional)
npx prisma db seed

# Start development server
npm run dev

## Application Pages

Homepage (/) - Hero section with featured dresses
Catalog (/catalog) - Browse all available dresses with filtering
Wishlist (/wishlist) - Manage saved dresses (requires login)
Authentication (/login, /register) - User registration and login

## Development
# Available Scripts

# Development
npm run dev          # Start development server
npm run dev:open     # Start dev server and open browser

# Building
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma studio    # Open database browser
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes

# .env file
Create a .env file in the environment 

DATABASE_URL="file:./dev.db"
SESSION_SECRET="your-session-secret-here"

## Why Manual State Management?
I initially tried SolidJS's createAsyncStore (following standard patterns) but encountered cache invalidation issues with:

- Multiple pages sharing wishlist state
- User-specific data dependencies
- Cross-page navigation expectations

# My manual approach using createSignal + createEffect provides:

- Predictable data flow
- Explicit control over updates
- Reliable cross-page synchronization
- Better debugging capabilities

# Form Actions vs onClick
We use form actions instead of onClick handlers for:

- Progressive enhancement (works without JS)
- Better accessibility
- Automatic form handling
- Built-in SolidJS optimizations