import { useEffect } from 'react'

interface Props {
  message: string
  onDismiss: () => void
}

export default function ErrorToast({ message, onDismiss }: Props) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 6000)
    return () => clearTimeout(id)
  }, [message, onDismiss])

  return (
    <div className="error-toast" role="alert">
      <span>⚠️ {message}</span>
      <button className="error-toast-close" onClick={onDismiss}>✕</button>
    </div>
  )
}
