'use client'

import { useEffect, useRef } from 'react'

interface AdComponentProps {
  className?: string
}

export default function AdComponent({ className = '' }: AdComponentProps) {
  const adContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Create a new script element
    const script = document.createElement('script')
    script.src = '//www.highperformanceformat.com/254552b61f462d259783d3c8d1517810/invoke.js'
    script.async = true


    // Cleanup
    return () => {
      script.remove()
      if (adContainerRef.current) {
        while (adContainerRef.current.firstChild) {
          adContainerRef.current.removeChild(adContainerRef.current.firstChild)
        }
      }
    }
  }, [])

  return (
    <div className={`relative min-h-[250px] w-[300px] ${className}`}>
      <div ref={adContainerRef} className="ad-container" />
    </div>
  )
}