import { useEffect, useState } from "react"
import type { Comment } from "../types/comment"
import { getComments } from "../services/comments"
import cssText from "data-text:~style.css"
import { Toolbar, type Mode } from "./components/Toolbar"
import { CommentForm } from "./components/CommentForm"
import ModalSignIn from "../components/ModalSignIn"
import SignIn from "../components/signIn"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export default function CommentOverlay() {
  const [isActive, setIsActive] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })
  const [mode, setMode] = useState<Mode>("normal")
  const [showForm, setShowForm] = useState(false)
  const [formPosition, setFormPosition] = useState({ x: 0, y: 0 })

  const [cursorPosition, setCursorPosition] = useState([0, 0])

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

  const handleClick = (e: React.MouseEvent) => {
    if (mode !== "comment") return

    const cursorPosition = [(e.clientX + scrollPosition.x), (e.clientY + scrollPosition.y)]

    const x = e.clientX + scrollPosition.x
    const y = e.clientY + scrollPosition.y
    setFormPosition({ x, y })
    setShowForm(true)
    setCursorPosition(cursorPosition)
  }

  const handleCommentSubmit = (comment: Comment) => {
    setShowForm(false)
    loadComments()
  }

  if (!isActive) {
    return null
  }

  return (
    <>
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          cursor: mode === "comment" 
            ? "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%232563eb\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z\"></path><line x1=\"12\" y1=\"7\" x2=\"12\" y2=\"13\" /><line x1=\"9\" y1=\"10\" x2=\"15\" y2=\"10\" /></svg>'), auto"
            : "default"
        }}
      >
        <div 
          className="absolute inset-0" 
          style={{ pointerEvents: mode === "comment" ? "auto" : "none" }}
          onClick={handleClick}
        />
        
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
              
              <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-semibold text-xs">
                {comment.user?.username
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase()
                  .substring(0, 2)}
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium text-gray-700">
                {comment.user?.username}
              </div>
            </div>
          )
        })}
      </div>

      <Toolbar currentMode={mode} onModeChange={setMode} />

      {showForm && (
        <CommentForm
          cursorPosition={cursorPosition}
          coordinates={[formPosition.x, formPosition.y]}
          onSubmit={handleCommentSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      <ModalSignIn>
        <SignIn />
      </ModalSignIn>
    </>
  )
}