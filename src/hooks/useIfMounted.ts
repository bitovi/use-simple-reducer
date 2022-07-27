import { useCallback, useEffect, useRef } from 'react'

type IfMountedCallback = () => void

const useIfMounted = (): ((func: IfMountedCallback) => void) => {
  const isMounted = useRef(true)

  useEffect(
    () => () => {
      isMounted.current = false
    },
    [],
  )

  const ifMounted = useCallback((func: IfMountedCallback) => {
    if (isMounted.current && func) {
      func()
    }
  }, [])

  return ifMounted
}
export default useIfMounted
