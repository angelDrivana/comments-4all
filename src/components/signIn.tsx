import type { Provider, User } from "@supabase/supabase-js"
import { useState } from "react"
import React from "react"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import { supabase } from "~core/supabase"

function SignInComponent() {
  const [user, setUser] = useStorage<User | null>({
    key: "user",
    instance: new Storage({
      area: "local"
    })
  })

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailLogin = async (
    type: "LOGIN" | "SIGNUP",
    username: string,
    password: string
  ) => {
    try {
      setIsLoading(true)
      const {
        error,
        data: { user }
      } =
        type === "LOGIN"
          ? await supabase.auth.signInWithPassword({
              email: username,
              password
            })
          : await supabase.auth.signUp({ email: username, password })

      if (error) {
        alert("Error con la autenticación: " + error.message)
      } else if (!user && type === "SIGNUP") {
        alert("Registro exitoso, revisa tu correo para confirmar tu cuenta.")
      } else {
        setUser(user)
      }
    } catch (error) {
      console.log("error", error)
      alert(error.error_description || error)
    } finally {
      setIsLoading(false)
    }
  }

  if (user) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">
          Sesión iniciada como: <strong>{user.email}</strong>
        </p>
        <button
          onClick={() => {
            supabase.auth.signOut()
            setUser(null)
          }}
          className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
        >
          Cerrar sesión
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Correo electrónico
        </label>
        <input
          type="email"
          placeholder="tu@email.com"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña
        </label>
        <input
          type="password"
          placeholder="Tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => handleEmailLogin("LOGIN", username, password)}
          disabled={isLoading}
          className="w-full px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>

        <button
          onClick={() => handleEmailLogin("SIGNUP", username, password)}
          disabled={isLoading}
          className="w-full px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50"
        >
          {isLoading ? "Creando cuenta..." : "Crear cuenta"}
        </button>

      </div>
    </div>
  )
}

export default SignInComponent