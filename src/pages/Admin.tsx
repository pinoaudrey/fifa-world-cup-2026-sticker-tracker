import {
  Anchor,
  Badge,
  Button,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  bracketOrder,
  isComplete,
  isEnterable,
  participants,
  pickCount,
} from '../bracket'
import {
  BracketBoard,
  ClickSlot,
  FlagTile,
  MatchCardShell,
  PickBadge,
  shortTime,
} from '../components/BracketBoard'
import { abbrFor } from '../flags'
import { useStore } from '../store'

// Casual client-side gate to prevent accidental edits on the public site.
// NOTE: this is NOT real security. The password ships in the static bundle and
// anyone can bypass it. It doesn't matter: editing the live site only changes
// the visitor's own localStorage. Published data only updates when the admin
// exports JSON and commits it to the repo.
const ADMIN_PASSWORD = 'WC26'
const UNLOCK_KEY = 'wc2026.admin.unlocked'

export function Admin() {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(UNLOCK_KEY) === '1',
  )
  if (!unlocked) return <Gate onUnlock={() => setUnlocked(true)} />
  return <AdminPanel />
}

function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState('')
  const [bad, setBad] = useState(false)
  function submit(e: FormEvent) {
    e.preventDefault()
    if (value === ADMIN_PASSWORD) {
      sessionStorage.setItem(UNLOCK_KEY, '1')
      onUnlock()
    } else {
      setBad(true)
    }
  }
  return (
    <Stack gap="md" maw={560}>
      <Title order={1}>Admin</Title>
      <Text c="dimmed">
        Casual gate to avoid accidental edits. This is <em>not</em> security —
        editing this site only changes your own browser; published standings
        update only when the admin commits exported JSON to the repo.
      </Text>
      <form onSubmit={submit}>
        <Group align="flex-end" gap="md">
          <PasswordInput
            label="Password"
            value={value}
            autoFocus
            onChange={(e) => {
              setValue(e.currentTarget.value)
              setBad(false)
            }}
            w={220}
          />
          <Button type="submit">Unlock</Button>
          {bad && (
            <Text c="red" size="sm">
              Wrong password.
            </Text>
          )}
        </Group>
      </form>
    </Stack>
  )
}

function AdminPanel() {
  const { tournament, brackets, results, setWinner, clearWinner, deleteBracket } =
    useStore()
  const t = tournament!

  const sortedBrackets = [...brackets].sort((a, b) =>
    a.username.localeCompare(b.username),
  )

  return (
    <Stack gap="lg">
      <div>
        <Title order={1}>Admin</Title>
        <Text c="dimmed" size="sm">
          Enter results and manage brackets.{' '}
          {import.meta.env.DEV
            ? 'On localhost every change auto-saves to public/data/*.json — just commit and push.'
            : 'Re-enter each person’s picks and the results as matches finish.'}
        </Text>
      </div>

      <div>
        <Title order={3}>Enter results</Title>
        <Text c="dimmed" size="sm" mb="sm">
          Click the winner of each match. A match unlocks once both real participants
          are known (derived from earlier winners). Changing an earlier result clears
          any now-impossible later results.
        </Text>
        <BracketBoard
          t={t}
          byRound={bracketOrder(t)}
          connectorState={(f) => (results.winners[f] !== undefined ? 'correct' : 'neutral')}
          measureDeps={[results.winners]}
          renderCard={(match, _round, cardRef) => {
            const [a, b] = participants(match, results.winners)
            const enterable = isEnterable(match, results.winners)
            const winner = results.winners[match.id]
            const decided = winner !== undefined
            const label = decided ? 'Final' : enterable ? 'Enter result' : 'Awaiting teams'
            return (
              <MatchCardShell
                key={match.id}
                matchId={match.id}
                cardRef={cardRef}
                status={decided ? 'correct' : 'neutral'}
                label={label}
                labelColor={decided ? 'green.7' : 'dimmed'}
                time={shortTime(match.datetime)}
                pickPanel={
                  <>
                    <FlagTile
                      team={winner}
                      badge={
                        decided ? (
                          <PickBadge kind="correct" />
                        ) : !enterable ? (
                          <PickBadge kind="locked" />
                        ) : undefined
                      }
                    />
                    <Text size="xs" c="dimmed">
                      {decided ? 'Winner' : 'Result'}
                    </Text>
                    <Text fw={800}>{winner ? abbrFor(winner) : '—'}</Text>
                    {decided && (
                      <Anchor component="button" type="button" c="red" fz="xs" onClick={() => clearWinner(match.id)}>
                        Clear
                      </Anchor>
                    )}
                  </>
                }
              >
                <ClickSlot
                  team={a}
                  selected={winner === a}
                  disabled={!enterable}
                  variant="won"
                  onSelect={() => {
                    if (a) setWinner(match.id, a)
                  }}
                />
                <ClickSlot
                  team={b}
                  selected={winner === b}
                  disabled={!enterable}
                  variant="won"
                  onSelect={() => {
                    if (b) setWinner(match.id, b)
                  }}
                />
              </MatchCardShell>
            )
          }}
        />
      </div>

      <Paper withBorder radius="md" p="md">
        <Title order={3} mb="sm">
          Manage brackets
        </Title>
        {sortedBrackets.length === 0 ? (
          <Text c="dimmed">
            No brackets yet.{' '}
            <Anchor component={Link} to="/create">
              Create one
            </Anchor>
            .
          </Text>
        ) : (
          <Table highlightOnHover verticalSpacing="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Player</Table.Th>
                <Table.Th>Picks</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sortedBrackets.map((b) => (
                <Table.Tr key={b.username}>
                  <Table.Td>{b.username}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <span>
                        {pickCount(b.picks, t)}/{t.matches.length}
                      </span>
                      <Badge color={isComplete(b.picks, t) ? 'green' : 'yellow'} variant="light">
                        {isComplete(b.picks, t) ? 'complete' : 'partial'}
                      </Badge>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="sm">
                      <Anchor component={Link} to={`/view/${encodeURIComponent(b.username)}`}>
                        View
                      </Anchor>
                      <Anchor component={Link} to={`/create/${encodeURIComponent(b.username)}`}>
                        Edit
                      </Anchor>
                      <Anchor
                        component="button"
                        type="button"
                        c="red"
                        onClick={() => {
                          if (confirm(`Delete ${b.username}'s bracket?`))
                            deleteBracket(b.username)
                        }}
                      >
                        Delete
                      </Anchor>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
    </Stack>
  )
}
