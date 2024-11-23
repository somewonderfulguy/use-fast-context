'use client'

import { useRef, createContext, useContext, useCallback, type ReactNode, useMemo, useSyncExternalStore } from 'react'

/**
 * Creates a context-based store with optimized re-rendering using `useSyncExternalStore`.
 *
 * This utility sets up a React context store that minimizes re-renders by allowing components
 * to subscribe only to specific parts of the state (using selectors). It internally uses two
 * contexts: one for the store's value and one for the dispatch function to update the store.
 *
 * @param initialState - The initial state of the store. Object or primitive.
 * @param displayName - Optional display name for the context provider, useful for debugging.
 *
 * @returns An object containing:
 * - `Provider`: A React component to wrap your app and provide the store.
 * - `useStoreValue`: A hook to access the store's state with optional selectors.
 * - `useStoreDispatch`: A hook to update the store's state.
 *
 * @example
 * // Create a store with an initial state
 * const { Provider, useStoreValue, useStoreDispatch } = createContextStore<{ count: number }>({ count: 0 });
 *
 * // Use the Provider to wrap your application
 * const App = () => (
 *   <Provider>
 *     <CounterDisplay />
 *     <CounterUpdate />
 *   </Provider>
 * )
 *
 * // Use the store's state in your components
 * const CounterDisplay = () => {
 *   const count = useStoreValue((state) => state.count)
 *   return <div>Count: {count}</div>
 * }
 *
 * // Update the store's state in your components
 * const CounterUpdate = () => {
 *   const setCount = useStoreDispatch()
 *
 *   const increment = () => setCount((prev) => ({ count: prev.count + 1 }))
 *   const decrement = () => setCount((prev) => ({ count: prev.count - 1 }))
 *
 *   return (
 *     <div>
 *      <button onClick={increment}>+1</button>
 *      <button onClick={decrement}>-1</button>
 *     </div>
 *   )
 * }
 */
export function createContextStore<TStore>(initialState: TStore, displayName?: string) {
  type PrevStateFnUpdate = (prevValue: TStore) => TStore
  const useStoreData = (): {
    get: () => TStore
    set: (value: Partial<TStore> | PrevStateFnUpdate) => void
    subscribe: (callback: () => void) => () => void
  } => {
    const store = useRef(initialState)

    const subscribers = useRef(new Set<() => void>())

    const get = useCallback(() => store.current, [])

    const set = useCallback((value: Partial<TStore> | PrevStateFnUpdate) => {
      if (typeof value === 'function') {
        store.current = value(store.current)
      } else if (typeof value !== 'object') {
        store.current = value as TStore
      } else {
        store.current = { ...store.current, ...value }
      }
      subscribers.current.forEach((callback) => callback())
    }, [])

    const subscribe = useCallback((callback: () => void) => {
      subscribers.current.add(callback)
      return () => subscribers.current.delete(callback)
    }, [])

    return {
      get,
      set,
      subscribe
    }
  }

  type UseStoreDataReturnType = ReturnType<typeof useStoreData>

  const StoreValueContext = createContext<Omit<UseStoreDataReturnType, 'set'> | undefined>(undefined)
  const StoreDispatchContext = createContext<UseStoreDataReturnType['set'] | undefined>(undefined)

  const Provider = ({ children }: { children: ReactNode }) => {
    const { get, set, subscribe } = useStoreData()
    return (
      <StoreDispatchContext.Provider value={set}>
        <StoreValueContext.Provider value={useMemo(() => ({ get, subscribe }), [get, subscribe])}>
          {children}
        </StoreValueContext.Provider>
      </StoreDispatchContext.Provider>
    )
  }
  if (displayName) Provider.displayName = displayName

  function useStoreValue(): TStore
  function useStoreValue<TSelectorOutput>(
    selector: (store: TStore) => TSelectorOutput,
    ssrSelector?: (store: TStore) => TSelectorOutput
  ): TSelectorOutput
  function useStoreValue<TSelectorOutput = TStore>(
    selector?: (store: TStore) => TSelectorOutput,
    ssrSelector?: (store: TStore) => TSelectorOutput
  ): TSelectorOutput | TStore {
    const store = useContext(StoreValueContext)

    if (store === undefined) {
      throw new Error(`useStoreValue must be used inside a ${displayName || 'Provider'}`)
    }

    const getSnapshot = () => {
      const currentStore = store.get()
      return selector ? selector(currentStore) : currentStore
    }

    return useSyncExternalStore(store.subscribe, getSnapshot, ssrSelector ? () => ssrSelector(store.get()) : undefined)
  }

  const useStoreDispatch = () => {
    const set = useContext(StoreDispatchContext)
    if (set === undefined) {
      throw new Error(`useStoreDispatch must be used inside a ${displayName || 'Provider'}`)
    }
    return set
  }

  return {
    Provider,
    /**
     * Hook to access the store's state.
     *
     * Returns the entire store state or a selected part of it if a selector function is provided.
     * Utilizes `useSyncExternalStore` for efficient updates and re-rendering.
     *
     * @typeParam SelectorOutput - The type of the selected output.
     * @param selector - Optional. A function to select a part of the store state. If not provided, returns the entire state.
     * @param ssrSelector - Optional. A function to select a part of the store state during SSR. If not provided, default `useSyncExternalStore` behavior is used.
     *
     * @returns The current state or the selected part of the store state.
     *
     * @example
     * // Access the entire store state
     * const state = useStoreValue()
     *
     * // Access a specific part of the store state
     * const count = useStoreValue(state => state.count)
     */
    useStoreValue,
    /**
     * Hook to update the store's state.
     *
     * Provides a `set` function that can update the store by merging partial state updates
     * or by providing a function that receives the previous state and returns a new state.
     *
     * @returns A function to update the store's state.
     *
     * @example
     * const setStore = useStoreDispatch()
     *
     * // Update specific keys in the store
     * setStore({ count: 10 })
     *
     * // Update based on previous state
     * setStore(prevState => ({ count: prevState.count + 1 }))
     *
     * // If primitive, like string, update the entire store
     * setStore('new value')
     */
    useStoreDispatch
  }
}
