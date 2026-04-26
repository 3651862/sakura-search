const TAVILY_API_URL = 'https://api.tavily.com/search'

export interface TavilySearchResult {
  title: string
  url: string
  content: string
  score: number
  raw_content?: string
}

export interface TavilyResponse {
  query: string
  results: TavilySearchResult[]
  answer?: string
  response_time: string
}

export async function searchWithTavily(query: string): Promise<TavilyResponse> {
  const apiKey = import.meta.env.VITE_TAVILY_API_KEY

  if (!apiKey) {
    throw new Error('请设置 Tavily API Key。在 .env 文件中添加: VITE_TAVILY_API_KEY=your_key')
  }

  const response = await fetch(TAVILY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: 'basic',
      max_results: 5,
      include_answer: true,
      include_raw_content: false,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`搜索失败: ${response.status} - ${error}`)
  }

  return response.json()
}
