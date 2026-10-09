// Baixa capas para os jogos em src/data/games.json e grava em public/covers/.
// Fontes, em ordem: Steam (steamAppId) → Wikipedia (wikipedia).
// Uso: npm run covers            (só jogos sem capa)
//      npm run covers -- --force (rebaixa todas)
import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataFile = path.join(root, 'src/data/games.json')
const coversDir = path.join(root, 'public/covers')
const force = process.argv.includes('--force')
const UA = 'hub4fun-cover-fetcher/1.0 (personal game hub)'

const exists = (p) => access(p).then(() => true, () => false)

async function download(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' })
  const type = res.headers.get('content-type') ?? ''
  if (!res.ok || !type.startsWith('image/')) return null
  return { buffer: Buffer.from(await res.arrayBuffer()), type }
}

const steamSources = (appId) => [
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900_2x.jpg`,
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`,
]

async function wikipediaSource(title) {
  const api = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replaceAll(' ', '_'))}`
  const res = await fetch(api, { headers: { 'User-Agent': UA } })
  if (!res.ok) return []
  const json = await res.json()
  return [json.originalimage?.source, json.thumbnail?.source].filter(Boolean)
}

const extFor = (type) => ({ 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' })[type] ?? 'jpg'

const games = JSON.parse(await readFile(dataFile, 'utf8'))
await mkdir(coversDir, { recursive: true })

for (const game of games) {
  if (!force && game.cover && (await exists(path.join(root, 'public', game.cover)))) continue

  const sources = []
  if (game.steamAppId) sources.push(...steamSources(game.steamAppId))
  if (game.wikipedia) sources.push(...(await wikipediaSource(game.wikipedia)))

  let saved = null
  for (const src of sources) {
    const img = await download(src).catch(() => null)
    if (!img) continue
    const file = `covers/${game.id}.${extFor(img.type)}`
    await writeFile(path.join(root, 'public', file), img.buffer)
    saved = { file, src }
    break
  }

  if (saved) {
    game.cover = saved.file
    console.log(`✔ ${game.title.padEnd(32)} ${saved.src}`)
  } else {
    delete game.cover
    console.log(`✘ ${game.title.padEnd(32)} sem capa (usa arte gerada)`)
  }
}

await writeFile(dataFile, JSON.stringify(games, null, 2) + '\n')
