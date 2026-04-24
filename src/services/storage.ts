import { invoke } from '@tauri-apps/api/tauri'
import { SearchRecord, ShortcutSettings, DEFAULT_SHORTCUTS, KnowledgeRecord } from '../types'

export async function loadHistory(): Promise<SearchRecord[]> {
  const data = await invoke<string>('read_history')
  return JSON.parse(data)
}

export async function saveHistory(records: SearchRecord[]): Promise<void> {
  await invoke('write_history', { data: JSON.stringify(records) })
}

export async function addSearchRecord(record: SearchRecord): Promise<void> {
  const records = await loadHistory()
  records.unshift(record)
  await saveHistory(records)
}

export async function deleteSearchRecord(id: string): Promise<void> {
  const records = await loadHistory()
  const filtered = records.filter(r => r.id !== id)
  await saveHistory(filtered)
}

export async function updateSearchRecord(id: string, updates: Partial<SearchRecord>): Promise<void> {
  const records = await loadHistory()
  const index = records.findIndex(r => r.id === id)
  if (index >= 0) {
    records[index] = { ...records[index], ...updates }
    await saveHistory(records)
  }
}

export async function loadSettings(): Promise<ShortcutSettings> {
  const data = await invoke<string>('read_settings')
  const parsed = JSON.parse(data)
  return { ...DEFAULT_SHORTCUTS, ...parsed }
}

export async function saveSettings(settings: ShortcutSettings): Promise<void> {
  await invoke('write_settings', { data: JSON.stringify(settings) })
}

export async function loadKnowledgeRecords(): Promise<KnowledgeRecord[]> {
  const data = await invoke<string>('read_knowledge')
  return JSON.parse(data)
}

export async function saveKnowledgeRecords(records: KnowledgeRecord[]): Promise<void> {
  await invoke('write_knowledge', { data: JSON.stringify(records) })
}

export async function addKnowledgeRecord(record: KnowledgeRecord): Promise<void> {
  const records = await loadKnowledgeRecords()
  records.unshift(record)
  await saveKnowledgeRecords(records)
}

export async function deleteKnowledgeRecord(id: string): Promise<void> {
  const records = await loadKnowledgeRecords()
  const filtered = records.filter(r => r.id !== id)
  await saveKnowledgeRecords(filtered)
}

export async function updateKnowledgeRecord(id: string, updates: Partial<KnowledgeRecord>): Promise<void> {
  const records = await loadKnowledgeRecords()
  const index = records.findIndex(r => r.id === id)
  if (index >= 0) {
    records[index] = { ...records[index], ...updates }
    await saveKnowledgeRecords(records)
  }
}
