import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Dices, Gamepad2, Search, X } from 'lucide-react'
import gamesData from './data/games.json'
import type { Game } from './types'
import { GameCard } from './components/GameCard'

const games = gamesData as Game[]
const ALL = 'Todos'
const RECENT_KEY = 'hub4fun:recent'
const RECENT_MAX = 6

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function loadRecent(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
    return Array.isArray(raw) ? raw.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

export default function App() {
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState(ALL)
  const [recent, setRecent] = useState<string[]>(loadRecent)
  const searchRef = useRef<HTMLInputElement>(null)

  const genres = useMemo(() => {
    const counts = new Map<string, number>()
    for (const g of games) counts.set(g.genre, (counts.get(g.genre) ?? 0) + 1)
    return [[ALL, games.length] as const, ...counts.entries()]
  }, [])

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    return games.filter(
      (g) =>
        (genre === ALL || g.genre === genre) &&
        (!q || normalize(`${g.title} ${g.subtitle ?? ''} ${g.genre}`).includes(q)),
    )
  }, [query, genre])

  const recentGames = useMemo(
    () => recent.map((id) => games.find((g) => g.id === id)).filter((g): g is Game => !!g),
    [recent],
  )

  const recordPlay = useCallback((game: Game) => {
    setRecent((prev) => {
      const next = [game.id, ...prev.filter((id) => id !== game.id)].slice(0, RECENT_MAX)
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next))
      } catch {
        /* armazenamento indisponível: segue sem histórico */
      }
      return next
    })
  }, [])

  const playRandom = () => {
    const pool = filtered.length ? filtered : games
    const pick = pool[Math.floor(Math.random() * pool.length)]
    window.open(pick.url, '_blank', 'noopener,noreferrer')
    recordPlay(pick)
  }

  // "/" foca a busca, Esc limpa.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLInputElement
      if (e.key === '/' && !typing) {
        e.preventDefault()
        searchRef.current?.focus()
      } else if (e.key === 'Escape' && typing) {
        setQuery('')
        searchRef.current?.blur()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const browsing = !query && genre === ALL

  return (
    <>
      <div className="backdrop" aria-hidden="true">
        <div className="backdrop__sun" />
        <div className="backdrop__grid" />
      </div>
      <div className="scanlines" aria-hidden="true" />

      <header className="hero">
        <div className="hero__inner">
          <p className="hero__coin">
            <span className="blink">▶</span> INSERT COIN
          </p>
          <h1 className="logo">
            <Gamepad2 className="logo__icon" aria-hidden="true" />
            <span>
              HUB<em>4</em>FUN
            </span>
          </h1>
          <p className="hero__tagline">
            Seu fliperama no navegador. {games.length} jogos prontos — escolha um e aperte start.
          </p>

          <div className="controls">
            <label className="search">
              <Search size={18} aria-hidden="true" />
              <span className="sr-only">Buscar jogo</span>
              <input
                ref={searchRef}
                type="search"
                placeholder="Buscar jogo…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              {query ? (
                <button type="button" className="search__clear" onClick={() => setQuery('')} aria-label="Limpar busca">
                  <X size={16} />
                </button>
              ) : (
                <kbd aria-hidden="true">/</kbd>
              )}
            </label>
            <button type="button" className="btn-random" onClick={playRandom}>
              <Dices size={18} aria-hidden="true" />
              Aleatório
            </button>
          </div>

          <nav className="chips" aria-label="Filtrar por gênero">
            {genres.map(([name, count]) => (
              <button
                key={name}
                type="button"
                className="chip"
                aria-pressed={genre === name}
                onClick={() => setGenre(name)}
              >
                {name} <span className="chip__count">{count}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="content">
        {browsing && recentGames.length > 0 && (
          <section aria-labelledby="recent-title" className="section">
            <h2 id="recent-title" className="section__title">
              Continue jogando
            </h2>
            <ul className="grid grid--rail">
              {recentGames.map((g, i) => (
                <GameCard key={g.id} game={g} index={i} onPlay={recordPlay} />
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="all-title" className="section">
          <h2 id="all-title" className="section__title">
            {browsing ? 'Todos os jogos' : `${filtered.length} resultado${filtered.length === 1 ? '' : 's'}`}
          </h2>
          {filtered.length > 0 ? (
            <ul className="grid" key={`${genre}|${query}`}>
              {filtered.map((g, i) => (
                <GameCard key={g.id} game={g} index={i} onPlay={recordPlay} />
              ))}
            </ul>
          ) : (
            <div className="empty">
              <p className="empty__title">GAME OVER</p>
              <p>Nenhum jogo encontrado para “{query}”.</p>
              <button
                type="button"
                className="chip"
                onClick={() => {
                  setQuery('')
                  setGenre(ALL)
                }}
              >
                Continuar?
              </button>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>
          Os jogos abrem em uma nova aba e pertencem aos seus respectivos sites. Para cadastrar um jogo, edite{' '}
          <code>src/data/games.json</code>.
        </p>
      </footer>
    </>
  )
}
