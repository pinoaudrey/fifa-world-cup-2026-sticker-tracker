import { Link } from 'react-router-dom'
import { isComplete, pickCount } from '../bracket'
import { useStore } from '../store'

export function BracketsList() {
  const { tournament, brackets, deleteBracket } = useStore()
  const t = tournament!

  const sorted = [...brackets].sort((a, b) =>
    a.username.localeCompare(b.username),
  )

  return (
    <div>
      <div className="page-head">
        <h1>Brackets</h1>
        <p className="muted">
          Everyone’s saved picks in this browser.{' '}
          <Link to="/create">Create a new bracket →</Link>
        </p>
      </div>

      {sorted.length === 0 ? (
        <p className="muted">
          No brackets saved yet. <Link to="/create">Create one</Link>.
        </p>
      ) : (
        <table className="brackets-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Picks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((b) => {
              const done = pickCount(b.picks, t)
              const complete = isComplete(b.picks, t)
              return (
                <tr key={b.username}>
                  <td>{b.username}</td>
                  <td>
                    {done}/{t.matches.length}
                    {complete ? (
                      <span className="badge ok"> complete</span>
                    ) : (
                      <span className="badge warn"> partial</span>
                    )}
                  </td>
                  <td className="actions">
                    <Link to={`/view/${encodeURIComponent(b.username)}`}>View</Link>
                    <Link to={`/create/${encodeURIComponent(b.username)}`}>Edit</Link>
                    <button
                      className="danger-link"
                      onClick={() => {
                        if (confirm(`Delete ${b.username}'s bracket?`))
                          deleteBracket(b.username)
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
