import { eq, desc } from 'drizzle-orm';
import { db, schema } from '../core/db';
import type { Comment as ProjectComment } from '../types/comment';
import type { Profile, NewComment } from '../core/db';

const { comments, profiles } = schema;

/**
 * Obtener comentarios de una URL específica usando Drizzle
 */
export const getCommentsWithDrizzle = async (url: string): Promise<ProjectComment[]> => {
  try {
    console.log("Obteniendo comentarios para:", url);

    const commentsWithUsers = await db
      .select({
        id: comments.id,
        comment: comments.comment,
        created_at: comments.created_at,
        coordinates: comments.coordinates,
        web_title: comments.web_title,
        current_location: comments.current_location,
        boundElement: comments.boundElement,
        userId: comments.userId,
        pathname: comments.pathname,
        user: {
          id: profiles.id,
          username: profiles.username,
          profile_photo: profiles.profile_photo,
        }
      })
      .from(comments)
      .leftJoin(profiles, eq(comments.userId, profiles.id))
      .where(eq(comments.current_location, url))
      .orderBy(desc(comments.created_at));

    // Mapear los resultados al tipo ProjectComment
    return commentsWithUsers.map(item => ({
      id: item.id || undefined,
      userId: item.userId,
      user: item.user ? {
        username: item.user.username,
        profile_photo: item.user.profile_photo || undefined
      } : undefined,
      comment: item.comment,
      created_at: item.created_at?.toISOString(),
      coordinates: item.coordinates,
      web_title: item.web_title,
      current_location: item.current_location,
      boundElement: item.boundElement,
      pathname: item.pathname || undefined
    }));
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    return [];
  }
};

/**
 * Insertar un nuevo comentario usando Drizzle
 */
export const insertCommentWithDrizzle = async (commentData: {
  userId: string;
  comment: string;
  web_title: string;
  current_location: string;
  coordinates: [number, number];
  boundElement: ProjectComment['boundElement'];
  pathname?: string;
}) => {
  try {
    const newComment: NewComment = {
      userId: commentData.userId,
      comment: commentData.comment,
      web_title: commentData.web_title,
      current_location: commentData.current_location,
      coordinates: commentData.coordinates,
      boundElement: commentData.boundElement,
      pathname: commentData.pathname || null,
    };

    const [insertedComment] = await db
      .insert(comments)
      .values(newComment)
      .returning();

    console.log("Comentario insertado:", insertedComment);
    return insertedComment;
  } catch (error) {
    console.error("Error al insertar comentario:", error);
    throw error;
  }
};

/**
 * Obtener comentarios por usuario usando Drizzle
 */
export const getCommentsByUserWithDrizzle = async (userId: string): Promise<ProjectComment[]> => {
  try {
    const userComments = await db
      .select({
        id: comments.id,
        comment: comments.comment,
        created_at: comments.created_at,
        coordinates: comments.coordinates,
        web_title: comments.web_title,
        current_location: comments.current_location,
        boundElement: comments.boundElement,
        userId: comments.userId,
        pathname: comments.pathname,
        user: {
          id: profiles.id,
          username: profiles.username,
          profile_photo: profiles.profile_photo,
        }
      })
      .from(comments)
      .leftJoin(profiles, eq(comments.userId, profiles.id))
      .where(eq(comments.userId, userId))
      .orderBy(desc(comments.created_at));

    // Mapear los resultados al tipo ProjectComment
    return userComments.map(item => ({
      id: item.id || undefined,
      userId: item.userId,
      user: item.user ? {
        username: item.user.username,
        profile_photo: item.user.profile_photo || undefined
      } : undefined,
      comment: item.comment,
      created_at: item.created_at?.toISOString(),
      coordinates: item.coordinates,
      web_title: item.web_title,
      current_location: item.current_location,
      boundElement: item.boundElement,
      pathname: item.pathname || undefined
    }));
  } catch (error) {
    console.error("Error al obtener comentarios del usuario:", error);
    return [];
  }
};

/**
 * Eliminar un comentario usando Drizzle
 */
export const deleteCommentWithDrizzle = async (commentId: string) => {
  try {
    await db
      .delete(comments)
      .where(eq(comments.id, commentId));

    console.log("Comentario eliminado:", commentId);
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    throw error;
  }
};

/**
 * Crear o actualizar un perfil de usuario usando Drizzle
 */
export const upsertProfileWithDrizzle = async (profileData: {
  id: string;
  username: string;
  profile_photo?: string;
}) => {
  try {
    const [profile] = await db
      .insert(profiles)
      .values({
        id: profileData.id,
        username: profileData.username,
        profile_photo: profileData.profile_photo || null,
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          username: profileData.username,
          profile_photo: profileData.profile_photo || null,
          updated_at: new Date(),
        }
      })
      .returning();

    console.log("Perfil actualizado:", profile);
    return profile;
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    throw error;
  }
}; 