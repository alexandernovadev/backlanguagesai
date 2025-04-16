async function makeRequest() {
  const response = await fetch("http://localhost:1234/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "lmstudio-community/Meta-Llama-3-8B-Instruct-GGUF",
      messages: [
        {
          role: "system",
          content: `
                 You are an expert in the English language with a focus on teaching and lexicography. 
        Please generate a JSON object with the following properties, ensuring each is accurate, 
        error-free, and appropriate for English learners:

          JUST generate JSON as a response, NO string JUST json`,
        },
        {
          role: "user",
          content: `
          // EXMAPLE OF JSON OBJECT
      {
          "word": "challenges",
          "language": "en",
          "definition": "Difficult situations or tasks that require effort and determination to overcome.",
          "examples": [
              "Starting a new job comes with its own set of challenges.",
              "The team faced several challenges in completing the project on time.",
              "One of the main challenges in learning a language is mastering pronunciation.",
              "They overcame many challenges to reach their goal.",
              "Climate change presents serious challenges for all nations."
          ],
          "type": [
              "noun","verb","adjective"
          ],
          "IPA": "/ˈtʃæl.ɪn.dʒɪz/",
          "codeSwitching": [
              "Hay muchos |challenges| en el camino hacia el éxito.",
              "Enfrentamos varios |challenges|  al implementar el proyecto.",
              "La vida está llena de |challenges|  que nos ayudan a crecer.",
              "Superar estos |challenges|  nos hará más fuertes.",
              "El cambio climático trae numerosos |challenges|  para el futuro."
          ],
          "sinonyms": [ "obstacles", "difficulties", "problems", "hurdles", "obstructions" ],
          "spanish": {
              "definition": "Situaciones o tareas difíciles que requieren esfuerzo y determinación para superarse.",
              "word": "desafíos"
          }
        }   
       "spanish": {
                "definition": "Las estructuras físicas y organizativas básicas necesarias para el funcionamiento de una sociedad o empresa.",
                "word": "infraestructura"
            },
            "word": "infrastructure",
            "language": "English",
            "definition": "The basic physical and organizational structures and facilities needed for the operation of a society or enterprise.",
            "examples": [
                "The government invested heavily in the country's infrastructure to support economic growth.",
                "Infrastructure projects like roads and bridges are essential for a growing city.",
                "The company expanded its infrastructure to improve its production capabilities.",
                "Good digital infrastructure is key to the success of online businesses.",
                "After the natural disaster, rebuilding infrastructure became the government's top priority."
            ],
            "type": [
                "noun","adjective"
            ],
            "IPA": "/ˈɪnfrəˌstrʌktʃə/",
            "sinonyms": ["base", "platform", "system", "network", "support"];
            "codeSwitching": [
                "La |infrastructure| de la ciudad ha mejorado mucho en los últimos años.",
                "La nueva |infrastructure|  ayuda a que el tráfico sea más eficiente.",
                "Estamos trabajando en mejorar la |infrastructure|  de nuestras oficinas.",
                "Es importante invertir en la |infrastructure|  para el futuro del país.",
                "La falta de |infrastructure|  adecuada limita el crecimiento económico."
            ],


            AHORA quiero la palabra "collar" q es una palanra en ingles analizaras, MIRA BUEN el codeSwitching 
`,
        },
      ],
      temperature: 0.7,
      max_tokens: -1,
      stream: false,
    }),
  });

  const rta = await response.json();

  // parse to json
}

makeRequest().catch(console.error);
