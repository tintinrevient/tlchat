# tlchat

An interactive canvas-based chat application that combines tldraw's infinite canvas with a local LLM assistant. Ask questions and watch as AI-generated responses appear as colorful sticky notes arranged on the canvas.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and click the chat icon (💬) in the bottom-right corner
4. Click "Load Model" to initialize the local LLM (this may take a few moments)
5. Ask a question and watch as sticky notes appear on the canvas!

## How It Works

- The app uses a local AI model that runs entirely in your browser via WebGPU
- Responses are split into paragraphs and displayed as tldraw "note" shapes
- Each new question uses a different color and starting position
- Notes are automatically spaced based on their text length to prevent overlapping

## Deploy

Deploy to GitHub Pages:
```bash
npm run deploy
```
