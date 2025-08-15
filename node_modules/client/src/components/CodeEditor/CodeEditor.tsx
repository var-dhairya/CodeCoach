import React, { useState } from 'react';

interface CodeEditorProps {
  code: string;
  language: string;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: string) => void;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language,
  onCodeChange,
  onLanguageChange,
  readOnly = false
}) => {
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);

  // Update line numbers when code changes
  React.useEffect(() => {
    const lines = code.split('\n');
    setLineNumbers(Array.from({ length: lines.length }, (_, i) => i + 1));
  }, [code]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onCodeChange(e.target.value);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onLanguageChange(e.target.value);
  };

  return (
    <div className="code-editor-container">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Code Editor</h3>
        <select
          value={language}
          onChange={handleLanguageChange}
          disabled={readOnly}
          className="input-field text-sm"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>
      
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        {/* Line numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-800 text-gray-400 text-xs font-mono p-2 select-none">
          {lineNumbers.map((line) => (
            <div key={line} className="text-right pr-2">
              {line}
            </div>
          ))}
        </div>
        
        {/* Code textarea */}
        <textarea
          value={code}
          onChange={handleCodeChange}
          readOnly={readOnly}
          className="w-full h-96 bg-gray-900 text-green-400 font-mono text-sm p-4 pl-16 resize-none focus:outline-none focus:ring-0"
          placeholder={`// Write your ${language} code here...\n\n// Example:\nfunction solution(input) {\n  // Your code here\n  return result;\n}`}
          style={{
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            lineHeight: '1.5'
          }}
        />
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        {readOnly ? (
          <span>Read-only mode</span>
        ) : (
          <span>Press Ctrl+Enter to submit</span>
        )}
      </div>
    </div>
  );
};

export default CodeEditor; 