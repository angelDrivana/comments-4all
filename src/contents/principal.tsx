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
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })

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

    // Escuchar el evento de scroll
    const handleScroll = () => {
      setScrollPosition({
        x: window.scrollX,
        y: window.scrollY
      })
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
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
              top: `${y - scrollPosition.y}px`,
              left: `${x - scrollPosition.x}px`,
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