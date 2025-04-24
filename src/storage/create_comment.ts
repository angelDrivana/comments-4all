import type { PageInfo } from "../types/CommentTypes";

interface CreateCommentParams {
  coordinates: [number, number];
  comment: string;
  pageInfo: PageInfo;
}

// Servicio simulado para crear un comentario
export const createComment = async ({
  coordinates,
  comment,
  pageInfo
}: CreateCommentParams): Promise<void> => {
  // Simulamos un ID de usuario (en una implementación real, esto vendría de la autenticación)
  const userId = "user-123";
  
  console.log("Creando comentario:", {
    coordinates,
    comment,
    userId,
    currentLocation: pageInfo.url,
    webTitle: pageInfo.title
  });
  
  // Simulamos una demora en la red
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // En una implementación real, aquí se enviaría a Supabase
  console.log("Comentario creado exitosamente");
}; 