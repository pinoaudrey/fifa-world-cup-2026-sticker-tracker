import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  isComplete,
  matchesByRound,
  participants,
  pickCount,
  setPick,
} from '../bracket'
import { TeamLabel } from '../components/TeamLabel'
import { useStore } from '../store'
import type { Match } from '../types'

export function EditBracket() {
  const { tournament, getBracket, saveBracket, brackets } = useStore()
  const navigate = useNavigate()
  const { username: usernameParam } = useParams()

  const [username, setUsername] = useState('')
  const [picks, setPicks] = useState<Record<number, string>>({})
  const [saved, setSaved] = useState(false)

  // Load an existing bracket when arriving at /create/:username.
  useEffect(() => {
    if (usernameParam) {
      setUsername(usernameParam)
      setPicks(getBracket(usernameParam)?.picks ?? {})
    } else {
      setUsername('')
      setPicks({})
    }
    setSaved(false)
    // getBracket identity changes with brackets; we only want this on param change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usernameParam])

  const t = tournament!
  const byRound = useMemo(() => matchesByRound(t), [t])
  const total = t.matches.length
  const done = pickCount(picks, t)
  const complete = isComplete(picks, t)

  function choose(match: Match, team: string) {
    setSaved(false)
    setPicks((prev) => setPick(prev, match.id, team, t))
  }

  function handleSave() {
    const name = username.trim()
    if (!name) {
      alert('Enter a username first.')
      return
    }
    const existing = getBracket(name)
    const editingSamePerson =
      usernameParam && usernameParam.toLowerCase() === name.toLowerCase()
    if (existing && !editingSamePerson) {
      const ok = confirm(
        `A bracket for "${existing.username}" already exists. Overwrite it?`,
      )
      if (!ok) return
    }
    saveBracket({ username: name, picks })
    setSaved(true)
  }

  return (
    <div>
      <div className="page-head">
        <h1>{usernameParam ? `Edit bracket: ${usernameParam}` : 'Create bracket'}</h1>
        <p className="muted">
          Pick a winner for each match. Picking a team feeds it into the next
          round; changing an earlier pick clears any later picks that depended on it.
        </p>
      </div>

      <div className="toolbar">
        <label className="field">
          Username
          <input
            type="text"
            value={username}
            placeholder="e.g. alex"
            onChange={(e) => {
              setUsername(e.target.value)
              setSaved(false)
            }}
            disabled={!!usernameParam}
          />
        </label>
        <div className="progress">
          <strong>{done}</strong> / {total} picks
          {complete && <span className="badge ok"> complete</span>}
        </div>
        <button className="primary" onClick={handleSave}>
          Save bracket
        </button>
        {saved && (
          <span className="saved-msg">
            Saved.{' '}
            <a onClick={() => navigate(`/view/${encodeURIComponent(username.trim())}`)}>
              View it →
            </a>
          </span>
        )}
      </div>

      <div className="rounds">
        {t.rounds.map((round) => (
          <section key={round.id} className="round-col">
            <h2>
              {round.name}{' '}
              <span className="muted">({round.points} pt each)</span>
            </h2>
            {byRound[round.id].map((match) => {
              const [a, b] = participants(match, picks)
              const pick = picks[match.id]
              return (
                <div className="match-card" key={match.id}>
                  <div className="match-meta">
                    <span className="match-id">#{match.id}</span>
                    <span className="match-time">{match.datetime}</span>
                  </div>
                  <Slot
                    match={match}
                    slot={0}
                    team={a}
                    selected={pick !== undefined && pick === a}
                    onChoose={choose}
                  />
                  <Slot
                    match={match}
                    slot={1}
                    team={b}
                    selected={pick !== undefined && pick === b}
                    onChoose={choose}
                  />
                </div>
              )
            })}
          </section>
        ))}
      </div>

      {brackets.length > 0 && (
        <p className="muted small">
          {brackets.length} bracket{brackets.length === 1 ? '' : 's'} saved in this browser.
        </p>
      )}
    </div>
  )
}

function Slot({
  match,
  slot,
  team,
  selected,
  onChoose,
}: {
  match: Match
  slot: 0 | 1
  team: string | null
  selected: boolean
  onChoose: (m: Match, team: string) => void
}) {
  if (!team) {
    const feeder = match.feeders?.[slot]
    return (
      <button className="slot disabled" disabled>
        <span className="muted">Winner of #{feeder}</span>
      </button>
    )
  }
  return (
    <button
      className={`slot${selected ? ' selected' : ''}`}
      onClick={() => onChoose(match, team)}
      aria-pressed={selected}
    >
      <TeamLabel team={team} />
    </button>
  )
}
