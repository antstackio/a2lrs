// Open AI Initialization
import OpenAI from 'openai';

const openai = new OpenAI({
  organization: process.env.ORG_ID,
  apiKey: process.env.API_KEY,
});

// Handler Function - Streaming Lambda
export const handler = awslambda.streamifyResponse(
  async (event, responseStream, context) => {
    const httpResponseMetadata = {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html",
        "Access-Control-Allow-Origin": "*",
      },
    };

    // Stream Object
    responseStream = awslambda.HttpResponseStream.from(
      responseStream,
      httpResponseMetadata
    );

    // Call ChatGPT API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{"role": "user", "content": event.body}],
      stream: true,
    });
    for await (const part of completion) {
      if (Object.keys(part.choices[0].delta).includes("content")){
        responseStream.write(part.choices[0].delta.content)
      }
      else{
        responseStream.end()
      }
    }
  }
);
