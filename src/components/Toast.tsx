import { useEffect } from 'react'

interface Props {
  message: string
  show: boolean
  onHide: () => void
}

export function Toast({ message, show, onHide }: Props) {
  useEffect(() => {
    if (!show) return
    const id = setTimeout(onHide, 3000)
    return () => clearTimeout(id)
  }, [show, onHide])

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <div className="bg-stone-800 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-xl whitespace-nowrap">
        {message}
      </div>
    </div>
  )
}
