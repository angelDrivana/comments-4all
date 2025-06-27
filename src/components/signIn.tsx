import type { Provider, User } from "@supabase/supabase-js"
import { useState } from "react"
import React from "react"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import { supabase } from "../core/supabase"
import { Button } from '@headlessui/react'

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
    console.log("handleEmailLogin", type, username, password)
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
        return
      }

      if (user) {
        // Siempre intenta crear el perfil, ignora el error si ya existe
        await supabase.from("profiles").insert({ id: user.id, username }).select()
        setUser(user)
      }
    } catch (error) {
      console.log("error", error)
      alert(error.error_description || error)
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: username,
      password
    })

    if (error) {
      alert("Error al crear cuenta: " + error.message)
      return
    }
    if (data.user) {
      await supabase.from("profiles").insert({ id: data.user.id, username }).select()
      setUser(data.user)
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
        <Button
          onClick={() => handleEmailLogin("LOGIN", username, password)}
          disabled={isLoading}
          className="rounded bg-sky-600 px-4 py-2 text-sm text-white data-active:bg-sky-700 data-hover:bg-sky-500">
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>

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