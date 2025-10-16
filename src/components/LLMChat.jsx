import { useState, useEffect, useRef } from 'react';
import Worker from '../worker.js?worker';

const LLMChat = ({ onResponse }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState('');
  const [loadingText, setLoadingText] = useState('');
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  const workerRef = useRef(null);
  const responseRef = useRef('');

  useEffect(() => {
    // Initialize the Web Worker
    workerRef.current = new Worker();

    workerRef.current.onmessage = (e) => {
      const { status, data, output, tps, numTokens } = e.data;
      setStatus(status);

      switch (status) {
        case 'loading':
          setIsLoading(true);
          setLoadingText(data || 'Loading model...');
          break;

        case 'progress':
          setLoadingText(`Loading ${e.data.file} ${(e.data.total / Math.pow(1024, 3)).toFixed(2)} GB ${e.data.progress.toFixed(2)}%`);
          break;

        case 'ready':
          setIsLoading(false);
          setIsModelLoaded(true);
          setLoadingText('Model ready!');
          break;

        case 'start':
          setIsRunning(true);
          responseRef.current = '';
          break;

        case 'update':
          if (tps && numTokens) {
            setLoadingText(`Generated ${numTokens} tokens in ${(numTokens / tps).toFixed(2)} seconds.`);
          }
          responseRef.current += output;
          break;

        case 'complete':
          setIsRunning(false);
          setInput('');

          // Call the callback with the complete response
          if (onResponse && responseRef.current) {
            onResponse(responseRef.current);
          }

          responseRef.current = '';
          break;

        case 'error':
          setIsLoading(false);
          setIsRunning(false);
          console.error('Worker error:', data);
          setLoadingText(`Error: ${data}`);
          break;
      }
    };

    workerRef.current.onerror = (error) => {
      console.error('Worker error:', error);
      setIsLoading(false);
      setIsRunning(false);
    };

    // Check WebGPU support
    workerRef.current.postMessage({ type: 'check' });

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [onResponse]);

  const handleLoadModel = () => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'load' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && workerRef.current && !isRunning && isModelLoaded) {
      const messages = [
        { role: "system", content: "You are a world-class coder and reply with concise sentences, at most 5 paragraphs" },
        { role: "user", content: input.trim() },
      ];

      workerRef.current.postMessage({ type: 'generate', data: messages });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Always show the interface (controlled by parent)
  return (
    <div style={{
      position: 'absolute',
      bottom: '5px',
      right: '5px',
      zIndex: 1000,
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '9px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      minWidth: '395px'
    }}>

      {loadingText && (
        <div style={{
          marginBottom: '12px',
          fontSize: '14px',
          color: '#666',
          padding: '8px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          minHeight: '20px',
          fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
        }}>
          {loadingText}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          disabled={isRunning || !isModelLoaded}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
          }}
        />

        {!isModelLoaded ? (
          <button
            type="button"
            onClick={handleLoadModel}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
            }}
          >
            {isLoading ? 'Loading...' : 'Load Model'}
          </button>
        ) : (
          <button
            type="submit"
            disabled={isRunning || !input.trim()}
            style={{
              padding: '8px 16px',
              backgroundColor: isRunning || !input.trim() ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isRunning || !input.trim() ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {isRunning ? 'Thinking...' : 'Send'}
          </button>
        )}
      </form>
    </div>
  );
};

export default LLMChat;