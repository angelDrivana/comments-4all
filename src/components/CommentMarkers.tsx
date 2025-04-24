import { useState } from "react"
import type { CommentData } from "../types/CommentTypes"

interface CommentMarkersProps {
  comments: CommentData[]
}

export const CommentMarkers: React.FC<CommentMarkersProps> = ({ comments }) => {
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null)

  const handleMouseEnter = (id: string) => {
    setActiveCommentId(id)
  }

  const handleMouseLeave = () => {
    setActiveCommentId(null)
  }

  // Función para obtener las iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <>
      {comments.map((comment) => {
        const [x, y] = comment.coordinates
        
        return (
          <div 
            key={comment.id}
            style={{
              position: "absolute",
              top: `${y}px`,
              left: `${x}px`,
              zIndex: 9998
            }}
            onMouseEnter={() => handleMouseEnter(comment.id)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Marcador de comentario (avatar o iniciales) */}
            <div className="relative">
              <div className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-300 overflow-hidden cursor-pointer">
                {comment.user.profile_photo ? (
                  <img
                    src={comment.user.profile_photo}
                    alt={comment.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-semibold text-xs">
                    {getInitials(comment.user.name)}
                  </div>
                )}
              </div>
              
              {/* Tooltip con el comentario (aparece al hacer hover) */}
              {activeCommentId === comment.id && (
                <div className="absolute top-10 left-0 w-64 p-3 bg-white rounded-md border border-gray-300 z-10">
                  <div className="flex items-start mb-2">
                    <div className="w-6 h-6 rounded-full flex-shrink-0 overflow-hidden mr-2">
                      {comment.user.profile_photo ? (
                        <img
                          src={comment.user.profile_photo}
                          alt={comment.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-semibold text-[10px]">
                          {getInitials(comment.user.name)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{comment.user.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm">{comment.comment}</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </>
  )
} 