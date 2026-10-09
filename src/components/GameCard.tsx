import { useState, type CSSProperties } from 'react'
import { Play } from 'lucide-react'
import type { Game } from '../types'

interface Props {
  game: Game
  index: number
  onPlay: (game: Game) => void
}

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

const coverSrc = (cover: string) =>
  /^https?:\/\//.test(cover) ? cover : `${import.meta.env.BASE_URL}${cover.replace(/^\//, '')}`

// Matiz estável derivada do id, para capas geradas ficarem sempre iguais.
const hueOf = (id: string) => [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7)

const initialsOf = (title: string) =>
  title
    .split(/[\s/:-]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

export function GameCard({ game, index, onPlay }: Props) {
  const [broken, setBroken] = useState(false)
  const showCover = game.cover && !broken
  const style = { '--i': Math.min(index, 20), '--hue': hueOf(game.id) } as CSSProperties

  return (
    <li className="card" style={style}>
      <a
        className="card__link"
        href={game.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onPlay(game)}
        aria-label={`Jogar ${game.title} (abre em nova aba)`}
      >
        <div className="card__art">
          {showCover ? (
            <img
              src={coverSrc(game.cover!)}
              alt=""
              loading="lazy"
              decoding="async"
              width={600}
              height={900}
              onError={() => setBroken(true)}
            />
          ) : (
            <div className="card__generated" aria-hidden="true">
              <span>{initialsOf(game.title)}</span>
            </div>
          )}
          <span className="card__genre">{game.genre}</span>
          <span className="card__play" aria-hidden="true">
            <Play size={14} fill="currentColor" /> JOGAR
          </span>
        </div>
        <div className="card__meta">
          <h3 className="card__title">{game.title}</h3>
          <p className="card__sub">{game.subtitle ?? hostOf(game.url)}</p>
        </div>
      </a>
    </li>
  )
}
