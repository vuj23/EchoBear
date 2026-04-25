function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function stripVowels(s: string): string {
  return s.replace(/[aeiou]/gi, '')
}

// Three-layer matching: exact → Levenshtein ≤ 1 → consonant skeleton
export function isCorrect(heard: string, target: string): boolean {
  if (!target) return true

  // Take the last word if speech recognition captured extra words
  const h = (heard.toLowerCase().trim().split(/\s+/).pop() ?? '').replace(/[^a-z]/g, '')
  const t = target.toLowerCase().trim()

  if (h === t) return true
  if (levenshtein(h, t) <= 1) return true

  const hs = stripVowels(h)
  const ts = stripVowels(t)
  if (ts.length > 0 && hs === ts) return true

  return false
}
