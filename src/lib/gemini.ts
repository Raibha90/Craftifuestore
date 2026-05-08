export async function generateGeminiContent(params: {
  contents: any;
  model?: string;
  config?: any;
}) {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: params.contents,
      model: params.model,
      config: params.config,
      type: 'content'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate content');
  }

  return response.json();
}

export async function generateGeminiImage(params: {
  prompt: string;
  model?: string;
  config?: any;
}) {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: params.prompt,
      model: params.model,
      config: params.config,
      type: 'image'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate image');
  }

  return response.json();
}
