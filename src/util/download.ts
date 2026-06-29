/** Trigger a client-side download of `data` serialized as pretty JSON. */
export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2) + '\n'], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Read a user-selected File as parsed JSON. */
export async function readJsonFile<T>(file: File): Promise<T> {
  const text = await file.text()
  return JSON.parse(text) as T
}
