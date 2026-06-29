import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { eliminatedTeams, matchesByRound, participants } from '../bracket'
import { TeamLabel } from '../components/TeamLabel'
import { scoreBracket } from '../scoring'
import { useStore } from '../store'
import type { Match } from '../types'

type PickStatus = 'correct' | 'wrong' | 'pending' | 'none'

/**
 * Coloring rules:
 *  - correct  (green):  the match has a result and the pick matches it.
 *  - wrong    (red):    the match has a result and the pick doesn't match it,
 *                       OR the picked team has already been eliminated in
 *                       reality (lost an earlier real match), even if this
 *                       slot hasn't been played yet.
 *  - pending  (gray):   no result yet and the picked team is still alive.
 */
function pickStatus(
  matchId: number,
  pick: string | undefined,
  winners: Record<number, string>,
  eliminated: Set<string>,
): PickStatus {
  if (!pick) return 'none'
  const w = winners[matchId]
  if (w !== undefined) return w === pick ? 'correct' : 'wrong'
  if (eliminated.has(pick)) return 'wrong'
  return 'pending'
}

export function ViewBracket() {
  const { tournament, results, getBracket } = useStore()
  const { username } = useParams()
  const t = tournament!

  const bracket = username ? getBracket(username) : undefined
  const byRound = useMemo(() => matchesByRound(t), [t])
  const eliminated = useMemo(
    () => eliminatedTeams(t, results.winners),
    [t, results.winners],
  )
  const score = useMemo(
    () => (bracket ? scoreBracket(bracket, t, results) : null),
    [bracket, t, results],
  )

  if (!bracket || !score) {
    return (
      <div>
        <h1>Bracket not found</h1>
        <p className="muted">
          No saved bracket for “{username}”.{' '}
          <Link to="/brackets">See all brackets</Link> or{' '}
          <Link to="/create">create one</Link>.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="page-head">
        <h1>{bracket.username}’s bracket</h1>
        <div className="score-summary">
          <span className="total-pill">
            {score.total} <span className="muted">pts</span>
          </span>
          <span className="muted">
            max possible {score.maxPossible} · {score.maxRemaining} still in play
          </span>
          <Link className="btn-link" to={`/create/${encodeURIComponent(bracket.username)}`}>
            Edit
          </Link>
        </div>
      </div>

      <table className="breakdown">
        <thead>
          <tr>
            <th>Round</th>
            {score.byRound.map((r) => (
              <th key={r.round}>{r.round}</th>
            ))}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Points</td>
            {score.byRound.map((r) => (
              <td key={r.round}>
                {r.earned}
                <span className="muted"> / {r.maxRound}</span>
              </td>
            ))}
            <td>
              <strong>{score.total}</strong>
              <span className="muted"> / 80</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="legend">
        <span className="chip correct">correct</span>
        <span className="chip wrong">wrong / eliminated</span>
        <span className="chip pending">pending</span>
      </div>

      <div className="rounds">
        {t.rounds.map((round) => (
          <section key={round.id} className="round-col">
            <h2>
              {round.name} <span className="muted">({round.points} pt each)</span>
            </h2>
            {byRound[round.id].map((match) => (
              <ViewMatch
                key={match.id}
                match={match}
                picks={bracket.picks}
                winners={results.winners}
                eliminated={eliminated}
              />
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}

function ViewMatch({
  match,
  picks,
  winners,
  eliminated,
}: {
  match: Match
  picks: Record<number, string>
  winners: Record<number, string>
  eliminated: Set<string>
}) {
  // Participants as this person predicted them (their own bracket topology).
  const [a, b] = participants(match, picks)
  const pick = picks[match.id]
  const status = pickStatus(match.id, pick, winners, eliminated)

  function slotClass(team: string | null): string {
    if (!team) return 'view-slot empty'
    const isPick = team === pick
    if (!isPick) return 'view-slot other'
    return `view-slot picked ${status}`
  }

  return (
    <div className="match-card">
      <div className="match-meta">
        <span className="match-id">#{match.id}</span>
        <span className="match-time">{match.datetime}</span>
      </div>
      {[a, b].map((team, i) => (
        <div key={i} className={slotClass(team)}>
          {team ? <TeamLabel team={team} /> : <span className="muted">—</span>}
          {team === pick && status === 'correct' && <span className="mark"> ✓</span>}
        </div>
      ))}
    </div>
  )
}
