import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Sin `globals: true` en vite.config.ts, RTL no detecta automáticamente
// el hook `afterEach` para desmontar componentes entre tests. Lo registramos
// a mano para que cada test arranque con un DOM limpio.
afterEach(() => {
  cleanup()
})
