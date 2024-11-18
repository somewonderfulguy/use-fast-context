'use client'

import { createContextStore } from '../utils/createContextStore'
import { useRenderTimes } from '../hooks/useRenderTimes'

type Store = {
  first: string
  last: string
}

const initState: Store = {
  first: '',
  last: ''
}

const { Provider, useStoreValue, useStoreDispatch } = createContextStore<Store>(initState, 'StoreContext')

const {
  Provider: ProviderPrimitive,
  useStoreValue: useStoreString,
  useStoreDispatch: useSetStoreString
} = createContextStore<string>('', 'StoreContextString')

const TextInput = ({ field }: { field: 'first' | 'last' }) => {
  const value = useStoreValue((store) => store[field])
  const setStore = useStoreDispatch()
  const renderTimes = useRenderTimes()
  return (
    <div className="field">
      <span data-testid={`field-${field}`}>
        {field} ({renderTimes})
      </span>
      : <input data-testid={`input-${field}`} value={value} onChange={(e) => setStore({ [field]: e.target.value })} />
    </div>
  )
}

const Display = ({ field }: { field: 'first' | 'last' }) => {
  const value = useStoreValue(
    (store) => store[field],
    // for test, passing ssrSelector
    (store) => store[field]
  )
  const renderTimes = useRenderTimes()
  return (
    <div className="value">
      <span data-testid={`display-${field}`}>
        {field} ({renderTimes})
      </span>
      : <span data-testid={`display-value-${field}`}>{value}</span>
    </div>
  )
}

const FormContainer = () => {
  const renderTimes = useRenderTimes()
  return (
    <div className="container">
      <h5 data-testid="form-container">FormContainer ({renderTimes})</h5>
      <TextInput field="first" />
      <TextInput field="last" />
    </div>
  )
}

const DisplayContainer = () => {
  const renderTimes = useRenderTimes()
  return (
    <div className="container">
      <h5>DisplayContainer ({renderTimes})</h5>
      <Display field="first" />
      <Display field="last" />
    </div>
  )
}

const ResetButton = () => {
  const setStore = useStoreDispatch()
  const renderTimes = useRenderTimes()
  return (
    <>
      <button data-testid="reset-btn" type="button" onClick={() => setStore(initState)}>
        Reset Form
      </button>{' '}
      <span data-testid="reset-button">({renderTimes})</span>
    </>
  )
}

const InputText = () => {
  const value = useStoreString()
  const setValue = useSetStoreString()
  const renderTimes = useRenderTimes()
  return (
    <div className="container">
      <h5 data-testid="primitive-container">Primitive ({renderTimes})</h5>
      <input data-testid="primitive-input" value={value} onChange={(e) => setValue(e.target.value)} />
      <div className="i-to-1">
        <button
          data-testid="i-to-1"
          type="button"
          onClick={() => setValue((prevValue) => prevValue.replaceAll('i', '1'))}
        >
          i to 1
        </button>
      </div>
    </div>
  )
}

const InputValue = () => {
  const value = useStoreString()
  const renderTimes = useRenderTimes()
  return (
    <div className="container">
      <h5 data-testid="primitive-render-times">Primitive value ({renderTimes})</h5>
      <span data-testid="primitive-value">{value}</span>
    </div>
  )
}

export const StoreTest = () => {
  const renderTimes = useRenderTimes()
  return (
    <Provider>
      <ProviderPrimitive>
        <div className="container">
          <h5 data-testid="global-element">Test Store ({renderTimes})</h5>
          <ResetButton />
          <div className="container">
            <div className="flex">
              <FormContainer />
              <InputText />
            </div>
            <div className="flex">
              <DisplayContainer />
              <InputValue />
            </div>
          </div>
        </div>
      </ProviderPrimitive>
    </Provider>
  )
}
