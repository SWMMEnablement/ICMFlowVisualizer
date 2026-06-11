# ICM Ruby Workflow (ICM Flow Visualizer)

> README added by Robert Dickinson via Comet.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![Ruby](https://img.shields.io/badge/Ruby-CC342D?logo=ruby&logoColor=white)

## About

**ICM Ruby Workflow** (repository `ICMFlowVisualizer`) is an interactive analyzer for Ruby code workflows in Innovyze / Autodesk **ICM InfoWorks**. It parses Ruby files to extract code structure, generates detailed ASCII diagrams, and provides AI-powered analysis. It helps engineers quickly understand complex Ruby automation scripts used for batch import workflows, data processing, and system integration by visualizing code execution flow, identifying key methods and API calls, and automatically generating explanations.

The application serves as both a code analysis tool and a documentation tool, combining static Ruby parsing with AI-powered insights so engineers can comprehend ICM InfoWorks automation scripts.

This project is part of the SWMMEnablement collection.

## What's Inside

| Area | Description |
| --- | --- |
| `client/` | React + TypeScript frontend for uploading Ruby files and viewing diagrams and analysis |
| `server/` | Express backend handling parsing, diagram generation, and AI analysis |
| `shared/` | Types and schema shared between client and server |
| `public/reference/` | Ruby API help documentation and reference material |
| `attached_assets/` | Supporting assets including folder-upload handling |
| `design_guidelines.md` | UI and visual design guidelines for the app |

## Key Features

- Parses Ruby files to extract code structure and execution flow
- Generates detailed ASCII diagrams of script logic
- AI-powered analysis and automatic explanation of scripts
- Identifies key methods and ICM InfoWorks API calls
- Folder upload support and Markdown generation from Ruby files
- Bundled Ruby API help documentation

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Express
- **Database/ORM:** Drizzle (see `drizzle.config.ts`)
- **Domain:** Ruby static analysis for ICM InfoWorks workflows

## Getting Started

```bash
# Clone the repository
git clone https://github.com/SWMMEnablement/ICMFlowVisualizer.git
cd ICMFlowVisualizer

# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open the local URL printed by Vite in your browser.

```bash
# Build for production
npm run build
```

## License

See the repository for license details.
