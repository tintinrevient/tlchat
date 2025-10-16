import { useRef, useState } from 'react'
import { Tldraw, createShapeId } from 'tldraw'
import 'tldraw/tldraw.css'
import LLMChat from './components/LLMChat'

// Custom toolbar component that adds robot button next to the toolbar
function CustomToolbar() {
	const [isLLMChatOpen, setIsLLMChatOpen] = useState(false)

	return (
		<>
			<div style={{
				position: 'absolute',
				bottom: '7px',
				right: 434,
				zIndex: 999,
			}}>
				<div
					onClick={() => setIsLLMChatOpen(!isLLMChatOpen)}
					title="AI Assistant"
					style={{
						width: '48px',
						height: '48px',
						backgroundColor: isLLMChatOpen ? '#e3f2fd' : 'white',
						border: '1px solid #e0e0e0',
						borderRadius: '11px',
						cursor: 'pointer',
						fontSize: '24px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						transition: 'all 0.2s',
						boxShadow: '1px 2px 1px rgba(0,0,0,0.2)',
					}}
					onMouseEnter={(e) => {
						e.target.style.backgroundColor = isLLMChatOpen ? '#e3f2fd' : '#f5f5f5'
						e.target.style.transform = 'scale(1.05)'
					}}
					onMouseLeave={(e) => {
						e.target.style.backgroundColor = isLLMChatOpen ? '#e3f2fd' : 'white'
						e.target.style.transform = 'scale(1)'
					}}
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#333" width="24" height="24">
						<path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
					</svg>

				</div>
			</div>
			{isLLMChatOpen && <LLMChatWrapper />}
		</>
	)
}

// Wrapper component to pass editor ref
function LLMChatWrapper() {
	return <LLMChat onResponse={(response) => {
		// Response handling will be done in the main App
		window.handleLLMResponse?.(response)
	}} />
}

export default function App() {
	const editorRef = useRef(null)

	const handleLLMResponse = (response) => {
		if (editorRef.current) {
			const editor = editorRef.current

			// Split response into paragraphs
			const paragraphs = response
				.split(/\n\n+/)
				.map(p => p.trim())
				.filter(p => p.length > 0)

			// Get viewport center
			const viewport = editor.getViewportPageBounds()

			// Calculate grid dimensions
			const noteWidth = 300
			const noteHeight = 200
			const spacing = 40 // Space between notes
			const cols = 3 // Number of columns

			// Calculate starting position to center the grid
			const totalWidth = cols * noteWidth + (cols - 1) * spacing
			const startX = viewport.x + (viewport.w - totalWidth) / 2
			const startY = viewport.y + 100 // Start from top with some margin

			// Create a post-it note for each paragraph
			const shapes = paragraphs.map((paragraph, index) => {
				const shapeId = createShapeId()

				// Arrange post-its in a grid pattern
				const row = Math.floor(index / cols)
				const col = index % cols
				const x = startX + col * (noteWidth + spacing)
				const y = startY + row * (noteHeight + spacing)

				return {
					id: shapeId,
					type: 'geo',
					x: x,
					y: y,
					props: {
						geo: 'rectangle',
						w: noteWidth,
						h: noteHeight,
						color: 'yellow',
						fill: 'solid',
						text: paragraph,
						size: 's',
					},
				}
			})

			// Add all shapes to the editor
			editor.createShapes(shapes)

			// Zoom to fit all new shapes
			editor.zoomToSelection()
		}
	}

	// Set up global handler for LLMChatWrapper
	if (typeof window !== 'undefined') {
		window.handleLLMResponse = handleLLMResponse
	}

	return (
		<div style={{ position: 'fixed', inset: 0 }}>
			<Tldraw
				onMount={(editor) => {
					editorRef.current = editor
				}}
			/>
			<CustomToolbar />
		</div>
	)
}