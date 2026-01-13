# Restricted Parts Tracker Dashboard

Admin Dashboard UI crafted with Shadcn and Vite. Built with responsiveness and accessibility in mind.

![alt text](public/images/Restricted Parts Tracker.png)

[![Sponsored by Clerk](https://img.shields.io/badge/Sponsored%20by-Clerk-5b6ee1?logo=clerk)](https://go.clerk.com/GttUAaK)

I've been creating dashboard UIs at work and for my personal projects. I always wanted to make a reusable collection of dashboard UI for future projects; and here it is now. While I've created a few custom components, some of the code is directly adapted from ShadcnUI examples.

> This is not a starter project (template) though. I'll probably make one in the future.

## Features

- Light/dark mode
- Responsive
- Accessible
- With built-in Sidebar component
- Global search command
- 10+ pages
- Extra custom components
- RTL support

<details>
<summary>Customized Components (click to expand)</summary>

This project uses Shadcn UI components, but some have been slightly modified for better RTL (Right-to-Left) support and other improvements. These customized components differ from the original Shadcn UI versions.

If you want to update components using the Shadcn CLI (e.g., `npx shadcn@latest add <component>`), it's generally safe for non-customized components. For the listed customized ones, you may need to manually merge changes to preserve the project's modifications and avoid overwriting RTL support or other updates.

> If you don't require RTL support, you can safely update the 'RTL Updated Components' via the Shadcn CLI, as these changes are primarily for RTL compatibility. The 'Modified Components' may have other customizations to consider.

### Modified Components

- scroll-area
- sonner
- separator

### RTL Updated Components

- alert-dialog
- calendar
- command
- dialog
- dropdown-menu
- select
- table
- sheet
- sidebar
- switch

**Notes:**

- **Modified Components**: These have general updates, potentially including RTL adjustments.
- **RTL Updated Components**: These have specific changes for RTL language support (e.g., layout, positioning).
- For implementation details, check the source files in `src/components/ui/`.
- All other Shadcn UI components in the project are standard and can be safely updated via the CLI.

</details>

## Tech Stack

**UI:** [ShadcnUI](https://ui.shadcn.com) (TailwindCSS + RadixUI)

**Build Tool:** [Vite](https://vitejs.dev/)

**Routing:** [TanStack Router](https://tanstack.com/router/latest)

**Type Checking:** [TypeScript](https://www.typescriptlang.org/)

**Linting/Formatting:** [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/)

**Icons:** [Lucide Icons](https://lucide.dev/icons/), [Tabler Icons](https://tabler.io/icons) (Brand icons only)

**Auth (partial):** [Clerk](https://go.clerk.com/GttUAaK)

## Run Locally

Clone the project

```bash
  git clone https://github.com/satnaing/Restricted Parts Tracker.git
```

Go to the project directory

```bash
  cd Restricted Parts Tracker
```

Install dependencies

```bash
  pnpm install
```

### Environment Configuration

Create a `.env` file in the root directory based on `.env.example`:

```bash
  cp .env.example .env
```

Configure the following environment variables:

**VITE_API_URL** - The API endpoint URL for the backend
```env
VITE_API_URL=https://audi-api.ppg.dev.quasidea.com
```

**VITE_BRAND** - The brand configuration (affects colors, logos, banners, and branding text)

Valid values:
- `audi` - Audi America
- `audica` - Audi Canada  
- `vw` - Volkswagen America
- `vwca` - Volkswagen Canada

```env
VITE_BRAND=audi
```

Start the server

```bash
  pnpm run dev
```

## Building for Production

When building for different brands or environments, make sure to:

1. Update your `.env` file with the correct `VITE_API_URL` and `VITE_BRAND` values
2. Build the application: `pnpm run build`
3. The build will use the environment variables from your `.env` file

Example for building different brand versions:

```bash
# Build for Audi America
echo "VITE_API_URL=https://audi-api.ppg.dev.quasidea.com" > .env
echo "VITE_BRAND=audi" >> .env
pnpm run build

# Build for VW Canada
echo "VITE_API_URL=https://vw-api.ppg.dev.quasidea.com" > .env
echo "VITE_BRAND=vwca" >> .env
pnpm run build
```


## Sponsoring this project ❤️

If you find this project helpful or use this in your own work, consider [sponsoring me](https://github.com/sponsors/satnaing) to support development and maintenance. You can [buy me a coffee](https://buymeacoffee.com/satnaing) as well. Don’t worry, every penny helps. Thank you! 🙏

For questions or sponsorship inquiries, feel free to reach out at [satnaingdev@gmail.com](mailto:satnaingdev@gmail.com).

### Current Sponsor

- [Clerk](https://go.clerk.com/GttUAaK) - authentication and user management for the modern web

## Author

Crafted with 🤍 by [@satnaing](https://github.com/satnaing)

## License

Licensed under the [MIT License](https://choosealicense.com/licenses/mit/)
