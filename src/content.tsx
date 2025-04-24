// import cssText from "data-text:~/style.css"
// import type { PlasmoCSConfig } from "plasmo"
// import { useEffect, useState } from "react"
// import { CommentForm } from "./components/CommentForm"
// import { CommentMarkers } from "./components/CommentMarkers"
// import { getAllCommentsForPage } from "./storage/get_all_comments_for_page"
// import type { CommentData } from "./types/CommentTypes"

// export const config: PlasmoCSConfig = {
//   matches: ["<all_urls>"],
//   all_frames: true
// }

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
//     // const pageComments = await getAllCommentsForPage(window.location.href)
//     // setComments(pageComments)
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

//   if (!isCommentModeActive) {
//     return <CommentMarkers comments={comments} />
//   }

//   return (
//     <div
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         width: "100%",
//         height: "100%",
//         pointerEvents: showCommentForm ? "none" : "all",
//         cursor: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z\"></path></svg>'), auto"
//       }}
//       onClick={handleClick}>
//       <CommentMarkers comments={comments} />
      
//       {showCommentForm && coordinates && (
//         <div
//           style={{
//             position: "fixed",
//             top: coordinates[1],
//             left: coordinates[0],
//             pointerEvents: "all",
//             zIndex: 999999
//           }}>
//           <CommentForm 
//             coordinates={coordinates}
//             pageInfo={currentPageInfo}
//             onSubmit={handleCommentSubmit}
//             onClose={handleCloseForm}
//           />
//         </div>
//       )}
//     </div>
//   )
// }

// export default PlasmoOverlay 