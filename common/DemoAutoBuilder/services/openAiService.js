import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);
// eslint-disable-next-line import/prefer-default-export
export async function submitOpenAiPrompt(promptMessage) {
  const chatCompletion = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: promptMessage }],
  });
  const promptReturn = chatCompletion?.data?.choices[0]?.message?.content;
  return promptReturn;
}
