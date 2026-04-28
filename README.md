# Stackme Desktop

A beautiful desktop application for Stackme - the memory layer for AI applications. Built with Tauri (Rust + React).

## Features

- **Memory Dashboard**: View all stored facts, knowledge graph, and session history
- **Add Memory**: Simple forms to add facts and messages with auto-extraction
- **Chat Interface**: Chat with AI using your stored memory context
- **Settings**: Configure embedding model and clear memory options

## Prerequisites

- Python 3.9+ with stackme installed: `pip install stackme`
- Node.js 18+
- Rust 1.70+
- For building icons: Pillow (Python) `pip install Pillow`

## Quick Start

### 1. Install dependencies

```bash
cd stackme-desktop
npm install
```

### 2. Run in development mode

```bash
# Terminal 1: Start the Python API server
python -m stackme.server --port 8000

# Terminal 2: Start the Tauri dev server
npm run tauri dev
```

Or simply run:

```bash
npm run tauri dev
```

The app will automatically start the Python server.

### 3. Build for production

```bash
npm run tauri build
```

The built application will be in `src-tauri/target/release/`.

## Project Structure

```
stackme-desktop/
├── src/                    # React frontend
│   ├── app/
│   │   ├── page.tsx       # Main app with all components
│   │   ├── layout.tsx     # Layout wrapper
│   │   └── globals.css    # Global styles (dark theme)
│   └── components/        # Additional components
├── src-tauri/             # Tauri/Rust backend
│   ├── src/
│   │   ├── lib.rs        # Tauri commands for stackme API
│   │   └── main.rs       # App entry point
│   ├── Cargo.toml        # Rust dependencies
│   ├── tauri.conf.json   # Tauri configuration
│   └── icons/            # App icons
├── package.json          # Node.js dependencies
└── README.md             # This file
```

## How It Works

1. **Backend**: The Rust backend communicates with the stackme Python library via HTTP API (starts the Python server internally)
2. **Frontend**: React/Next.js provides a modern dark-themed UI
3. **Integration**: Tauri commands bridge the frontend and backend

## UI Theme

The app features a beautiful dark theme inspired by GitHub's dark mode:
- Primary background: `#0d1117`
- Card background: `#1c2128`
- Accent blue: `#58a6ff`
- Accent green: `#3fb950`
- Accent purple: `#a371f7`

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Tauri 2.0, Rust
- **Memory**: Stackme Python library
- **Icons**: Lucide React

## License

Apache 2.0