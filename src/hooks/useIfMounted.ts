import { useCallback, useEffect, useRef } from 'react'

const useIfMounted = () => {
  const isMounted = useRef(true)
  useEffect(
    () => () => {
      isMounted.current = false
    },
    [],
  )

  const ifMounted = useCallback((func: (...args: any[]) => any) => {
    if (isMounted.current && func) {
      func()
    }
  }, [])
  return ifMounted
}
export default useIfMounted
