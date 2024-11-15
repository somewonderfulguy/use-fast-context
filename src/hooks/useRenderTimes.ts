import { useEffect, useRef } from 'react'

export const useRenderTimes = () => {
  const renderTimes = useRef(1)
  useEffect(() => void (renderTimes.current += 1))
  return renderTimes.current
}
