import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize only if key exists, otherwise we will fail gracefully in the function
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getGameCommentary = async (state: 'WON' | 'GAME_OVER', score: number): Promise<string> => {
  if (!ai) {
    return state === 'WON' 
      ? "Shabash! Great job, Beta!" 
      : "Arey yaar! Better luck next time!";
  }

  const prompt = state === 'WON'
    ? `You are an enthusiastic Indian Cricket Commentator. A player just won a Pacman-style game collecting Samosas with a score of ${score}. Give a short, funny, celebratory remark (max 1 sentence). Use Indian English slang like "Fantastic batting" or "Chak de phatte".`
    : `You are a sarcastic but loving Indian Uncle. A player just lost a Pacman-style game with a score of ${score}. Give a short, slightly judgmental but funny remark (max 1 sentence). Use Indian English slang like "Beta, what is this?" or "Eat more almonds".`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || (state === 'WON' ? "You Won!" : "Game Over!");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return state === 'WON' 
      ? "Shabash! You won!" 
      : "Arey no! Try again!";
  }
};
