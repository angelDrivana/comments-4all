import { useState } from "react"

export type Mode = "normal" | "comment"

interface ToolbarProps {
  onModeChange: (mode: Mode) => void
  currentMode: Mode
}

export const Toolbar: React.FC<ToolbarProps> = ({ onModeChange, currentMode }) => {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full border border-gray-200 shadow-sm flex items-center p-1 gap-1">
      <button
        onClick={() => onModeChange("normal")}
        className={`p-2 rounded-full transition-colors ${
          currentMode === "normal"
            ? "bg-blue-100 text-blue-600"
            : "hover:bg-gray-100 text-gray-600"
        }`}
        title="Modo normal"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2zm0 0l14 14M5 17L19 3" />
        </svg>
      </button>
      
      <button
        onClick={() => onModeChange("comment")}
        className={`p-2 rounded-full transition-colors ${
          currentMode === "comment"
            ? "bg-blue-100 text-blue-600"
            : "hover:bg-gray-100 text-gray-600"
        }`}
        title="Agregar comentario"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <line x1="12" y1="7" x2="12" y2="13" />
          <line x1="9" y1="10" x2="15" y2="10" />
        </svg>
      </button>
    </div>
  )
} 