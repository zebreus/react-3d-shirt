import { Dispatch, useCallback, useEffect, useState } from "react"
import { unstable_batchedUpdates } from "react-dom"

const globalMap: Record<string, Record<string, unknown>> = {}

/**
 * Get a global value by map and key
 *
 * @param map The name of the map that contains the value
 * @param key The key of the map that contains the value
 * @returns The value or undefined
 */
export function getGlobalValue<Type>(map: string, key: string) {
  return globalMap[map]?.[key] as Type | undefined
}

/**
 * Set a global value by map and key.
 * Does nothing, if newValue is equal to the current value.
 * Will trigger all useGlobalValue hooks with the same map and key
 *
 * @param map The name of the map that contains the value
 * @param key The key of the map that contains the value
 * @param newValue The new value.
 */
export function setGlobalValue<Type>(map: string, key: string, newValue: Type) {
  const oldValue = globalMap[map]?.[key] as Type | undefined
  if (oldValue === newValue) {
    return
  }
  if (!globalMap[map]) {
    globalMap[map] = {}
  }

  // eslint-disable-next-line @typescript-eslint/no-extra-semi
  ;(globalMap[map] as Record<string, unknown>)[key] = newValue
  if (!map.startsWith("_cb")) {
    const callbackMap = "_cb" + map
    const callbacks = getGlobalValue<Array<(value: Type) => void>>(callbackMap, key) || []
    // This function is recommended by the react team https://github.com/facebook/react/issues/16377
    unstable_batchedUpdates(() => callbacks.forEach(callback => callback(newValue)))
  }
}

// Callable things can only be set with a function, because of ambiguity
// eslint-disable-next-line @typescript-eslint/ban-types
type SetValueAction<Type> = Type extends Function ? (prevState: Type) => Type : Type | ((prevState: Type) => Type)

/**
 * Listens to a global value addressed by map and key.
 * Works similar to useState, but all useGlobalValues with the same key on the same map share their data.
 *
 * @param map The name of the map that contains the value
 * @param key The key of the map that contains the value
 * @param defaultValue A default value that is used if no value is set for the map/key pair. The default value is not global
 * @returns An array with the value and a setter. If Type is a function type, this only takes a function, that produces a new value
 */
export function useGlobalValue<Type>(
  map: string,
  key: string,
  defaultValue: Type
): [Type, Dispatch<SetValueAction<Type>>]
export function useGlobalValue<Type>(
  map: string,
  key: string,
  defaultValue?: Type
): [Type | undefined, Dispatch<SetValueAction<Type>>]
export function useGlobalValue<Type>(
  map: string,
  key: string,
  defaultValue?: Type
): [Type | undefined, Dispatch<SetValueAction<Type>>] {
  const [, setRealValue] = useState<Type | undefined>()
  const value = getGlobalValue<Type>(map, key) || defaultValue

  // if (defaultValue !== undefined && getGlobalValue<Type>(map, key) === undefined) {
  //   const realDefaultValue =
  //     typeof defaultValue === "function" ? defaultValue(getGlobalValue<Type>(map, key)) : defaultValue
  //   setGlobalValue(map, key, realDefaultValue)
  // }
  // const value = getGlobalValue<Type>(map, key)

  const setter: Dispatch<SetValueAction<Type>> = useCallback(
    newValue => {
      if (typeof newValue === "function") {
        newValue
        const oldValue = getGlobalValue<Type>(map, key)
        setGlobalValue(map, key, newValue(oldValue))
        return
      }
      setGlobalValue(map, key, newValue)
    },
    [map, key]
  )

  useEffect(() => {
    const callbackMap = "_cb" + map

    const callback = (newValue: Type) => {
      setRealValue(newValue)
    }
    const addCallback = () => {
      const callbacks = [...(getGlobalValue<Array<(value: Type) => void>>(callbackMap, key) || []), callback]
      setGlobalValue(callbackMap, key, callbacks)
    }
    const removeCallback = () => {
      const callbacks =
        getGlobalValue<Array<(value: Type) => void>>(callbackMap, key)?.filter(
          otherCallback => otherCallback !== callback
        ) || []
      setGlobalValue(callbackMap, key, callbacks)
    }

    addCallback()
    return removeCallback
  }, [map, key])

  return [value, setter]
}
