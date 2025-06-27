import React from 'react'
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react'
import type { Comment } from '../../types/comment'
import { Fragment } from 'react'
import type { User } from '@supabase/supabase-js'
import { Trash2 } from 'lucide-react'
import { supabase } from '../../core/supabase'

interface CommentViewModalProps {
  isOpen: boolean
  onClose: () => void
  comment: Comment | null
  currentUser?: User
  onDelete?: (commentId: string) => void
}

export function CommentViewModal({ isOpen, onClose, comment, currentUser, onDelete }: CommentViewModalProps) {
  if (!comment) return null

  const isOwner = currentUser && comment.user?.id === currentUser.id

  const handleDelete = async () => {
    if (!comment.id) return
    await supabase.from('comments').delete().eq('id', comment.id)
    if (onDelete) onDelete(comment.id)
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-black/30">
        <DialogPanel className="max-w-lg w-full border bg-white rounded-2xl shadow-lg p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b bg-gray-50">
            <span className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center bg-blue-500 text-white text-base font-bold">
              {comment.user?.username?.split(' ').map(p => p[0]).join('').toUpperCase().substring(0,2)}
            </span>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-semibold text-gray-900 truncate">{comment.user?.username || 'Usuario'}</span>
              <span className="text-xs text-gray-400 truncate">{comment.current_location}</span>
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-sm btn-ghost text-gray-600 border border-gray-200 hover:bg-gray-100"
                onClick={onClose}
                title="Cerrar"
              >
                Cerrar
              </button>
              {isOwner && (
                <button
                  className="btn btn-sm btn-error flex items-center gap-1 text-white border-none hover:bg-red-600"
                  onClick={handleDelete}
                  title="Eliminar comentario"
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              )}
            </div>
          </div>
          {/* Body */}
          <div className="px-6 py-6 bg-white">
            <div className="text-gray-800 text-base whitespace-pre-line">
              {comment.comment}
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
} 