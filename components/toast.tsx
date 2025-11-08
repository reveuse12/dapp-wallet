'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Copy } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

let toastQueue: Toast[] = []
let setToasts: ((toasts: Toast[]) => void) | null = null

export function showToast(message: string, type: ToastType = 'success') {
  const toast: Toast = {
    id: Date.now().toString(),
    message,
    type
  }
  
  toastQueue.push(toast)
  if (setToasts) {
    setToasts([...toastQueue])
  }
  
  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t.id !== toast.id)
    if (setToasts) {
      setToasts([...toastQueue])
    }
  }, 3000)
}

export function ToastContainer() {
  const [toasts, setToastsState] = useState<Toast[]>([])
  
  useEffect(() => {
    setToasts = setToastsState
    return () => {
      setToasts = null
    }
  }, [])
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium animate-in slide-in-from-right ${
            toast.type === 'success' ? 'bg-green-500' :
            toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
          }`}
        >
          {toast.type === 'success' && <CheckCircle className="w-4 h-4" />}
          {toast.type === 'error' && <XCircle className="w-4 h-4" />}
          {toast.type === 'info' && <Copy className="w-4 h-4" />}
          {toast.message}
        </div>
      ))}
    </div>
  )
}