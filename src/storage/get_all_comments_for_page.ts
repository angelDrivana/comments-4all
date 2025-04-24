import type { CommentData } from "../types/CommentTypes";

// Función simulada para obtener todos los comentarios de una página específica
export const getAllCommentsForPage = async (url: string): Promise<CommentData[]> => {
  console.log("Obteniendo comentarios para:", url);
  
  // Simulamos una demora en la red
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Generar 20 comentarios ficticios con diferentes coordenadas
  const mockComments: CommentData[] = Array.from({ length: 20 }, (_, index) => {
    // Generar coordenadas aleatorias dentro de los límites de la ventana
    const x = Math.floor(Math.random() * (window.innerWidth - 200));
    const y = Math.floor(Math.random() * (window.innerHeight - 200));
    
    // Alternamos los usuarios para tener variedad
    const user = index % 3 === 0 
      ? { name: "Angel Mendez", profile_photo: "https://i.pravatar.cc/150?u=angel" }
      : index % 3 === 1
        ? { name: "María García", profile_photo: "https://i.pravatar.cc/150?u=maria" }
        : { name: "Juan López" }; // Este usuario no tiene foto

    return {
      id: `comment-${Date.now()}-${index}`,
      user,
      comment: `Este es un comentario de prueba #${index + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      created_at: new Date(Date.now() - Math.random() * 604800000).toISOString(), // Hasta una semana atrás
      coordinates: [x, y] as [number, number],
      webTitle: document.title,
      currentLocation: url
    };
  });
  
  return mockComments;
}; 