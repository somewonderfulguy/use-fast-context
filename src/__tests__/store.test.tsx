import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { createContextStore } from '@/utils/createContextStore'
import { StoreTest } from '@/components/StoreTest'

test('store test', async () => {
  render(<StoreTest />)

  const getGlobalElement = () => screen.getByTestId('global-element')
  const getResetButton = () => screen.getByTestId('reset-button')
  const getFormContainer = () => screen.getByTestId('form-container')
  const getField = (field: 'first' | 'last') => screen.getByTestId(`field-${field}`)
  const getInput = (field: 'first' | 'last') => screen.getByTestId(`input-${field}`)
  const getDisplay = (field: 'first' | 'last') => screen.getByTestId(`display-${field}`)
  const getDisplayValue = (field: 'first' | 'last') => screen.getByTestId(`display-value-${field}`)
  const getPrimitiveContainer = () => screen.getByTestId('primitive-container')
  const getPrimitiveInput = () => screen.getByTestId('primitive-input')
  const getPrimitiveRenderTimes = () => screen.getByTestId('primitive-render-times')
  const getPrimitiveValue = () => screen.getByTestId('primitive-value')

  // initial render times check
  expect(getGlobalElement()).toHaveTextContent('Test Store (1)')
  expect(getResetButton()).toHaveTextContent('(1)')
  expect(getFormContainer()).toHaveTextContent('FormContainer (1)')
  expect(getField('first')).toHaveTextContent('first (1)')
  expect(getField('last')).toHaveTextContent('last (1)')
  expect(getDisplay('first')).toHaveTextContent('first (1)')
  expect(getDisplay('last')).toHaveTextContent('last (1)')
  expect(getDisplayValue('first')).toHaveTextContent('')
  expect(getDisplayValue('last')).toHaveTextContent('')
  expect(getPrimitiveContainer()).toHaveTextContent('Primitive (1)')
  expect(getPrimitiveRenderTimes()).toHaveTextContent('(1)')
  expect(getPrimitiveValue()).toHaveTextContent('')

  // type in first name
  await userEvent.type(getInput('first'), 'Geralt')
  expect(getGlobalElement()).toHaveTextContent('Test Store (1)')
  expect(getResetButton()).toHaveTextContent('(1)')
  expect(getFormContainer()).toHaveTextContent('FormContainer (1)')
  expect(getField('first')).toHaveTextContent('first (7)')
  expect(getField('last')).toHaveTextContent('last (1)')
  expect(getDisplay('first')).toHaveTextContent('first (7)')
  expect(getDisplay('last')).toHaveTextContent('last (1)')
  expect(getDisplayValue('first')).toHaveTextContent('Geralt')
  expect(getDisplayValue('last')).toHaveTextContent('')
  expect(getPrimitiveContainer()).toHaveTextContent('Primitive (1)')
  expect(getPrimitiveRenderTimes()).toHaveTextContent('(1)')
  expect(getPrimitiveValue()).toHaveTextContent('')

  // type in last name
  await userEvent.type(getInput('last'), 'of Rivia')
  expect(getGlobalElement()).toHaveTextContent('Test Store (1)')
  expect(getResetButton()).toHaveTextContent('(1)')
  expect(getFormContainer()).toHaveTextContent('FormContainer (1)')
  expect(getField('first')).toHaveTextContent('first (7)')
  expect(getField('last')).toHaveTextContent('last (9)')
  expect(getDisplay('first')).toHaveTextContent('first (7)')
  expect(getDisplay('last')).toHaveTextContent('last (9)')
  expect(getDisplayValue('first')).toHaveTextContent('Geralt')
  expect(getDisplayValue('last')).toHaveTextContent('of Rivia')
  expect(getPrimitiveContainer()).toHaveTextContent('Primitive (1)')
  expect(getPrimitiveRenderTimes()).toHaveTextContent('(1)')
  expect(getPrimitiveValue()).toHaveTextContent('')

  // reset form
  await userEvent.click(screen.getByTestId('reset-btn'))
  expect(getGlobalElement()).toHaveTextContent('Test Store (1)')
  expect(getResetButton()).toHaveTextContent('(1)')
  expect(getFormContainer()).toHaveTextContent('FormContainer (1)')
  expect(getField('first')).toHaveTextContent('first (8)')
  expect(getField('last')).toHaveTextContent('last (10)')
  expect(getDisplay('first')).toHaveTextContent('first (8)')
  expect(getDisplay('last')).toHaveTextContent('last (10)')
  expect(getDisplayValue('first')).toHaveTextContent('')
  expect(getDisplayValue('last')).toHaveTextContent('')
  expect(getPrimitiveContainer()).toHaveTextContent('Primitive (1)')
  expect(getPrimitiveRenderTimes()).toHaveTextContent('(1)')
  expect(getPrimitiveValue()).toHaveTextContent('')

  // type in primitive
  await userEvent.type(getPrimitiveInput(), 'Ciri')
  expect(getGlobalElement()).toHaveTextContent('Test Store (1)')
  expect(getResetButton()).toHaveTextContent('(1)')
  expect(getFormContainer()).toHaveTextContent('FormContainer (1)')
  expect(getField('first')).toHaveTextContent('first (8)')
  expect(getField('last')).toHaveTextContent('last (10)')
  expect(getDisplay('first')).toHaveTextContent('first (8)')
  expect(getDisplay('last')).toHaveTextContent('last (10)')
  expect(getDisplayValue('first')).toHaveTextContent('')
  expect(getDisplayValue('last')).toHaveTextContent('')
  expect(getPrimitiveContainer()).toHaveTextContent('Primitive (5)')
  expect(getPrimitiveRenderTimes()).toHaveTextContent('(5)')
  expect(getPrimitiveValue()).toHaveTextContent('Ciri')
  await userEvent.click(screen.getByTestId('i-to-1'))
  expect(getPrimitiveContainer()).toHaveTextContent('Primitive (6)')
  expect(getPrimitiveRenderTimes()).toHaveTextContent('(6)')
  expect(getPrimitiveValue()).toHaveTextContent('C1r1')
})

test('should throw an error when useStoreDispatch is used outside of Provider', () => {
  const { useStoreDispatch } = createContextStore({ count: 0 })

  const TestComponent = () => {
    useStoreDispatch()
    return null
  }

  expect(() => render(<TestComponent />)).toThrow('useStoreDispatch must be used inside a Provider')
})

test('should throw an error when useStoreValue is used outside of Provider', () => {
  const { useStoreValue } = createContextStore({ count: 0 })

  const TestComponent = () => {
    useStoreValue()
    return null
  }

  expect(() => render(<TestComponent />)).toThrow('useStoreValue must be used inside a Provider')
})
