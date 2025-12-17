
import { GoogleGenAI } from "@google/genai";
import { Order, MenuItem } from "../types";

// Note: Initialization is performed within the function to ensure the most up-to-date API key is used
// as per the guidelines for dynamic key environments.

export const generateSalesInsight = async (orders: Order[], menu: MenuItem[]) => {
  try {
    // Correct initialization using named parameter and process.env.API_KEY directly
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    const completedOrders = orders.filter(o => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const itemCounts: Record<string, number> = {};
    
    completedOrders.forEach(order => {
      order.items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });

    const popularItems = Object.entries(itemCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => `${name} (${count})`)
      .join(', ');

    const prompt = `
      As a restaurant manager AI, analyze the following daily sales summary and provide 3 key insights or actionable suggestions.
      
      Data:
      - Total Revenue: ${totalRevenue.toFixed(2)}
      - Total Orders: ${completedOrders.length}
      - Top Selling Items: ${popularItems}
      - Order Times: ${completedOrders.map(o => new Date(o.completedAt || 0).getHours() + ':00').join(', ')}

      Format the output as a JSON object with a "summary" string and an array of "insights" (strings).
    `;

    // Using gemini-3-flash-preview for general text tasks as recommended
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    // Directly access the .text property from the GenerateContentResponse object
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error generating insight:", error);
    return {
      summary: "Could not generate insights at this time.",
      insights: ["Please check your internet connection or API key."]
    };
  }
};
