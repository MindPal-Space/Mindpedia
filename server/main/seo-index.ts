import axios from 'axios'

interface SeoIndexResponseProps {
  msg: string
}

export const indexSeoPage = async (url: string) => {
  const apiUrl = `${process.env.MINDPAL_API_ENDPOINT || ''}/api/seo-index/index`
  const params = {
    url: url
  }
  const headers = {
    accept: 'application/json',
    'Content-Type': 'multipart/form-data'
  }
  try {
    const response = await axios.post(apiUrl, null, { headers, params })
    const responseData = response.data as SeoIndexResponseProps
    return responseData
  } catch (e) {
    console.error(e)
    throw new Error(
      'Something went wrong while we were indexing the URL. Please try again.'
    )
  }
}
