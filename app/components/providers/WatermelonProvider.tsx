"use client"
import { WatermelonProvider } from '../../contexts/WatermelonContext'

export default function Provider({ children }: { children: React.ReactNode }) {
  return <WatermelonProvider>{children}</WatermelonProvider>
}


