import { KnowledgeItem } from '../types'

// Stepfun API 服务
const STEPFUN_API_URL = 'https://api.stepfun.com/v1/chat/completions'

export interface StepfunMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface StepfunResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: StepfunMessage
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// 流式输出接口
export interface StreamCallbacks {
  onToken: (token: string) => void
  onReasoning?: (token: string) => void
  onDone: (fullText: string, reasoning?: string) => void
  onError: (error: Error) => void
}

// 流式生成 AI 总结
export async function streamSummary(
  messages: StepfunMessage[],
  callbacks: StreamCallbacks,
  model?: string
): Promise<void> {
  const apiKey = import.meta.env.VITE_STEPFUN_API_KEY
  const defaultModel = import.meta.env.VITE_STEPFUN_MODEL || 'step-3.5-flash'

  if (!apiKey) {
    callbacks.onError(new Error('请设置 Stepfun API Key'))
    return
  }

  try {
    const response = await fetch(STEPFUN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || defaultModel,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: true,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      callbacks.onError(new Error(`Stepfun API 错误: ${response.status} - ${error}`))
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      callbacks.onError(new Error('无法获取响应流'))
      return
    }

    const decoder = new TextDecoder()
    let fullText = ''
    let reasoning = ''
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') continue
        if (!trimmed.startsWith('data: ')) continue

        try {
          const json = JSON.parse(trimmed.slice(6))
          const delta = json.choices?.[0]?.delta
          if (!delta) continue

          // 推理阶段
          const reasoningToken = delta.reasoning
          if (reasoningToken) {
            reasoning += reasoningToken
            callbacks.onReasoning?.(reasoningToken)
          }

          // 回答阶段
          const token = delta.content
          if (token) {
            fullText += token
            callbacks.onToken(token)
          }
        } catch {
          // 跳过无法解析的行
        }
      }
    }

    callbacks.onDone(fullText, reasoning || undefined)
  } catch (err) {
    callbacks.onError(err instanceof Error ? err : new Error('流式请求失败'))
  }
}

export async function extractKnowledge(aiAnswer: string): Promise<KnowledgeItem[]> {
  const apiKey = import.meta.env.VITE_STEPFUN_API_KEY
  const defaultModel = import.meta.env.VITE_STEPFUN_MODEL || 'step-3.5-flash'

  if (!apiKey) return []

  try {
    const response = await fetch(STEPFUN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: defaultModel,
        messages: [
          {
            role: 'system',
            content: '你是一个知识提取助手。从回答中提取关键知识点，格式为JSON数组 [{"key":"标签","value":"内容"}]。如果回答过于简单或没有明确的知识点（少于3个要点），返回空数组 []。只返回JSON，不要其他文字，不要推理。',
          },
          {
            role: 'user',
            content: `从以下回答中提取关键知识点：\n\n${aiAnswer}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      console.error('extractKnowledge API error:', response.status)
      return []
    }

    const data: StepfunResponse = await response.json()
    const content = data.choices[0].message.content.trim()

    if (!content) {
      console.warn('extractKnowledge: empty content (tokens consumed by reasoning)')
      return []
    }

    // 尝试解析 JSON，可能被 ```json 包裹
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.warn('extractKnowledge: no JSON array found in response:', content.slice(0, 200))
      return []
    }

    const items = JSON.parse(jsonMatch[0])
    if (!Array.isArray(items)) return []

    return items
      .filter((item: any) => item.key && item.value)
      .map((item: any) => ({ key: String(item.key), value: String(item.value) }))
  } catch (err) {
    console.error('extractKnowledge failed:', err)
    return []
  }
}
