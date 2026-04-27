import Fuse from 'fuse.js'
import type { Term } from './types'
import { fetchAllTerms, upsertTerm } from './supabase'

let terms: Term[] = []
let fuse: Fuse<Term> | null = null
let online = navigator.onLine
let loaded = false

window.addEventListener('online', () => {
  online = true
})
window.addEventListener('offline', () => {
  online = false
})

export function isOnline(): boolean {
  return online
}

export function isLoaded(): boolean {
  return loaded
}

export async function loadTerms(): Promise<void> {
  if (!online) {
    loaded = true
    return
  }
  try {
    terms = await fetchAllTerms()
    rebuildIndex()
  } catch (e) {
    console.warn('[termStore] failed to load terms:', e)
  } finally {
    loaded = true
  }
}

function rebuildIndex(): void {
  fuse = new Fuse(terms, {
    keys: ['abbr', 'full_name', 'zh_meaning'],
    threshold: 0.35,
    includeScore: true
  })
}

export function searchTerms(query: string): Term[] {
  if (!query.trim() || !fuse) return []
  return fuse
    .search(query)
    .map((r) => r.item)
    .slice(0, 8)
}

export function getTermByAbbr(abbr: string): Term | undefined {
  return terms.find((t) => t.abbr.toLowerCase() === abbr.toLowerCase())
}

export function addOrUpdateLocal(term: Term): void {
  const idx = terms.findIndex((t) => t.abbr === term.abbr)
  if (idx >= 0) {
    terms[idx] = term
  } else {
    terms.push(term)
  }
  rebuildIndex()
}

export async function saveTerm(
  term: Omit<Term, 'id' | 'created_at' | 'updated_at'>
): Promise<Term> {
  const saved = await upsertTerm(term)
  addOrUpdateLocal(saved)
  return saved
}
