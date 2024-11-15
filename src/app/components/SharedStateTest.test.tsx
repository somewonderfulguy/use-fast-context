import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import SharedStateTest from './SharedStateTest'

test('shared state test', async () => {
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
  const getWrapper = () => screen.getByTestId('wrapper')
  const getAnotherWrapper = () => screen.getByTestId('another-wrapper')
  const getNested = () => screen.getByTestId('nested')

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
