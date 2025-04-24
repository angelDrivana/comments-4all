import React from "react"
import { useState } from "react"
import { useEffect } from "react"

interface ModalProps {
  children: React.ReactNode
}

export default function ModalSignIn({
  children
}: ModalProps) {

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === "showSignInModal") {
        console.log("showSignInModal")
        setIsOpen(true)
      }
      return true
    })

    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  const handleClose = () => {
    setIsOpen(false)
    chrome.runtime.sendMessage({ action: "closeSignInModal" })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[480px] max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Iniciar sesión</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
} 