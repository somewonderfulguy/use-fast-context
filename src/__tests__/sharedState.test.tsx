import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { createStatePublisher } from '@/utils/createStatePublisher'
import { SharedStateTest, SharedStateTestMemoChildren } from '@/components/SharedStateTest'

test('shared state test with UNSAFE_stable_children', async () => {
  render(<SharedStateTest />)

  // global-element
  const getGlobalElement = () => screen.getByTestId('global-element')
  const getThemeCheckbox = () => screen.getByTestId('theme-checkbox')
  const getLangSelect = () => screen.getByTestId('lang-select')
  const getInput = () => screen.getByTestId('input')
  const getLangRender = () => screen.getByTestId('lang-render')
  const getLangValue = () => screen.getByTestId('lang-value')
  const getThemeRender = () => screen.getByTestId('theme-render')
  const getThemeValue = () => screen.getByTestId('theme-value')
  const getWrapper = () => screen.getByTestId('wrapper-0')
  const getAnotherWrapper = () => screen.getByTestId('another-wrapper-0')
  const getNested = () => screen.getByTestId('nested-0')

  // init check
  expect(getGlobalElement()).toHaveTextContent('Test External Store (1)')
  expect(getThemeCheckbox()).not.toBeChecked()
  expect(getLangSelect()).toHaveValue('en')
  expect(getInput()).toHaveValue('')
  expect(getLangRender()).toHaveTextContent('Language (1)')
  expect(getLangValue()).toHaveTextContent('en')
  expect(getThemeRender()).toHaveTextContent('Theme (1)')
  expect(getThemeValue()).toHaveTextContent('light')
  expect(getWrapper()).toHaveTextContent('Wrapper (1)')
  expect(getAnotherWrapper()).toHaveTextContent('Another Wrapper (1)')
  expect(getNested()).toHaveTextContent('Nested (1)')

  // theme change
  await userEvent.click(getThemeCheckbox())
  await userEvent.click(getThemeCheckbox())
  await userEvent.click(getThemeCheckbox())
  expect(getGlobalElement()).toHaveTextContent('Test External Store (4)')
  expect(getThemeCheckbox()).toBeChecked()
  expect(getLangSelect()).toHaveValue('en')
  expect(getInput()).toHaveValue('')
  expect(getLangRender()).toHaveTextContent('Language (1)')
  expect(getLangValue()).toHaveTextContent('en')
  expect(getThemeRender()).toHaveTextContent('Theme (4)')
  expect(getThemeValue()).toHaveTextContent('dark')
  expect(getWrapper()).toHaveTextContent('Wrapper (1)')
  expect(getAnotherWrapper()).toHaveTextContent('Another Wrapper (1)')
  expect(getNested()).toHaveTextContent('Nested (1)')

  // lang change
  fireEvent.change(getLangSelect(), { target: { value: 'ua' } })
  expect(getGlobalElement()).toHaveTextContent('Test External Store (5)')
  expect(getThemeCheckbox()).toBeChecked()
  expect(getLangSelect()).toHaveValue('ua')
  expect(getInput()).toHaveValue('')
  expect(getLangRender()).toHaveTextContent('Language (2)')
  expect(getLangValue()).toHaveTextContent('ua')
  expect(getThemeRender()).toHaveTextContent('Theme (4)')
  expect(getThemeValue()).toHaveTextContent('dark')
  expect(getWrapper()).toHaveTextContent('Wrapper (1)')
  expect(getAnotherWrapper()).toHaveTextContent('Another Wrapper (1)')
  expect(getNested()).toHaveTextContent('Nested (1)')

  // input change
  await userEvent.type(getInput(), 'Yennefer')
  expect(getGlobalElement()).toHaveTextContent('Test External Store (13)')
  expect(getThemeCheckbox()).toBeChecked()
  expect(getLangSelect()).toHaveValue('ua')
  expect(getInput()).toHaveValue('Yennefer')
  expect(getLangRender()).toHaveTextContent('Language (2)')
  expect(getLangValue()).toHaveTextContent('ua')
  expect(getThemeRender()).toHaveTextContent('Theme (4)')
  expect(getThemeValue()).toHaveTextContent('dark')
  expect(getWrapper()).toHaveTextContent('Wrapper (1)')
  expect(getAnotherWrapper()).toHaveTextContent('Another Wrapper (1)')
  expect(getNested()).toHaveTextContent('Nested (1)')
})

test('shared state test without UNSAFE_stable_children', async () => {
  render(<SharedStateTestMemoChildren />)

  const getGlobalElement = () => screen.getByTestId('global-element-string')
  const getInput = () => screen.getByTestId('input-string')
  const getWrapper = () => screen.getByTestId('wrapper-1')
  const getAnotherWrapper = () => screen.getByTestId('another-wrapper-1')
  const getNested = () => screen.getByTestId('nested-1')
  const getStringRender = () => screen.getByTestId('string-render')
  const getStringValue = () => screen.getByTestId('string-value')

  // init check
  expect(getGlobalElement()).toHaveTextContent('Test External Store String (1)')
  expect(getInput()).toHaveValue('')
  expect(getWrapper()).toHaveTextContent('Wrapper (1)')
  expect(getAnotherWrapper()).toHaveTextContent('Another Wrapper (1)')
  expect(getNested()).toHaveTextContent('Nested (1)')
  expect(getStringRender()).toHaveTextContent('String (2)')
  expect(getStringValue()).toHaveTextContent('')

  // input change
  await userEvent.type(getInput(), 'Jaskier')
  expect(getGlobalElement()).toHaveTextContent('Test External Store String (8)')
  expect(getInput()).toHaveValue('Jaskier')
  expect(getWrapper()).toHaveTextContent('Wrapper (1)')
  expect(getAnotherWrapper()).toHaveTextContent('Another Wrapper (1)')
  expect(getNested()).toHaveTextContent('Nested (1)')
  expect(getStringRender()).toHaveTextContent('String (9)')
  expect(getStringValue()).toHaveTextContent('Jaskier')
})

test('should throw an error when useSharedValue is used outside of Provider', () => {
  const { useSharedValue } = createStatePublisher({ theme: 'light', language: 'en' })

  const TestComponent = () => {
    useSharedValue()
    return null
  }

  expect(() => render(<TestComponent />)).toThrow('useSharedValue must be used inside a Provider')
})
