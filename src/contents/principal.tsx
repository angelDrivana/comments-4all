import { useEffect, useState } from "react"
import type { Comment } from "../types/comment"
import { getComments } from "../services/comments"
import cssText from "data-text:~style.css"
import { Toolbar, type Mode } from "./components/Toolbar"
import { CommentForm } from "./components/CommentForm"
import ModalSignIn from "../components/ModalSignIn"
import SignIn from "../components/signIn"
import { supabase } from "~src/core/supabase"
import { useStorage } from "@plasmohq/storage/hook"
import type { User } from "@supabase/supabase-js"
import { Storage } from "@plasmohq/storage"
import { UserCursor } from "./components/UserCursor"

interface CursorPosition {
  x: number
  y: number
  username: string
  userId: string
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export default function CommentOverlay() {
  const [user, setUser] = useStorage<User | null>({
    key: "user",
    instance: new Storage({
      area: "local"
    })
  })
  const [isActive, setIsActive] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })
  const [mode, setMode] = useState<Mode>("normal")
  const [showForm, setShowForm] = useState(false)
  const [formPosition, setFormPosition] = useState({ x: 0, y: 0 })
  const [cursorPosition, setCursorPosition] = useState([0, 0])
  const [otherCursors, setOtherCursors] = useState<CursorPosition[]>([])

  // Efecto para inicializar la sesión
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    init()
  }, [])

  // Efecto para cargar comentarios cuando se active y haya usuario
  useEffect(() => {
    if (isActive && user?.id) {
      loadComments()
    }
  }, [isActive, user?.id])

  // Efecto para escuchar cambios en la tabla comments
  useEffect(() => {
    if (!isActive || !user?.id) return

    const channel = supabase
      .channel('comments-changes')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'comments'
        },
        async (payload: {
          eventType: 'INSERT' | 'DELETE'
          new: Comment | null
          old: { id: string } | null
        }) => {
          console.log('Cambio en comments:', payload)
          
          // Si es el mismo usuario que hizo el cambio, ignoramos
          // if (payload.new && payload.new.userId === user.id) return

          switch (payload.eventType) {
            case 'INSERT':
              if (payload.new) {
                const userProfile = await supabase.from('profiles').select('username').eq('id', payload.new.userId).single()
                setComments(prev => [...prev, { ...payload.new, user: userProfile.data } as Comment])
              }
              break
            case 'DELETE':
              if (payload.old) {
                setComments(prev => prev.filter(comment => comment.id !== payload.old?.id))
              }
              break
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [isActive, user?.id])

  // Efecto para manejar el scroll
  useEffect(() => {
    if (!isActive) return

    const handleScroll = () => {
      setScrollPosition({
        x: window.scrollX,
        y: window.scrollY
      })
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isActive])

  // Efecto para manejar el movimiento del cursor
  useEffect(() => {
    if (!user?.id || !isActive) return

    const url = window.location.href
    const channel = supabase.channel(`cursors_in_page_${url}`)

    channel
      .on('broadcast', { event: 'cursor-position' }, (payload) => {
        if (payload.payload.userId === user.id) return
        
        setOtherCursors(prev => {
          const filtered = prev.filter(c => c.userId !== payload.payload.userId)
          return [...filtered, payload.payload]
        })
      })
      .subscribe()

    const handleMouseMove = (e: MouseEvent) => {
      channel.send({
        type: 'broadcast',
        event: 'cursor-position',
        payload: {
          x: e.clientX + scrollPosition.x,
          y: e.clientY + scrollPosition.y,
          username: user.email,
          userId: user.id
        }
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      channel.unsubscribe()
      setOtherCursors([])
    }
  }, [user?.id, scrollPosition, isActive])

  // Efecto para manejar los mensajes del popup
  useEffect(() => {
    const messageHandler = async (message: any) => {
      if (message.action === "toggleCommentMode") {
        console.log("toggleCommentMode", message.enabled)
        setIsActive(message.enabled)
        
        if (!message.enabled) {
          console.log("ELSE DE LOAD COMMENTS")
          setComments([])
          setOtherCursors([])
          setShowForm(false)
          setMode("normal")
        }
      }
      return true
    }

    chrome.runtime.onMessage.addListener(messageHandler)
    return () => chrome.runtime.onMessage.removeListener(messageHandler)
  }, [])

  const loadComments = async () => {
    console.log("USER LOADOMMENTS", user?.id)
    if (!user?.id) return
    const pageComments = await getComments(window.location.href)
    setComments(pageComments)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (mode !== "comment" || !user?.id || !isActive) return

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const formWidth = 288
    const formHeight = 200

    const clickX = e.clientX
    const clickY = e.clientY

    const cursorPosition = [clickX + scrollPosition.x, clickY + scrollPosition.y]
    setCursorPosition(cursorPosition)

    let x = clickX + scrollPosition.x
    let y = clickY + scrollPosition.y

    if (clickY - formHeight < 0) {
      y = y + (formHeight + 10)
    } else {
      y = y
    }

    if (clickX + (formWidth/2) > viewportWidth) {
      x = x - (formWidth/2)
    } else if (clickX - (formWidth) < 0) {
      x = (formWidth - 50)
    } else {
      x = x - (formWidth/2)
    }

    setFormPosition({ x, y })
    setShowForm(true)
  }

  const handleCommentSubmit = (comment: Comment) => {
    setShowForm(false)
  }

  if (!user?.id || !isActive) {
    return <ModalSignIn><SignIn /></ModalSignIn>
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
        {otherCursors.map((cursor) => (
          <UserCursor
            key={cursor.userId}
            position={{ x: cursor.x - scrollPosition.x, y: cursor.y - scrollPosition.y }}
            username={cursor.username}
          />
        ))}

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