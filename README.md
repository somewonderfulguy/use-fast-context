# Use Fast Context

**Optimized React Context that prevents unnecessary re-renders in provider components.**

This library provides two utilities for creating optimized contexts and hooks:
- `createContextStore`: Creates a context and hooks to read and update the store. Ideal for global state management or [Compound Components](https://kentcdodds.com/blog/compound-components-with-react-hooks).
- `createStatePublisher`: Creates a context and a hook to read shared state, passing data through the Provider's children. Perfect for sharing external state down the component tree (e.g., theme or language values from an external Micro Frontend (MFE) host app).

Only components that consume the context value will re-render, and selectors can further optimize updates by limiting re-renders to components that use specific slices of the state.

This library utilizes `useRef` and `useSyncExternalStore` with selectors for efficient context updates.

## Installation

Prerequisites: This library requires React version 18 or higher because it utilizes the `useSyncExternalStore` hook, which is not available in React 17.

React of version 18+ is needed to use this library as it uses `useSyncExternalStore` hook that is not available in React 17.

It is compatible with Next.js, includes the `'use client'` directive, and accepts an optional `ssrSelector` parameter to handle potential hydration issues.

```bash
npm i use-fast-context
# or
yarn add use-fast-context
# or
pnpm add use-fast-context
```

## Usage

`createContextStore` minimal example:

```tsx
import { createContextStore } from 'use-fast-context'

const {
  Provider, useStoreValue, useStoreDispatch
} = createContextStore<{ count: number }>({ count: 0 })

const Value = () => {
  const count = useStoreValue((state) => state.count)
  return <div>{count}</div>
}

const Buttons = () => {
  const dispatch = useStoreDispatch()
  return (
    <>
      <button onClick={() => {
        dispatch((state) => ({ count: state.count + 1 }))
      }}>
        +1
      </button>
      <button onClick={() => dispatch({ count: 100 })}>
        Set 100
      </button>
    </>
  )
}

const App = () => (
  <Provider>
    <Value />
    <Buttons />
  </Provider>
)
```

`createStatePublisher` minimal example:

```tsx
import { createStatePublisher } from 'use-fast-context'

const initialState = { str: '', str2: '' }

const {
  Provider,
  useSharedValue,
} = createStatePublisher<{ str: string; str2: string }>(initialState, 'SharedStateContext')

const Value = () => {
  const str = useSharedValue((state) => state.str)
  return <div>{str}</div>
}

const Value2 = () => {
  const str2 = useSharedValue((state) => state.str2)
  return <div>{str2}</div>
}

const App = () => {
  const [value, setValue] = useState('')
  const [value2, setValue2] = useState('')

  return (
    <>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <input value={value2} onChange={(e) => setValue2(e.target.value)} />

      {/* 
        Using UNSAFE_stable_children to minimize re-renders.
        Alternatively, memoize children with useMemo (see the example below).
      */}
      <Provider str={value} str2={value2} UNSAFE_stable_children>
        <Value />
        <Value2 />
      </Provider>
    </>
  )
}
```

## API

### `createContextStore`

Creates a context and hooks to read and update the store.

#### Signature

```ts
function createContextStore<TStore>(
  initialStore: TStore,
  providerDisplayName?: string
): {
  Provider: React.FC<{ children: React.ReactNode }>
  useStoreValue: {
    (): TStore
    <TSelected>(selector: (store: TStore) => TSelected, ssrSelector?: (store: TStore) => TSelected): TSelected
  }
  useStoreDispatch: () => (update: Partial<TStore> | ((store: TStore) => TStore)) => void
}
```

#### Parameters

Parameter | Type | Description
--- | --- | ---
`initialStore` | `TStore` | The initial store value (can be an object, array, or primitive).
`displayName` | `string` | (Optional) Display name for the Provider component (useful for debugging in React DevTools).

#### Returns

- `Provider`: A React component that provides the store to its children. It should wrap the components that need access to the store.
- `useStoreValue`: A hook to read the store value.
  - **Usage:**
    - `const store = useStoreValue()`: Returns the entire store.
    - `const selectedValue = useStoreValue(selector, ssrSelector?)`: Returns the selected value.
  - **Parameters:**
    - `selector`: A function to select a part of the store.
    - `ssrSelector`: (Optional) A selector function for server-side rendering.
- `useStoreDispatch`: A hook to update the store.
  - **Usage:**
    - `const dispatch = useStoreDispatch()`
    - `dispatch(newState)` or `dispatch(state => newState)`
  - **Behavior:** The component using this hook will re-render only when the store value changes.

### `createStatePublisher`

#### Signature

```ts
function createStatePublisher<TState extends object>(
  initialState: TState,
  displayName?: string
): {
  Provider: React.FC<{ children: React.ReactNode } & TState & { UNSAFE_stable_children?: boolean }>
  useSharedValue: {
    (): TState
    <TSelected>(selector: (state: TState) => TSelected, ssrSelector?: (state: TState) => TSelected): TSelected
  }
}
```

#### Parameters

Parameter | Type | Description
--- | --- | ---
`initialState` | `TState` | The initial state value. It must be an object and defines the shape of the state to be shared.
`displayName` |	`string` | (Optional) Display name for the Provider component (useful for debugging in React DevTools).

#### Returns

- `Provider`: A React component that provides the shared state to its children. It should wrap the components that need access to the state.
  - **Props:**
    - All keys of `TState`: The state values to be shared with the consumers.
    - `children`: The React node(s) that will consume the shared state.
    - `UNSAFE_stable_children`: *(Optional, boolean)* When set to `true`, it minimizes re-renders by assuming that the `children` prop remains stable (does not change between renders). Use with caution, as it can lead to issues if the children actually change.
- `useSharedValue`: A hook to read the shared state.
  - **Usage:**
    - `const state = useSharedValue()`: Returns the entire shared state.
    - `const selectedValue = useSharedValue(selector, ssrSelector?)`: Returns a selected value from the state.
  - **Parameters:**
    - `selector`: A function `(state: TState) => TSelected` to select a part of the state.
    - `ssrSelector`: *(Optional)* A selector function for server-side rendering, used to prevent hydration mismatches.
  - **Behavior:** The component using this hook will only re-render when the selected value changes. If used outside of the Provider, it will throw an error.

- `Provider` - Provider component that should wrap the components that will use the shared state. `children` prop is required. Accepts as props all the keys of the initial state object. Optional `UNSAFE_stable_children` prop (`boolean`) to minimize re-renders. Alternatively, put children inside `useMemo` to memoize them. UNSAFE because it omits possible props changes of children.
- `useSharedValue` - Hook to read the shared state value. If no arguments are passed, it returns the whole state. If a selector function is passed, it returns the selected value. If `ssrSelector` is passed, it will be used on the server side to select the value. Check [React docs](https://react.dev/reference/react/useSyncExternalStore) for `ssrSelector` (`getServerSnapshot` in React docs). Your component will re-render only if the selected value changes. If used outside of the Provider component, it will throw an error.

## Examples

### `createContextStore`

```tsx
import React, { useState } from 'react'
import { createContextStore } from 'use-fast-context'

type InputsStore = { firstName: string; lastName: string }

const {
  Provider: InputsProvider,
  useStoreValue: useInputsValue,
  useStoreDispatch: useInputsDispatch,
} = createContextStore<InputsStore>({ firstName: '', lastName: '' }, 'InputsStore')

// No selector passed, will return the whole store
const Names = () => {
  const { firstName, lastName } = useInputsValue()
  return <p>{firstName} {lastName}</p>
}

// The component will re-render only when `value` changes (selector output)
const Input = ({ name }: { name: 'firstName' | 'lastName' }) => {
  const value = useInputsValue((state) => state[name])
  const dispatch = useInputsDispatch()
  return (
    <input
      value={value}
      onChange={(e) => dispatch({ [name]: e.target.value })}
    />
  )
}

// This component will never re-render as it doesn't rely on the store value
const InputsReset = () => {
  const dispatch = useInputsDispatch()
  return (
    <button onClick={() => dispatch({ firstName: '', lastName: '' })}>
      Reset
    </button>
  )
}

// This component will never re-render as it doesn't rely on the store value
const TransformFirstName = () => {
  const dispatch = useInputsDispatch()
  return (
    <button
      onClick={() =>
        // using function to get the current store (prevState)
        dispatch((state) => ({
          // Make sure to spread unchanged values, otherwise they will be lost
          ...state,
          firstName: state.firstName.toUpperCase()
        }))
      }
    >
      Transform
    </button>
  )
}

const App = () => (
  <InputsProvider>
    <Names />
    <Input name="firstName" />
    <Input name="lastName" />
    <InputsReset />
    <TransformFirstName />
  </InputsProvider>
)
```

### `createStatePublisher`

```tsx
import React, { useState } from 'react'
import { createStatePublisher } from 'use-fast-context'

type State = {
  theme: 'light' | 'dark'
  language: 'en' | 'pl' | 'ua'
}

const initialState: State = {
  theme: 'light',
  language: 'en',
}

const {
  Provider: SharedStateProvider,
  useSharedValue,
} = createStatePublisher<State>(initialState, 'SharedStateContext')

const ThemeComponent = () => {
  const theme = useSharedValue((state) => state.theme)
  return <div>Current Theme: {theme}</div>
}

const LanguageComponent = () => {
  const language = useSharedValue((state) => state.language)
  return <div>Current Language: {language}</div>
}

const App = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [language, setLanguage] = useState<'en' | 'pl' | 'ua'>('en')

  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={theme === 'dark'}
          onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
        />
        Dark Mode
      </label>

      <select value={language} onChange={(e) => setLanguage(e.target.value as State['language'])}>
        <option value="en">English</option>
        <option value="pl">Polski</option>
        <option value="ua">Українська</option>
      </select>

      {/*
        * props `theme` and `language` defined by the initial state
        *
        * UNSAFE_stable_children is to minimize re-renders.
        * As long as children are not changing, it's safe to use it.
        * (see alternative way with useMemo below)
        */}
      <Provider theme={theme} language={language} UNSAFE_stable_children>
        {/* These components might be deeply nested */}
        <Theme />
        <Language />
      </Provider>
    </>
  )
}

// Example of using `useMemo` instead of `UNSAFE_stable_children`
const AppAlt = () => {
  // ... same state as in <App />

  /*
   * It is a valid way to memoize children if you have dependencies, if not, use 
   * UNSAFE_stable_children prop of Provider component.
   */
  const children = useMemo(() => (
    <>
      {/* <SomeComponent someProp={someProp}> */}
      <Theme />
      <Language />
    </>
  ), [/* someProp */])

  return (
    <>
      {/* same inputs as in <App /> */}

      <Provider theme={theme} language={language}>
        {children}
      </Provider>
    </>
  )
}

```

## Why use this library?

**Q: Why not just use React Context?**\
**A:** While React Context is powerful, a known issue is that it can cause all components within the provider to re-render whenever the context value changes. This can lead to performance issues in applications with fast-paced data updates. This library provides optimized context and hooks that ensure only components consuming the context value re-render, improving performance.

**Q: Why not use [Zustand](https://zustand-demo.pmnd.rs/) or [Redux](https://redux.js.org/)?**\
**A:** Zustand and Redux are excellent for global state management but create singleton stores, which may not be suitable for creating local stores for multiple component instances, such as in Compound Components. While libraries like Jotai and Valtio offer mechanisms for multiple store instances, `use-fast-context` provides a minimal and optimized solution specifically for context-based state management without the overhead.

## Notes

- This library was created to address specific performance needs and is designed with a focus on simplicity and efficiency. It is thoroughly tested and documented to ensure reliability for users.
- The concept of optimizing React Context was inspired by [Jack Herrington](https://github.com/jherr)'s video ["Making React Context FAST!"](https://youtu.be/ZKlXqrcBx88?si=7eMalIJspzpESAHX). Building upon this idea, additional features were implemented, such as the `createStatePublisher` utility, to further enhance optimization and address common state-sharing challenges.
