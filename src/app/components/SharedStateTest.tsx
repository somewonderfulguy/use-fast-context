'use client'

import { ReactNode, useState } from 'react'

import { createStatePublisher } from '../../hooks/createStatePublisher'
import { useRenderTimes } from '../../hooks/useRenderTimes'

type State = {
  theme: 'light' | 'dark'
  language: 'en' | 'pl' | 'ua'
}

const initState: State = {
  theme: 'light',
  language: 'en'
}

const { Provider, useSharedValue } = createStatePublisher<State>(initState, 'SharedStateContext')

const WrapperComponent = ({ children }: { theme?: string; children: ReactNode }) => {
  const renderTimes = useRenderTimes()
  return (
    <div className="container">
      <h5 data-testid="wrapper">Wrapper ({renderTimes})</h5>
      <div>{children}</div>
    </div>
  )
}

const AnotherWrapperComponent = ({ children }: { theme?: string; children: ReactNode }) => {
  const renderTimes = useRenderTimes()
  return (
    <div className="container">
      <h5 data-testid="another-wrapper">Another Wrapper ({renderTimes})</h5>
      <div>{children}</div>
    </div>
  )
}

const NestedComponent = ({ children }: { children: ReactNode }) => {
  const renderTimes = useRenderTimes()
  return (
    <div className="container">
      <h5 data-testid="nested">Nested ({renderTimes})</h5>
      <div className="flex">{children}</div>
    </div>
  )
}

const ThemeConsumer = () => {
  const theme = useSharedValue((state) => state.theme)
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

type Lang = 'en' | 'pl' | 'ua'

const SharedStateTest = () => {
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
        <WrapperComponent>
          <AnotherWrapperComponent>
            <NestedComponent>
              <ThemeConsumer />
              <LangConsumer />
            </NestedComponent>
          </AnotherWrapperComponent>
        </WrapperComponent>
      </Provider>
    </>
  )
}

export default SharedStateTest
