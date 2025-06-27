import React from 'react'
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react'
import type { Comment } from '../../types/comment'
import { Fragment } from 'react'

interface CommentViewModalProps {
  isOpen: boolean
  onClose: () => void
  comment: Comment | null
}

export function CommentViewModal({ isOpen, onClose, comment }: CommentViewModalProps) {
  if (!comment) return null

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-black/20">
        <DialogPanel className="max-w-lg w-full space-y-4 border bg-white p-8 rounded-lg">
          <DialogTitle className="font-bold text-lg flex items-center gap-2">
            <span className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center bg-blue-500 text-white text-xs font-semibold">
              {comment.user?.username?.split(' ').map(p => p[0]).join('').toUpperCase().substring(0,2)}
            </span>
            <span>{comment.user?.username || 'Usuario'}</span>
          </DialogTitle>
          <Description className="text-gray-500 text-xs">
            {comment.current_location}
          </Description>
          <div className="text-gray-800 text-base whitespace-pre-line">
            {comment.comment}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
} 