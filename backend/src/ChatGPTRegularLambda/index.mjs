// Open AI Initialization
import OpenAI from 'openai';

const openai = new OpenAI({
  organization: process.env.ORG_ID,
  apiKey: process.env.API_KEY,
});

// Handler Function - Regular Lambda
export const handler = async (event) => {
  // Call ChatGPT API
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{"role": "user", "content": event.body}]
  });

  // Send Response
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(completion.choices[0].message.content),
  };
  return response;
};
