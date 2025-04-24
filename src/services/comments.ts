import type { Comment } from "../types/comment";
import { supabase } from "../core/supabase";

const parseComments = (comments: any[]): Comment[] => {
  return comments.map((comment) => ({
    id: comment.id,
    comment: comment.comment,
    created_at: comment.created_at,
    userId: comment.userId,
    user: comment.userId as {id: string, username: string},
    coordinates: comment.coordinates,
    web_title: comment.web_title,
    current_location: comment.current_location
  }));
};
export const getComments = async (url: string): Promise<Comment[]> => {
  console.log("Obteniendo comentarios para:", url);

  const { data: comments, error } = await supabase
    .from("comments")
    .select("id, comment, created_at, coordinates, web_title, current_location, userId (id, username)")
    .eq("current_location", url)
    .order("created_at", { ascending: false });


  if (error) {
    console.error("Error al obtener comentarios:", error);
    return [];
  }

  return parseComments(comments);
}; 

export const insertComment = async (comment: Comment) => {
  const { data, error } = await supabase
    .from("comments")
    .insert(comment)
    .select();
};
