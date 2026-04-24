export interface KnowledgeItem {
  key: string
  value: string
}

export interface FollowUpMessage {
  question: string
  answer: string
}

export interface SearchRecord {
  id: string
  query: string
  results: Array<{
    title: string
    url: string
    content: string
    score: number
  }>
  aiAnswer: string
  messages: FollowUpMessage[]
  createdAt: number
  nextReviewAt: number
}

export interface ShortcutSettings {
  toggleWindow: string
  clearSearch: string
  closeWindow: string
  focusSearch: string
}

export const DEFAULT_SHORTCUTS: ShortcutSettings = {
  toggleWindow: 'Alt+Space',
  clearSearch: 'Ctrl+K',
  closeWindow: 'Escape',
  focusSearch: 'Ctrl+L',
}
