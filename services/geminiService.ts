
import { GoogleGenAI } from "@google/genai";
import { BusinessData } from "../types";

export const askGemini = async (prompt: string, data: BusinessData): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Extract temporal insights for the prompt
  const monthlyGrowth = data.stats.monthlyGrowth;
  const highestGrowthObj = [...monthlyGrowth].sort((a, b) => (b.growth || 0) - (a.growth || 0))[0];
  
  // Calculate Weekend vs Weekday from heatmap data
  // Days order: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
  const heatmapZ = data.stats.heatmap.z;
  const weekdayTotal = heatmapZ.slice(0, 5).reduce((acc, day) => acc + day.reduce((a, b) => a + b, 0), 0);
  const weekendTotal = heatmapZ.slice(5, 7).reduce((acc, day) => acc + day.reduce((a, b) => a + b, 0), 0);
  const avgWeekday = weekdayTotal / 5;
  const avgWeekend = weekendTotal / 2;
  const weekendBetter = avgWeekend > avgWeekday;

  const dataSummary = {
    totalRevenue: data.stats.totalRevenue,
    customerCount: data.stats.customerCount,
    avgTransaction: data.stats.averageTransaction,
    topSegments: data.stats.topCustomers.map(c => `${c.name} ($${c.value})`).join(", "),
    columnHeaders: data.headers.join(", "),
    recordCount: data.rows.length,
    revenueTrend: data.stats.revenueByDate.map(d => `${d.date}: $${d.amount}`).join("; "),
    highestGrowthMonth: highestGrowthObj ? `${highestGrowthObj.month} (Growth: ${highestGrowthObj.growth?.toFixed(1)}%)` : "Insufficient data",
    weekendVsWeekday: weekendBetter 
      ? `Weekends are more profitable on average ($${avgWeekend.toFixed(2)}/day) than weekdays ($${avgWeekday.toFixed(2)}/day).`
      : `Weekdays perform better on average ($${avgWeekday.toFixed(2)}/day) than weekends ($${avgWeekend.toFixed(2)}/day).`,
    hasNegativeGrowth: monthlyGrowth.some(m => m.growth !== null && m.growth < 0)
  };

  const systemInstruction = `
    You are a world-class Business Consultant for small business owners. 
    Your tone should be helpful, encouraging, and non-technical. Use simple business terms.
    
    KEY BUSINESS DATA:
    - Total Sales: $${dataSummary.totalRevenue.toFixed(2)}
    - Records: ${dataSummary.recordCount} rows of ${dataSummary.columnHeaders}
    - Highest Growth Period: ${dataSummary.highestGrowthMonth}
    - Weekly Patterns: ${dataSummary.weekendVsWeekday}
    - Top Performance: ${dataSummary.topSegments}
    - Monthly Performance List: ${dataSummary.revenueTrend}

    YOUR SPECIFIC TASKS:
    1. Tell the owner which specific month had the highest growth and explain if weekends are outperforming weekdays based on the data.
    2. If you see any negative growth in the data (Negative Growth Detected: ${dataSummary.hasNegativeGrowth}), suggest a basic marketing "sale" or "bundle" strategy for the upcoming month to counter historical slow periods.
    3. Keep advice actionable and non-technical. Reference specific numbers from the data provided.
    4. Keep responses under 180 words.
    5. If the user asks non-business questions, refocus them on their sales trends and growth opportunities.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    return response.text || "I've analyzed your data but couldn't generate a specific insight. Try asking me about your best-performing months or weekend sales!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
