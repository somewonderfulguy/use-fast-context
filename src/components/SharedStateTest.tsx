'use client'

import { type ReactNode, useMemo, useState } from 'react'

import { createStatePublisher } from '../utils/createStatePublisher'
import { useRenderTimes } from '../hooks/useRenderTimes'

type State = {
  theme: 'light' | 'dark'
  language: 'en' | 'pl' | 'ua'
}

const initState: State = {
  theme: 'light',
  language: 'en'
}

type StateString = {
  stringValue: string
}

const initStringState: StateString = {
  stringValue: ''
}

const { Provider, useSharedValue } = createStatePublisher<State>(initState, 'SharedStateContext')
const { Provider: StringProvider, useSharedValue: useSharedString } = createStatePublisher<StateString>(
  initStringState,
  'SharedStringStateContext'
)

const WrapperComponent = ({ children, idx }: { children: ReactNode; idx: string }) => {
  const renderTimes = useRenderTimes()
  return (
    <div className="container">
      <h5 data-testid={`wrapper-${idx}`}>Wrapper ({renderTimes})</h5>
      <div>{children}</div>
    </div>
  )
}

const AnotherWrapperComponent = ({ children, idx }: { children: ReactNode; idx: string }) => {
  const renderTimes = useRenderTimes()
  return (
    <div className="container">
      <h5 data-testid={`another-wrapper-${idx}`}>Another Wrapper ({renderTimes})</h5>
      <div>{children}</div>
    </div>
  )
}

const NestedComponent = ({ children, idx }: { children: ReactNode; idx: string }) => {
  const renderTimes = useRenderTimes()
  return (
    <div className="container">
      <h5 data-testid={`nested-${idx}`}>Nested ({renderTimes})</h5>
      <div className="flex">{children}</div>
    </div>
  )
}

const ThemeConsumer = () => {
  const theme = useSharedValue(
    (state) => state.theme,
    // for test, passing ssrSelector
    (state) => state.theme
  )
  const renderTimes = useRenderTimes()
  return (
    <div className="container">
      <span data-testid="theme-render">Theme ({renderTimes})</span>: <span data-testid="theme-value">{theme}</span>
    </div>
  )
}

const LangConsumer = () => {
  const language = useSharedValue((state) => state.language)
  const renderTimes = useRenderTimes()
  return (
    <div className="container">
      <span data-testid="lang-render">Language ({renderTimes})</span>: <span data-testid="lang-value">{language}</span>
    </div>
  )
}

const StringConsumer = () => {
  const stringValue = useSharedString()
  const renderTimes = useRenderTimes()
  return (
    <div className="container">
      <span data-testid="string-render">String ({renderTimes})</span>:{' '}
      <span data-testid="string-value">{stringValue.stringValue}</span>
    </div>
  )
}

type Lang = 'en' | 'pl' | 'ua'

export const SharedStateTestMemoChildren = () => {
  const [string, setString] = useState('')
  const renderTimes = useRenderTimes()

  const children = useMemo(
    () => (
      <WrapperComponent idx="1">
        <AnotherWrapperComponent idx="1">
          <NestedComponent idx="1">
            <StringConsumer />
          </NestedComponent>
        </AnotherWrapperComponent>
      </WrapperComponent>
    ),
    []
  )

  return (
    <>
      <div className="container">
        <h5 data-testid="global-element-string">Test External Store String ({renderTimes})</h5>
        <input data-testid="input-string" value={string} onChange={(e) => setString(e.target.value)} />
      </div>
      <StringProvider stringValue={string}>{children}</StringProvider>
    </>
  )
}

export const SharedStateTest = () => {
  const [language, setLanguage] = useState<Lang>('en')
  const [checked, setChecked] = useState(false)

  const [input, setInput] = useState('')

  const renderTimes = useRenderTimes()

  return (
    <>
      <div className="container">
        <h5 data-testid="global-element">Test External Store ({renderTimes})</h5>
        <div>
          <label>
            <input
              data-testid="theme-checkbox"
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />{' '}
            Dark Mode
          </label>
        </div>
        <div className="select">
          <label>
            <select data-testid="lang-select" value={language} onChange={(e) => setLanguage(e.target.value as Lang)}>
              <option value="en">English</option>
              <option value="pl">Polski</option>
              <option value="ua">Українська</option>
            </select>
          </label>
        </div>
        <input
          data-testid="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type to re-render locally"
          style={{ margin: '20px 0' }}
        />
      </div>
      <Provider theme={checked ? 'dark' : 'light'} language={language} UNSAFE_stable_children>
        <WrapperComponent idx="0">
          <AnotherWrapperComponent idx="0">
            <NestedComponent idx="0">
              <ThemeConsumer />
              <LangConsumer />
            </NestedComponent>
          </AnotherWrapperComponent>
        </WrapperComponent>
      </Provider>
    </>
  )
}
