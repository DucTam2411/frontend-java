import { useEffect, useMemo, useReducer } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

export function useDateDistance(date: string | Date) {
  const [value, rerender] = useReducer((state) => !state, false)

  useEffect(() => {
    const interval = setInterval(() => {
      rerender()
    }, 1000 * 60)
    return () => clearInterval(interval)
  }, [])

  const formatted = useMemo(() => {
    const d = date instanceof Date ? date : new Date(date)
    console.log('🚀 TAM ~ file: useDateDistance.ts:18 ~ formatted ~ d :', d)
    const diff = Date.now() - d.getTime()

    if (diff < 60 * 1000) {
      return 'now'
    }

    return formatDistanceToNow(d, {
      addSuffix: true,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, value])

  return formatted
}
