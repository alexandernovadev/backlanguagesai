async function makeRequest() {
  const response = await fetch("http://localhost:1234/v1/chat/completions", {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({
          model: "lmstudio-community/Meta-Llama-3-8B-Instruct-GGUF",
          messages: [
              { role: "system", content: "Always answer in rhymes." },
              { role: "user", content: "Introduce yourself." }
          ],
          temperature: 0.7,
          max_tokens: -1,
          stream: true
      })
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder("utf-8");
  
  if (!reader) {
      console.error("No response body");
      return;
  }
  
  while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      console.info(decoder.decode(value, { stream: true }));
  }
}

makeRequest().catch(console.error);
