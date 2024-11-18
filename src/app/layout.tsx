import type { ReactNode } from 'react'

import '@/styles/globals.css'

type Props = {
  children: ReactNode
}

const RootLayout = ({ children }: Props) => (
  <html lang="en">
    <body>{children}</body>
  </html>
)

export default RootLayout
