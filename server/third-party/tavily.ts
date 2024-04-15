export async function validateTavilyApiKey(tavilyApiKey: string): Promise<any> {
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      api_key: tavilyApiKey,
      query: 'mindpal',
      max_results: 1,
      search_depth: 'basic',
      include_images: true,
      include_answers: true
    })
  })
  if (!response.ok) {
    return false
  }
  return true
}
