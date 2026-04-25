import { useState, useEffect } from 'react'

const MESSAGES = [
  'Writing your story...',
  'Drawing the pictures...',
  'Preparing the voices...',
  'Almost ready...',
  'Still working on it...',
  'Just a moment more...',
]

export default function LoadingScreen() {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % MESSAGES.length)
    }, 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="screen loading-screen">
      <div className="orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <p key={msgIndex} className="loading-message">{MESSAGES[msgIndex]}</p>
    </div>
  )
}
