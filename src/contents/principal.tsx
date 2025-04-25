import { useEffect, useState } from "react"
import type { Comment } from "../types/comment"
import type { BoundElement } from "../types/comment"
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

const getElementXPath = (element: Element): string => {
  // Si el elemento tiene ID, usamos eso directamente
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }

  // Si llegamos al <html>, terminamos
  if (!element.parentElement) {
    return '/html';
  }

  // Obtener el índice del elemento entre sus hermanos del mismo tipo
  const siblings = Array.from(element.parentElement.children);
  const sameTypeSiblings = siblings.filter(sibling => 
    sibling.tagName === element.tagName
  );
  const index = sameTypeSiblings.indexOf(element) + 1;

  // Construir el path para este elemento
  const pathSegment = `${element.tagName.toLowerCase()}[${index}]`;

  // Si es el elemento raíz, devolver el path
  if (element.parentElement.tagName.toLowerCase() === 'html') {
    return `/html/${pathSegment}`;
  }

  // Recursivamente construir el path
  return `${getElementXPath(element.parentElement)}/${pathSegment}`;
};

const getFullXPath = (element: Element): string => {
  const parts: string[] = [];
  let current = element;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let xpath = current.tagName.toLowerCase();

    // Si el elemento tiene ID, usarlo
    if (current.id) {
      xpath += `[@id="${current.id}"]`;
    }
    // Si el elemento tiene clase, usarla
    else if (current.className) {
      xpath += `[@class="${current.className}"]`;
    }
    // Si no, usar su posición
    else {
      let count = 1;
      let sibling = current.previousElementSibling;

      while (sibling) {
        if (sibling.tagName === current.tagName) count++;
        sibling = sibling.previousElementSibling;
      }

      if (count > 1) xpath += `[${count}]`;
    }

    parts.unshift(xpath);
    current = current.parentElement!;
  }

  return '/' + parts.join('/');
};

const findMostSpecificElement = (elements: Element[]): Element => {
  // Filtrar elementos que no queremos
  const validElements = elements.filter(el => {
    const tagName = el.tagName.toLowerCase();
    return (
      // Excluir elementos base
      !['html', 'body', 'head', 'script', 'style', 'link', 'meta'].includes(tagName) &&
      // Excluir elementos de nuestro overlay
      !el.classList.contains('pointer-events-none') &&
      // Excluir elementos sin dimensiones
      el.getBoundingClientRect().width > 0 &&
      el.getBoundingClientRect().height > 0
    );
  });

  if (validElements.length === 0) {
    return elements[0]; // Fallback al primer elemento si no encontramos válidos
  }

  // Encontrar el elemento con la menor área (más específico)
  return validElements.reduce((mostSpecific, current) => {
    const currentRect = current.getBoundingClientRect();
    const mostSpecificRect = mostSpecific.getBoundingClientRect();
    
    const currentArea = currentRect.width * currentRect.height;
    const mostSpecificArea = mostSpecificRect.width * mostSpecificRect.height;
    
    return currentArea < mostSpecificArea ? current : mostSpecific;
  }, validElements[0]);
};

const getElementInfo = (element: Element, clickX: number, clickY: number) => {
  // Obtener todos los elementos en el punto del clic
  const elementsAtPoint = document.elementsFromPoint(clickX, clickY);
  
  // Encontrar el elemento más específico
  const targetElement = findMostSpecificElement(elementsAtPoint);
  
  const rect = targetElement.getBoundingClientRect();
  
  // Calcular posición relativa dentro del elemento
  const positionInRect = {
    x: Math.min(Math.max(0, clickX - rect.left), rect.width),
    y: Math.min(Math.max(0, clickY - rect.top), rect.height)
  };
  
  // Calcular posición en porcentaje dentro del elemento
  const percentagePositionInRect = {
    x: Math.min(Math.round((positionInRect.x / rect.width) * 100 * 100) / 100, 100),
    y: Math.min(Math.round((positionInRect.y / rect.height) * 100 * 100) / 100, 100)
  };

  // Obtener información de la pantalla
  const screenInfo = {
    screenSize: {
      x: window.innerWidth,
      y: window.innerHeight
    },
    scrollPosition: window.scrollY
  };

  // Posición absoluta en la página
  const position = {
    x: clickX + window.scrollX,
    y: clickY + window.scrollY
  };

  console.log('Element Info:', {
    element: targetElement.tagName,
    classes: targetElement.className,
    xpath: getElementXPath(targetElement),
    fullXPath: getFullXPath(targetElement),
    rect,
    elementsAtPoint: elementsAtPoint.map(el => el.tagName)
  });
  
  return {
    xPath: getElementXPath(targetElement),
    fullXPath: getFullXPath(targetElement),
    elementDescriptor: {
      tagName: targetElement.tagName,
      id: targetElement.id || "",
      className: (targetElement as HTMLElement).className || ""
    },
    percentagePositionInRect,
    positionInRect,
    position,
    screenInfo,
    dimensions: {
      width: rect.width,
      height: rect.height
    }
  };
};

// Función para calcular la posición actual basada en porcentajes
const calculatePositionFromPercentage = (comment: Comment) => {
  console.log("COMMENT", comment)
  // Si no hay boundElement, usar las coordenadas antiguas
  if (!comment.boundElement) {
    console.warn('Comment without boundElement, using legacy coordinates:', comment);
    return comment.coordinates ? {
      x: comment.coordinates[0],
      y: comment.coordinates[1]
    } : null;
  }

  const { boundElement } = comment;
  
  // Encontrar el elemento actual usando el XPath
  const getElementByXPath = (xpath: string) => {
    try {
      return document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue as Element;
    } catch (e) {
      console.error('Error finding element by XPath:', e);
      return null;
    }
  };

  // Intentar encontrar el elemento por XPath
  const element = getElementByXPath(boundElement.xPath) || getElementByXPath(boundElement.fullXPath);
  
  if (!element) {
    console.warn('Element not found for comment, using legacy coordinates:', comment);
    return comment.boundElement ? {
      x: comment.boundElement.position.x,
      y: comment.boundElement.position.y
    } : null;
  }

  // Obtener las dimensiones actuales del elemento
  const rect = element.getBoundingClientRect();
  
  // Calcular la posición actual basada en los porcentajes originales
  const currentX = (boundElement.percentagePositionInRect.x * rect.width) / 100;
  const currentY = (boundElement.percentagePositionInRect.y * rect.height) / 100;

  // Posición absoluta en la página
  return {
    x: rect.left + currentX + window.scrollX,
    y: rect.top + currentY + window.scrollY
  };
};

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
  const [boundElement, setBoundElement] = useState<BoundElement | null>(null)
  const [hoverElement, setHoverElement] = useState<Element | null>(null)

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
    if (mode !== "comment" || !user?.id || !isActive) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const formWidth = 288;
    const formHeight = 200;

    const clickX = e.clientX;
    const clickY = e.clientY;

    const elementInfo = getElementInfo(e.target as Element, clickX, clickY);
    setBoundElement(elementInfo);

    console.log('Click target:', {
      element: elementInfo.elementDescriptor.tagName,
      elementInfo
    });

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
    setBoundElement(null)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mode !== "comment") {
      setHoverElement(null)
      return
    }

    const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY)
    const targetElement = findValidElement(elementsAtPoint)
    
    if (targetElement) {
      setHoverElement(targetElement)
    } else {
      setHoverElement(null)
    }
  }

  const findValidElement = (elements: Element[]): Element | null => {
    const invalidTags = ['html', 'body', 'head', 'script', 'style', 'link', 'meta', 'plasmo-csui']
    
    return elements.find(element => {
      const isValid = 
        !invalidTags.includes(element.tagName.toLowerCase()) &&
        !element.classList?.contains('pointer-events-none') &&
        element.getBoundingClientRect().width > 0 &&
        element.getBoundingClientRect().height > 0
      
      return isValid
    }) || null
  }

  const handleMouseLeave = () => {
    setHoverElement(null)
  }

  if (!user?.id || !isActive) {
    return <ModalSignIn><SignIn /></ModalSignIn>
  }

  return (
    <>
    {/* Hover Indicator */}
    {mode === "comment" && hoverElement && (
      <div
        className="fixed border-2 border-blue-500 bg-blue-500/10 pointer-events-none transition-all duration-200 z-50"
        style={{
          top: `${hoverElement.getBoundingClientRect().top}px`,
          left: `${hoverElement.getBoundingClientRect().left}px`,
          width: `${hoverElement.getBoundingClientRect().width}px`,
          height: `${hoverElement.getBoundingClientRect().height}px`
        }}
      >
        <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {hoverElement.tagName.toLowerCase()}
          {hoverElement.className && typeof hoverElement.className === 'string' && (
            <span className="ml-1 opacity-75">.{hoverElement.className.split(' ')[0]}</span>
          )}
        </div>
      </div>
    )}

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
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      
      {comments.map((comment) => {
        const position = calculatePositionFromPercentage(comment);
        
        if (!position) {
          console.warn('Could not calculate position for comment:', comment);
          return null;
        }
        
        return (
          <div
            key={comment.id}
            style={{
              position: "absolute",
              top: `${position.y - scrollPosition.y}px`,
              left: `${position.x - scrollPosition.x}px`,
              pointerEvents: "auto"
            }}
            className="w-8 h-8 rounded-full border border-gray-300 overflow-hidden cursor-pointer hover:scale-110 transition-transform group"
            title={comment.boundElement ? 'Comentario anclado al elemento' : 'Comentario en posición fija'}
          >
            <div className={`w-full h-full flex items-center justify-center text-white font-semibold text-xs ${comment.boundElement ? 'bg-blue-500' : 'bg-gray-500'}`}>
              {comment.user?.username
                .split(" ")
                .map((part) => part[0])
                .join("")
                .toUpperCase()
                .substring(0, 2)}
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
              {comment.user?.username}
              {!comment.boundElement && (
                <span className="ml-1 text-gray-500">(posición fija)</span>
              )}
            </div>
          </div>
        );
      })}
    </div>

    <Toolbar currentMode={mode} onModeChange={setMode} />

    {showForm && boundElement && (
      <CommentForm
        cursorPosition={cursorPosition}
        coordinates={[formPosition.x, formPosition.y]}
        boundElement={boundElement}
        onSubmit={handleCommentSubmit}
        onCancel={() => {
          setShowForm(false)
          setBoundElement(null)
        }}
      />
    )}

    <ModalSignIn>
      <SignIn />
    </ModalSignIn>
  </>
)
}