'use client'

import {
  useRef,
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
  useEffect,
  useMemo
} from 'react'

/**
 * Creates a shared state publisher with optimized updates using `useSyncExternalStore`.
 * The idea is to share external state across components without unnecessary re-renders.
 * Components can subscribe to specific parts of the state using selectors, but they can't update it.
 * Updating state is done only by passing props to the `Provider` component.
 *
 * @param initialState - The initial state of the shared store.
 * @param displayName - Optional display name for the context, useful for debugging.
 *
 * @returns An object containing:
 * - `Provider`: A React component to wrap your app and provide the shared state.
 * - `useSharedValue`: A hook to access the shared state with optional selectors.
 *
 * @example
 * type Theme = 'light' | 'dark'
 * type Language = 'en_US' | 'pl_PL'
 * type Store = { theme: Theme; language: Language }
 *
 * const { Provider, useSharedValue } = createStatePublisher<Store>(
 *   { theme: 'light'; language: 'en_US' }
 * )
 *
 * // Assume App used in other application by module federation, for example and it
 * // receives theme and language from the external app
 * // And theme and language need to be shared across the app
 * const App = ({ theme, language }: Store) => (
 *   <Provider>
 *     <UserProfile />
 *   </Provider>
 * )
 *
 * const UserProfile = () => {
 *   const theme = useSharedValue((state) => state.theme)
 *   const language = useSharedValue((state) => state.language)
 *   return (
 *     <div>Theme: {theme}. Language: {language}.</div>
 *   )
 * }
 */
export function createStatePublisher<TSharedState extends object>(initialState: TSharedState, displayName?: string) {
  const useSharedState = (): {
    get: () => TSharedState
    set: (value: Partial<TSharedState>) => void
    subscribe: (callback: () => void) => () => void
  } => {
    const state = useRef(initialState)

    const subscribers = useRef(new Set<() => void>())

    const get = useCallback(() => state.current, [])

    const set = useCallback((value: Partial<TSharedState>) => {
      state.current = { ...state.current, ...value }
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

  type UseStoreDataReturnType = ReturnType<typeof useSharedState>

  const PublisherContext = createContext<Omit<UseStoreDataReturnType, 'set'> | undefined>(undefined)

  type ProviderProps = TSharedState & { UNSAFE_stable_children?: boolean; children: ReactNode }

  const Provider = ({ children, UNSAFE_stable_children, ...rest }: ProviderProps) => {
    const { get, set, subscribe } = useSharedState()

    useEffect(() => {
      set(rest as TSharedState)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [set, Object.values(rest)])

    // If `UNSAFE_stable_children` is true, ignore changes in `children`
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const element = useMemo(() => children, UNSAFE_stable_children ? [] : [children])

    return (
      <PublisherContext.Provider value={useMemo(() => ({ get, subscribe }), [get, subscribe])}>
        {element}
      </PublisherContext.Provider>
    )
  }
  if (displayName) Provider.displayName = displayName

  function useSharedValue(): TSharedState
  function useSharedValue<SelectorOutput>(selector: (sharedState: TSharedState) => SelectorOutput): SelectorOutput
  function useSharedValue<SelectorOutput>(
    selector?: (sharedState: TSharedState) => SelectorOutput,
    ssrSelector?: (sharedState: TSharedState) => SelectorOutput
  ) {
    const sharedState = useContext(PublisherContext)

    if (sharedState === undefined) {
      throw new Error('useSharedState must be used inside a Provider')
    }

    const getSnapshot = () => {
      const currentSharedState = sharedState.get()
      return selector ? selector(currentSharedState) : currentSharedState
    }

    return useSyncExternalStore(
      sharedState.subscribe,
      getSnapshot,
      ssrSelector ? () => ssrSelector(sharedState.get()) : undefined
    )
  }

  return {
    Provider,
    /**
     * A hook to access the shared state with optional selectors.
     * @param selector - Optional selector function to get a specific part of the shared state. If not provided, returns the entire state.
     * @param ssrSelector - Optional selector function to get a specific part of the shared state during server-side rendering. If not provided, default `useSyncExternalStore` behavior is used.
     *
     * @returns The shared state or a selected part of it.
     *
     * @example
     * const theme = useSharedValue((state) => state.theme)
     * const language = useSharedValue((state) => state.language)
     *
     * @example
     * const { theme, language } = useSharedValue()
     */
    useSharedValue
  }
}
