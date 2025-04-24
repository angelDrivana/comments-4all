const CustomButton = () => {
    return <button>Custom button</button>
  }
   
  export default CustomButton

// import cssText from "data-text:~/style.css"
// import { useEffect, useState } from "react"
// import { CommentMarkers } from "./components/CommentMarkers"
// import type { CommentData } from "./types/CommentTypes"
// import { getAllCommentsForPage } from "./storage/get_all_comments_for_page"

// export const getStyle = () => {
//   const style = document.createElement("style")
//   style.textContent = cssText
//   return style
// }

// const PlasmoOverlay = () => {
//   const [isCommentModeActive, setIsCommentModeActive] = useState(false)
//   const [coordinates, setCoordinates] = useState<[number, number] | null>(null)
//   const [showCommentForm, setShowCommentForm] = useState(false)
//   const [comments, setComments] = useState<CommentData[]>([])
//   const [currentPageInfo, setCurrentPageInfo] = useState({
//     url: "",
//     title: ""
//   })

//   useEffect(() => {
//     // // Obtener estado actual
//     // chrome.storage.local.get(["commentExtensionEnabled"], (result) => {
//     //   setIsCommentModeActive(result.commentExtensionEnabled || false)
//     // })

//     // // Escuchar mensajes del popup
//     // chrome.runtime.onMessage.addListener((message) => {
//     //   if (message.action === "toggleCommentMode") {
//     //     setIsCommentModeActive(message.enabled)
//     //   }
//     //   return true
//     // })

//     // // Obtener información de la página actual
//     // setCurrentPageInfo({
//     //   url: window.location.href,
//     //   title: document.title
//     // })

//     // Cargar comentarios para esta página
//     loadComments()
//   }, [])

//   const loadComments = async () => {
//     const pageComments = await getAllCommentsForPage(window.location.href)
//     setComments(pageComments)
//   }

//   const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
//     // if (!isCommentModeActive) return

//     // // Prevenir el comportamiento normal del click
//     // e.preventDefault()
//     // e.stopPropagation()

//     // const x = e.clientX
//     // const y = e.clientY

//     // setCoordinates([x, y])
//     // setShowCommentForm(true)
//   }

//   const handleCommentSubmit = () => {
//     // setShowCommentForm(false)
//     // loadComments() // Recargar comentarios después de crear uno nuevo
//   }

//   const handleCloseForm = () => {
//     // setShowCommentForm(false)
//   }

// //   if (!isCommentModeActive) {
// //     return <CommentMarkers comments={comments} />
// //   }

//     return <button>Custom button</button>
// }

// export default PlasmoOverlay 