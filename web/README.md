# Homebrew Gandalf - Door Control Frontend

This is the frontend web application for the Homebrew Gandalf door access control system.

## Features

- Secure password-based authentication
- Door control interface with visual feedback
- Interactive animations and sound effects
- Coffee-inspired Homebrew Computer Club design
- Mobile-responsive layout

## Technology Stack

- [Next.js](https://nextjs.org/) - React framework with server-side rendering
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [JWT](https://jwt.io/) - JSON Web Tokens for secure authentication

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

1. Clone the repository
2. Navigate to the web directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env.local` file with your environment variables (see `.env.example` for reference)
5. Start the development server:

```bash
npm run dev
```

## API Configuration

The application connects to an ESP32-based door controller. Update the following environment variables in your `.env.local` file:

```
NEXT_PUBLIC_API_URL="http://your-controller-ip"
NEXT_PUBLIC_API_KEY="your-api-key"
```

## Authentication

The system uses a predetermined password stored in environment variables. To change the password, update the `ADMIN_PASSWORD` in your `.env.local` file.

## License

This project is licensed under the MIT License.
