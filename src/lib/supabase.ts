import { createClient } from '@supabase/supabase-js';

// Estas credenciales serían reemplazadas por tus verdaderas credenciales de Supabase
const supabaseUrl = 'https://tu-proyecto.supabase.co';
const supabaseKey = 'tu-clave-api-de-supabase';

// Creamos el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// Función de ayuda para verificar si el usuario está autenticado
export const getCurrentUser = async () => {
  // En una implementación real, esto devolvería el usuario de Supabase
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}; 