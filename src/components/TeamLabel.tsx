import { flagFor } from '../flags'

/** A team name prefixed with its emoji flag (flag omitted if unknown). */
export function TeamLabel({ team }: { team: string }) {
  const flag = flagFor(team)
  return (
    <span className="team">
      {flag && (
        <span className="flag" aria-hidden="true">
          {flag}{' '}
        </span>
      )}
      {team}
    </span>
  )
}
