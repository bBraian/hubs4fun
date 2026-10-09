export interface Game {
  id: string
  title: string
  subtitle?: string
  url: string
  genre: string
  /** Caminho relativo a public/ (preenchido por `npm run covers`) ou URL absoluta. */
  cover?: string
  /** Usado só pelo script de capas. */
  steamAppId?: number
  wikipedia?: string
}
