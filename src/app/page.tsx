import { SharedStateTest, SharedStateTestMemoChildren } from '@/components/SharedStateTest'
import { StoreTest } from '@/components/StoreTest'

export default function TestUI() {
  return (
    <>
      <StoreTest />
      <hr />
      <SharedStateTest />
      <SharedStateTestMemoChildren />
    </>
  )
}
