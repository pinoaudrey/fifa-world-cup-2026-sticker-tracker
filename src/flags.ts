// Team name -> ISO 3166-1 alpha-2 code, used to build emoji flags from
// regional-indicator letters. A few names need explicit mapping (Congo DR,
// Cabo Verde, Ivory Coast, Bosnia). England is a UK subdivision and has no
// alpha-2 code, so it uses the special tag-sequence emoji directly.
const CODES: Record<string, string> = {
  'South Africa': 'ZA',
  Canada: 'CA',
  Germany: 'DE',
  Paraguay: 'PY',
  Netherlands: 'NL',
  Morocco: 'MA',
  Brazil: 'BR',
  Japan: 'JP',
  France: 'FR',
  Sweden: 'SE',
  'Ivory Coast': 'CI',
  Norway: 'NO',
  Mexico: 'MX',
  Ecuador: 'EC',
  'Congo DR': 'CD',
  'United States': 'US',
  Bosnia: 'BA',
  Belgium: 'BE',
  Senegal: 'SN',
  Portugal: 'PT',
  Croatia: 'HR',
  Spain: 'ES',
  Austria: 'AT',
  Switzerland: 'CH',
  Algeria: 'DZ',
  Argentina: 'AR',
  'Cabo Verde': 'CV',
  Colombia: 'CO',
  Ghana: 'GH',
  Australia: 'AU',
  Egypt: 'EG',
}

// 🏴󠁧󠁢󠁥󠁮󠁧󠁿 — black flag + tag letters g,b,e,n,g + cancel tag.
const ENGLAND_FLAG = '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}'

function codeToEmoji(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
}

/** Returns an emoji flag for a team, or '' if unknown (name alone is fine). */
export function flagFor(team: string): string {
  if (team === 'England') return ENGLAND_FLAG
  const code = CODES[team]
  return code ? codeToEmoji(code) : ''
}
