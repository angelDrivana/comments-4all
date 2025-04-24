import { useState, useEffect } from "react"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import type { User } from "@supabase/supabase-js"
import "./style.css"
import { supabase } from "~core/supabase"

function IndexPopup() {
  const storage = new Storage()
  const [enabled, setEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [user, setUser] = useStorage<User | null>({
    key: "user",
    instance: new Storage({
      area: "local"
    })
  })
  

  useEffect(() => {
    // Al iniciar, obtener el estado actual
    getEnabled()
  }, [])

  const getEnabled = async () => {
    const enabled = await storage.get("commentExtensionEnabled") as boolean
    setEnabled(enabled)
    sendToTabs(enabled)
    setIsLoading(false)
  }

  const toggleExtension = () => {
    const newState = !enabled
    setEnabled(newState)
    storage.set("commentExtensionEnabled", newState)
    sendToTabs(newState)
  }

  const sendToTabs = (state: boolean) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "toggleCommentMode",
          enabled: state
        })
      }
    })
  }

  const handleSignIn = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "showSignInModal"
        })
      }
    })
  }

  const handleSignOut = () => {
    supabase.auth.signOut()
    setUser(null)
  }

  return (
    <div className="p-4 w-80 bg-white">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">Comentarios</h2>
        {!user && (
          <button
            onClick={handleSignIn}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Iniciar sesión
          </button>
        )}
      </div>
      {user && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{user.email}</span>
          <button
            onClick={handleSignOut}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Cerrar sesión
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Modo comentario</span>
        {isLoading && <span className="text-sm text-gray-500">Cargando...</span>}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            disabled={isLoading}
            onChange={toggleExtension}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
        </label>
      </div>
    </div>
  )
}

export default IndexPopup