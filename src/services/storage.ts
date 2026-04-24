import { invoke } from '@tauri-apps/api/tauri'
import { SearchRecord, ShortcutSettings, DEFAULT_SHORTCUTS, KnowledgeRecord, ClipRecord } from '../types'

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

// 旧格式 KnowledgeRecord → 新格式 ClipRecord 迁移
function migrateToClipRecords(records: any[]): ClipRecord[] {
  return records.map(r => {
    if (r.tags && r.content) return r as ClipRecord
    const old = r as KnowledgeRecord
    return {
      id: old.id,
      query: old.query,
      tags: old.items.map(item => item.key),
      content: old.items.map(item => item.value),
      createdAt: old.createdAt,
    }
  })
}

export async function loadClipRecords(): Promise<ClipRecord[]> {
  const data = await invoke<string>('read_knowledge')
  const parsed = JSON.parse(data)
  return migrateToClipRecords(parsed)
}

export async function saveClipRecords(records: ClipRecord[]): Promise<void> {
  await invoke('write_knowledge', { data: JSON.stringify(records) })
}

export async function addClipRecord(record: ClipRecord): Promise<void> {
  const records = await loadClipRecords()
  records.unshift(record)
  await saveClipRecords(records)
}

export async function deleteClipRecord(id: string): Promise<void> {
  const records = await loadClipRecords()
  const filtered = records.filter(r => r.id !== id)
  await saveClipRecords(filtered)
}
