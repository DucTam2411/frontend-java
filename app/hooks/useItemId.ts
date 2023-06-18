import { useParams } from '@remix-run/react'

/**
 * Returns itemId URL parameter in items page
 */
export function useItemId() {
  const { itemId } = useParams<{ itemId: string }>()
  const parsed = itemId ?? null
  return parsed
}
