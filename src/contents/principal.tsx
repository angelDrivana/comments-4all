import { useEffect, useState } from "react"
import type { Comment } from "../types/comment"
import { getComments } from "../services/comments"
import cssText from "data-text:~style.css"
 
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}
export default function CommentOverlay() {
  const [isActive, setIsActive] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => {
    // Escuchar mensajes del popup
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === "toggleCommentMode") {
        setIsActive(message.enabled)
        if (message.enabled) {
          loadComments()
        }
      }
      return true
    })
  }, [])

  const loadComments = async () => {
    const pageComments = await getComments(window.location.href)
    setComments(pageComments)
  }

  if (!isActive) {
    return null
  }

  return (
    <div className="fixed inset-0 pointer-events-none">
      {comments.map((comment) => {
        const [x, y] = comment.coordinates
        return (
          <div
            key={comment.id}
            style={{
              position: "absolute",
              top: `${y}px`,
              left: `${x}px`,
              pointerEvents: "auto"
            }}
            className="w-8 h-8 rounded-full border border-gray-300 overflow-hidden cursor-pointer hover:scale-110 transition-transform"
          >
            {comment.user.profile_photo ? (
              <img
                src={comment.user.profile_photo}
                alt={comment.user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-semibold text-xs">
                {comment.user.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase()
                  .substring(0, 2)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}