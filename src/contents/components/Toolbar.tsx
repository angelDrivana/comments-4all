import { useState } from "react"
import { MessageCircle, Eye, RefreshCw } from "lucide-react"
export type Mode = "normal" | "comment"

interface ToolbarProps {
  onModeChange: (mode: Mode) => void
  currentMode: Mode
  onReload?: () => void
}

export const Toolbar: React.FC<ToolbarProps> = ({ onModeChange, currentMode, onReload }) => {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full border border-gray-200 flex items-center p-1 gap-1">
      <button
        onClick={() => onModeChange("normal")}
        className={`p-2 rounded-full transition-colors ${
          currentMode === "normal"
            ? "bg-blue-100 text-blue-600"
            : "hover:bg-gray-100 text-gray-600"
        }`}
        title="Modo normal"
      >
        <Eye />
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
        <MessageCircle />
      </button>

      <button
        onClick={onReload}
        className="p-2 rounded-full transition-colors hover:bg-gray-100 text-gray-600"
        title="Recargar comentarios"
        type="button"
      >
        <RefreshCw />
      </button>
    </div>
  )
} 