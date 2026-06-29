import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { leaderboard } from '../scoring'
import { useStore } from '../store'

export function Leaderboard() {
  const { tournament, brackets, results } = useStore()
  const t = tournament!
  const board = useMemo(
    () => leaderboard(brackets, t, results),
    [brackets, t, results],
  )
  const decided = Object.keys(results.winners).length

  return (
    <div>
      <div className="page-head">
        <h1>Leaderboard</h1>
        <p className="muted">
          {brackets.length} player{brackets.length === 1 ? '' : 's'} ·{' '}
          {decided} of {t.matches.length} matches decided · advancement-based
          scoring (max 80)
        </p>
      </div>

      {board.length === 0 ? (
        <p className="muted">
          No brackets yet. <Link to="/create">Create one</Link> to get started.
        </p>
      ) : (
        <table className="leaderboard">
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              {t.rounds.map((r) => (
                <th key={r.id} title={`${r.name} — ${r.points} pt each`}>
                  {r.id}
                </th>
              ))}
              <th>Total</th>
              <th title="Highest score still reachable given current results">
                Max
              </th>
            </tr>
          </thead>
          <tbody>
            {board.map((row) => (
              <tr key={row.username}>
                <td className="rank">{row.rank}</td>
                <td>
                  <Link to={`/view/${encodeURIComponent(row.username)}`}>
                    {row.username}
                  </Link>
                </td>
                {row.byRound.map((r) => (
                  <td key={r.round}>{r.earned}</td>
                ))}
                <td>
                  <strong>{row.total}</strong>
                </td>
                <td className="muted">{row.maxPossible}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
