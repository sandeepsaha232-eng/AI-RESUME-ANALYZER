/**
 * Safe API fetch helper to prevent JSON parsing crashes on non-JSON server responses
 * e.g. "SyntaxError: Unexpected token 'A', 'A server e'... is not valid JSON"
 */
export async function safeFetchJson(url: string, options?: RequestInit): Promise<any> {
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type');

  let result: any;
  if (contentType && contentType.includes('application/json')) {
    try {
      result = await response.json();
    } catch (parseError) {
      throw new Error(`Failed to parse JSON response from server: ${response.status} ${response.statusText}`);
    }
  } else {
    // Non-JSON response (could be Vercel's or Express's 500 html/text error message)
    const text = await response.text();
    // Clean HTML tags if any to expose the pure text error
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().substring(0, 150);
    throw new Error(cleanText || `Server error: Status ${response.status} (${response.statusText})`);
  }

  if (!response.ok) {
    const serverMessage = result?.error?.message || result?.message;
    throw new Error(serverMessage || `Request failed with status code ${response.status}`);
  }

  return result;
}
