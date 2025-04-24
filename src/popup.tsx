import { useState, useEffect } from "react"
import { Storage } from "@plasmohq/storage"
import "./style.css"

function IndexPopup() {
  const storage = new Storage()
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    // Al iniciar, obtener el estado actual
    getEnabled()
  }, [])

  const getEnabled = async () => {
    const enabled = await storage.get("commentExtensionEnabled") as boolean
    setEnabled(enabled)
  }

  const toggleExtension = () => {
    const newState = !enabled
    setEnabled(newState)
    
    // Guardar el estado en el almacenamiento local
    storage.set("commentExtensionEnabled", newState)
    
    // Enviar mensaje a la página de contenido
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: "toggleCommentMode",
          enabled: newState
        })
      }
    })
  }

  return (
    <div className="p-4 w-64 bg-white">
      <h2 className="text-lg font-bold mb-3 text-center">Comentarios</h2>
      <div className="flex items-center justify-between">
        <span className="text-sm text-red-500">Modo comentario</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={enabled}
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