import { useEffect, useRef, useState } from "react"
import { supabase } from "../../core/supabase"
import { insertComment } from "../../services/comments"
import type { Comment, BoundElement } from "../../types/comment"
import type { User } from "@supabase/supabase-js"
import { useStorage } from "@plasmohq/storage/hook"
import { Storage } from "@plasmohq/storage"

interface CommentFormProps {
  cursorPosition: number[]
  coordinates: [number, number]
  boundElement: BoundElement
  onSubmit: (comment: Comment) => void
  onCancel: () => void
}

export const CommentForm: React.FC<CommentFormProps> = ({
  coordinates,
  cursorPosition,
  boundElement,
  onSubmit,
  onCancel
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [user, setUser] = useStorage<User | null>({
    key: "user",
    instance: new Storage({
      area: "local"
    })
  })

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [coordinates])

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    fetchUser()
  }, [])

  const [comment, setComment] = useState("")

  const parseComment = async (comment: string): Promise<Comment> => {
    const { data: { user } } = await supabase.auth.getUser()

    setUser(user)

    if (!user) {
      console.error("No se encontró el usuario")
      return
    }

    return {
      coordinates: [cursorPosition[0], cursorPosition[1]],
      comment: comment,
      userId: user.id,
      web_title: document.title,
      current_location: window.location.href,
      boundElement: boundElement
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (comment.trim()) {
      const parsedComment = await parseComment(comment)
      onSubmit(parsedComment)
      try {
        await insertComment(parsedComment)
        setComment("")
      } catch (error) {
        console.error("Error al insertar comentario", error)
      }
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        top: coordinates[1],
        left: coordinates[0],
        transform: "translate(-50%, -100%)",
        zIndex: 9999
      }}
      className="bg-white rounded-lg border border-gray-200 w-72"
    >
      <div className="p-3">
        {/* Usuario actual */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
            {user?.email
              .split(" ")
              .map((part) => part[0])
              .join("")
              .toUpperCase()
              .substring(0, 2)}
          </div>
          <span className="text-sm font-medium">{user?.email}</span>
        </div>

        {/* Información del elemento */}
        <div className="mb-3 text-xs text-gray-500">
          {boundElement ? (
            <>
              <div className="space-y-1">
                <p className="font-medium text-gray-700">Elemento seleccionado:</p>
                <p>
                  <span className="text-gray-600">Tipo:</span> {boundElement.elementDescriptor.tagName.toLowerCase()}
                  {boundElement.elementDescriptor.className && (
                    <span className="ml-1 text-blue-500">.{boundElement.elementDescriptor.className.split(' ')[0]}</span>
                  )}
                  {boundElement.elementDescriptor.id && (
                    <span className="ml-1 text-orange-500">#{boundElement.elementDescriptor.id}</span>
                  )}
                </p>
                
                {boundElement.originalElement && (
                  <p className="text-gray-400">
                    <span className="text-gray-500">Elemento original:</span> {boundElement.originalElement.originalTagName.toLowerCase()}
                  </p>
                )}

                <p className="text-gray-400">
                  <span className="text-gray-500">Dimensiones:</span> {boundElement.dimensions.width.toFixed(0)}x{boundElement.dimensions.height.toFixed(0)}px
                </p>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <p>
                    <span className="text-gray-600">Posición en elemento:</span>{' '}
                    {boundElement.percentagePositionInRect.x}%, {boundElement.percentagePositionInRect.y}%
                  </p>
                  
                  <p>
                    <span className="text-gray-600">Posición en página:</span>{' '}
                    {boundElement.position.x}px, {boundElement.position.y}px
                  </p>

                  <p>
                    <span className="text-gray-600">Tamaño de pantalla:</span>{' '}
                    {boundElement.screenInfo.screenSize.x}x{boundElement.screenInfo.screenSize.y}
                  </p>

                  <p>
                    <span className="text-gray-600">Scroll:</span>{' '}
                    {boundElement.screenInfo.scrollPosition}px
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p>No se pudo obtener información del elemento</p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full h-24 p-2 border border-gray-200 rounded resize-none text-sm focus:outline-none focus:border-blue-500"
            placeholder="Escribe tu comentario..."
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!comment.trim()}
              className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Comentar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 