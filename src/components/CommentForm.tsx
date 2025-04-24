import { useState } from "react"
import { createComment } from "../storage/create_comment"
import type { PageInfo } from "../types/CommentTypes"

interface CommentFormProps {
  coordinates: [number, number]
  pageInfo: PageInfo
  onSubmit: () => void
  onClose: () => void
}

export const CommentForm: React.FC<CommentFormProps> = ({
  coordinates,
  pageInfo,
  onSubmit,
  onClose
}) => {
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!comment.trim()) return
    
    setIsSubmitting(true)
    
    try {
      await createComment({
        coordinates,
        comment,
        pageInfo
      })
      
      onSubmit()
    } catch (error) {
      console.error("Error al crear comentario:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-72 bg-white rounded-md border border-gray-300 overflow-hidden">
      <div className="p-3">
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full h-24 p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Escribe tu comentario..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isSubmitting}
            autoFocus
          />
          <div className="flex justify-between mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border border-gray-300"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 border border-blue-700"
              disabled={isSubmitting || !comment.trim()}
            >
              {isSubmitting ? "Guardando..." : "Comentar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 