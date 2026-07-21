'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

type UseDebouncedRouteSearchParams = {
  initialSearch: string
  pathname: string
  query?: Record<string, string>
}

export function useDebouncedRouteSearch({
  initialSearch,
  pathname,
  query = {},
}: UseDebouncedRouteSearchParams) {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState(initialSearch)
  const queryKey = new URLSearchParams(query).toString()

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams(queryKey)
    const trimmedSearchValue = searchValue.trim()

    if (trimmedSearchValue) {
      params.set('search', trimmedSearchValue)
    } else {
      params.delete('search')
    }

    const nextQueryString = params.toString()

    return nextQueryString ? `${pathname}?${nextQueryString}` : pathname
  }, [pathname, queryKey, searchValue])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      router.replace(buildUrl())
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [buildUrl, router])

  function submitSearch() {
    router.push(buildUrl())
  }

  return {
    searchValue,
    setSearchValue,
    submitSearch,
  }
}
