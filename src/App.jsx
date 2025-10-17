import { useRef, useState } from 'react'
import { Tldraw, createShapeId } from 'tldraw'
import 'tldraw/tldraw.css'
import LLMChat from './components/LLMChat'

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
		window.handleLLMResponse?.(response)
	}} />
}

export default function App() {
	const editorRef = useRef(null)
	const colorIndexRef = useRef(0) // Track which color to use for next generation
	const generationOffsetRef = useRef(0) // Track offset for each generation

	const handleLLMResponse = (response) => {
		if (editorRef.current) {
			const editor = editorRef.current

			// Get viewport center
			const viewport = editor.getViewportPageBounds()

			// Define color rotation
			const colors = ['yellow', 'light-blue', 'light-green', 'light-violet', 'orange', 'light-red']
			const currentColor = colors[colorIndexRef.current % colors.length]
			colorIndexRef.current += 1 // Move to next color for next generation

			// Calculate grid dimensions
			// Note: tldraw note shapes have a default size of ~200x200 for 's' size
			const noteWidth = 200
			const spacing = 60
			const cols = 3 // Number of columns

			// Calculate starting position with offset for each generation
			// This prevents notes from stacking on top of each other
			const totalWidth = cols * noteWidth + (cols - 1) * spacing
			const offsetX = (generationOffsetRef.current % 3) * 250
			const offsetY = Math.floor(generationOffsetRef.current / 3) * 300 // Offset after 3 generations
			const startX = viewport.x + (viewport.w - totalWidth) / 2 + offsetX
			const startY = viewport.y + 100 + offsetY
			generationOffsetRef.current += 1

			const shape = {
				id: createShapeId(),
				type: 'note',
				x: startX,
				y: startY,
				props: {
					color: currentColor,
					text: response,
					size: 's',
					font: 'mono',
				},
			}

			editor.createShapes([shape])
			editor.zoomToSelection()
		}
	}

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