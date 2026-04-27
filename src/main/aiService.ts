import OpenAI from 'openai'
import type { BrowserWindow } from 'electron'
import { getApiBaseUrl, getApiKey, getApiModel } from './store'
import type { AiResult } from '../renderer/src/shared/types'

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '')
}

function normalizeBaseUrl(url: string): string {
  const trimmed = trimTrailingSlash(url.trim())
  if (!trimmed) return trimmed
  return /\/v\d+$/i.test(trimmed) ? trimmed : `${trimmed}/v1`
}

function getClient(): OpenAI {
  const apiKey = getApiKey().trim()
  if (!apiKey) {
    throw new Error('API Key 未配置，请先在设置中填写。')
  }

  return new OpenAI({
    apiKey,
    baseURL: normalizeBaseUrl(getApiBaseUrl())
  })
}

export function formatAiError(error: unknown): string {
  if (error instanceof OpenAI.APIError) {
    const baseUrl = normalizeBaseUrl(getApiBaseUrl())
    const model = getApiModel()
    const status = error.status ? `HTTP ${error.status}` : 'API error'

    if (error.status === 404) {
      return `${status}: 接口地址或模型名不正确。当前 Base URL: ${baseUrl}，当前模型: ${model}。`
    }

    return `${status}: ${error.message}`
  }

  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

const AI_QUERY_PROMPT = (abbr: string): string => `
You are an AI/CS terminology assistant.
Given the abbreviation "${abbr}", return only a JSON object with this shape:
{
  "abbr": "${abbr}",
  "full_name": "full English name",
  "zh_meaning": "concise Chinese explanation",
  "formula": "LaTeX formula if relevant, otherwise null"
}
`

const EXTRACT_TERM_PROMPT = (content: string): string => `
Extract one AI/CS term from the following text.
Return only a JSON object with this shape:
{
  "abbr": "abbreviation or short term",
  "full_name": "full English name",
  "zh_meaning": "concise Chinese explanation",
  "formula": "LaTeX formula if relevant, otherwise null"
}

If no valid AI/CS term exists, return:
{
  "abbr": "",
  "full_name": "",
  "zh_meaning": "",
  "formula": null
}

Text:
${content.slice(0, 2000)}
`

export async function queryAbbr(abbr: string): Promise<AiResult> {
  const client = getClient()
  const completion = await client.chat.completions.create({
    model: getApiModel(),
    messages: [{ role: 'user', content: AI_QUERY_PROMPT(abbr) }],
    temperature: 0.2,
    response_format: { type: 'json_object' }
  })
  const text = completion.choices[0]?.message?.content ?? '{}'
  return JSON.parse(text) as AiResult
}

export async function streamChat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  win: BrowserWindow
): Promise<void> {
  const client = getClient()
  const stream = await client.chat.completions.create({
    model: getApiModel(),
    messages: [
      {
        role: 'system',
        content:
          'You are AcroSnap, an expert AI/CS terminology assistant. Answer in Chinese. Use LaTeX for math ($$...$$). Be concise and accurate.'
      },
      ...messages
    ],
    stream: true,
    temperature: 0.5
  })

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? ''
    if (delta) {
      win.webContents.send('ai:stream-chunk', delta)
    }
  }

  win.webContents.send('ai:stream-done')
}

export async function extractTerm(content: string): Promise<AiResult | null> {
  const client = getClient()
  const completion = await client.chat.completions.create({
    model: getApiModel(),
    messages: [{ role: 'user', content: EXTRACT_TERM_PROMPT(content) }],
    temperature: 0.1,
    response_format: { type: 'json_object' }
  })
  const text = completion.choices[0]?.message?.content ?? 'null'
  const parsed = JSON.parse(text)
  return parsed && parsed.abbr ? (parsed as AiResult) : null
}
