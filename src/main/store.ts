import Store from 'electron-store'

interface StoreSchema {
  apiKey: string
  apiBaseUrl: string
  apiModel: string
}

export const store = new Store<StoreSchema>({
  encryptionKey: 'acro-snap-local-store',
  defaults: {
    apiKey: 'sk-7851fb3214ed4e3698366d8ae0202da8',
    apiBaseUrl: 'https://api.deepseek.com',
    apiModel: 'deepseek-chat'
  }
})

export function getApiKey(): string {
  return store.get('apiKey')
}

export function setApiKey(key: string): void {
  store.set('apiKey', key)
}

export function getApiBaseUrl(): string {
  return store.get('apiBaseUrl')
}

export function getApiModel(): string {
  return store.get('apiModel')
}

export function setApiBaseUrl(url: string): void {
  store.set('apiBaseUrl', url)
}

export function setApiModel(model: string): void {
  store.set('apiModel', model)
}
