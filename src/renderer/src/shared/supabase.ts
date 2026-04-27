import { createClient } from '@supabase/supabase-js'
import type { Term } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function fetchAllTerms(): Promise<Term[]> {
  const { data, error } = await supabase.from('terms').select('*').order('abbr')
  if (error) throw error
  return (data as Term[]) ?? []
}

export async function upsertTerm(
  term: Omit<Term, 'id' | 'created_at' | 'updated_at'>
): Promise<Term> {
  const { data, error } = await supabase
    .from('terms')
    .upsert({ ...term, updated_at: new Date().toISOString() }, { onConflict: 'abbr' })
    .select()
    .single()
  if (error) throw error
  return data as Term
}
