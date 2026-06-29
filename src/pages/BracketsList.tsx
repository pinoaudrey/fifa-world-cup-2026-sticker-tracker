import {
  Anchor,
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { Link, useNavigate } from 'react-router-dom'
import { isComplete, pickCount } from '../bracket'
import { useStore } from '../store'

// Edit/Delete only matter for the admin working locally; on the published
// (read-only) site, brackets are view-only.
const canManage = import.meta.env.DEV

export function BracketsList() {
  const { tournament, brackets, deleteBracket } = useStore()
  const navigate = useNavigate()
  const t = tournament!

  const sorted = [...brackets].sort((a, b) => a.username.localeCompare(b.username))

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={1}>Brackets</Title>
          <Text c="dimmed" size="sm">
            Everyone’s saved picks in this browser. Click a row to view a bracket.
          </Text>
        </div>
        <Button onClick={() => navigate('/create')}>+ New bracket</Button>
      </Group>

      {sorted.length === 0 ? (
        <Text c="dimmed">
          No brackets saved yet.{' '}
          <Anchor component={Link} to="/create">
            Create one
          </Anchor>
          .
        </Text>
      ) : (
        <Paper withBorder radius="md" p="md">
          <Table highlightOnHover verticalSpacing="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Player</Table.Th>
                <Table.Th>Picks</Table.Th>
                {canManage && <Table.Th>Actions</Table.Th>}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sorted.map((b) => {
                const done = pickCount(b.picks, t)
                const complete = isComplete(b.picks, t)
                return (
                  <Table.Tr
                    key={b.username}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/view/${encodeURIComponent(b.username)}`)}
                  >
                    <Table.Td>{b.username}</Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <span>
                          {done}/{t.matches.length}
                        </span>
                        <Badge color={complete ? 'green' : 'yellow'} variant="light">
                          {complete ? 'complete' : 'partial'}
                        </Badge>
                      </Group>
                    </Table.Td>
                    {canManage && (
                      <Table.Td>
                        <Group gap="sm">
                          <Anchor
                            component={Link}
                            to={`/create/${encodeURIComponent(b.username)}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Edit
                          </Anchor>
                          <Anchor
                            component="button"
                            type="button"
                            c="red"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (confirm(`Delete ${b.username}'s bracket?`))
                                deleteBracket(b.username)
                            }}
                          >
                            Delete
                          </Anchor>
                        </Group>
                      </Table.Td>
                    )}
                  </Table.Tr>
                )
              })}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </Stack>
  )
}
