import { GoogleGenAI, Type } from "@google/genai";
// Moved ParsedOrderItem to types and imported here
import { InventoryItem, Product, ProductUnit, ParsedOrderItem } from "../types";

export interface InvoiceItem {
  name: string;
  qty: number;
  marketRate: number; // The price on the invoice
  pzRate: number; // Calculated/Mocked PZ price
}

export interface SeasonalProduct {
    name: string;
    category: 'Vegetable' | 'Fruit';
    variety: string;
    co2Savings: number;
}

export const calculateAcceptanceProbability = async (
  productName: string,
  invoicePrice: number,
  targetPrice: number,
  offeredPrice: number
): Promise<{ probability: number; rationale: string }> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze the following B2B produce quote scenario and return the probability (0-100) of the customer accepting this offer.
            
            Scenario:
            - Product: "${productName}"
            - Customer's current price (from invoice): $${invoicePrice.toFixed(2)}
            - Platform Zero Target (Ideal savings): $${targetPrice.toFixed(2)}
            - Wholesaler's Offered Price: $${offeredPrice.toFixed(2)}
            
            Guidelines:
            - If offer <= target, probability is extremely high (95%+).
            - If offer >= invoice, probability is extremely low (<5%).
            - Customers value savings but also reliability.
            
            Return ONLY a JSON object:
            {
              "probability": (number),
              "rationale": (string, max 15 words)
            }`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        probability: { type: Type.NUMBER },
                        rationale: { type: Type.STRING }
                    },
                    required: ["probability", "rationale"]
                }
            }
        });

        const result = response.text;
        if (result) {
            return JSON.parse(result);
        }
        return { probability: 50, rationale: "Data unavailable." };
    } catch (error) {
        console.error("Gemini Probability Error:", error);
        return { probability: 50, rationale: "AI Analysis offline." };
    }
};

export const generateEnvironmentalImpact = async (name: string, variety: string): Promise<{co2: number, water: number, waste: number}> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate estimated environmental impact metrics for 1kg of "${name}" (Variety: ${variety}) if it were saved from landfill through a direct marketplace.
            
            Return ONLY a JSON object with:
            - "co2": (number) kg of CO2 emissions avoided by direct supply chain bypass.
            - "water": (number) Liters of freshwater saved/preserved by avoiding waste.
            - "waste": (number) kg of produce diverted (usually 1.0 for 1kg product).
            
            Base these on scientific agricultural averages for the specific produce type.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        co2: { type: Type.NUMBER },
                        water: { type: Type.NUMBER },
                        waste: { type: Type.NUMBER }
                    },
                    required: ["co2", "water", "waste"]
                }
            }
        });

        const result = response.text;
        if (result) {
            return JSON.parse(result);
        }
        return { co2: 0.8, water: 50, waste: 1.0 };
    } catch (error) {
        console.error("Gemini Impact Generation Error:", error);
        return { co2: 0.8, water: 50, waste: 1.0 };
    }
};

export const parseNaturalLanguageOrder = async (text: string, catalog: Product[]): Promise<ParsedOrderItem[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Provide catalog context to AI for better matching
    const catalogSummary = catalog.map(p => `${p.name} (${p.variety}) [ID: ${p.id}]`).join(', ');

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Convert this natural language produce order into a structured JSON array.
            
            Order Text: "${text}"
            
            Marketplace Catalog: ${catalogSummary}
            
            Strict Rules:
            1. For each item mentioned, return "productName", "quantity" (number), and "unit".
            2. "unit" must be one of: KG, Tray, Each, Loose, Bag. Default to KG if unknown or "bags" mentioned.
            3. CRITICAL: If the user input is a generic term (e.g. "bananas", "banans", "tomatoes", "potatoes") and multiple variations exist in the Marketplace Catalog, you MUST set "isAmbiguous" to true.
            4. If "isAmbiguous" is true, provide ALL relevant variation Product IDs in "suggestedProductIds".
            5. ONLY set "selectedProductId" if the name is an exact and unambiguous match.
            6. Handle misspellings (e.g. "banans" should be matched against "Bananas" variants).
            
            Return ONLY a JSON array of objects.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            productName: { type: Type.STRING },
                            quantity: { type: Type.NUMBER },
                            unit: { type: Type.STRING, enum: ["KG", "Tray", "Each", "Loose", "Bag"] },
                            isAmbiguous: { type: Type.BOOLEAN },
                            suggestedProductIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                            selectedProductId: { type: Type.STRING }
                        },
                        required: ["productName", "quantity", "unit"]
                    }
                }
            }
        });

        const result = response.text;
        if (result) {
            return JSON.parse(result);
        }
        return [];
    } catch (error) {
        console.error("Gemini Order Parsing Error:", error);
        return [];
    }
};

export const generateSeasonalCatalog = async (): Promise<SeasonalProduct[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Identify 15-20 fruits and vegetables that are currently in peak season in Australia for the month of ${currentMonth}.
            For each item provide:
            - 'name' (e.g. "Broccolini", "Mangoes")
            - 'category' (Must be exactly "Fruit" or "Vegetable")
            - 'variety' (A specific common variety found in AU markets)
            - 'co2Savings' (A number between 0.5 and 2.5 representing kg CO2 avoided by sourcing local seasonal stock).
            
            Return ONLY a valid JSON array of objects.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            category: { type: Type.STRING, enum: ["Fruit", "Vegetable"] },
                            variety: { type: Type.STRING },
                            co2Savings: { type: Type.NUMBER }
                        },
                        required: ["name", "category", "variety", "co2Savings"]
                    }
                }
            }
        });

        const text = response.text;
        if (text) {
            return JSON.parse(text);
        }
        return [];
    } catch (error) {
        console.error("Gemini Seasonal Catalog Error:", error);
        return [];
    }
};

export const getMarketAnalysis = async (inventory: InventoryItem[], products: Product[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const model = 'gemini-3-flash-preview';
    const inventorySummary = inventory.map(i => {
      const product = products.find(p => p.id === i.productId);
      return `- ${product?.name}: ${i.quantityKg}kg, Expires: ${new Date(i.expiryDate).toLocaleDateString()}`;
    }).join('\n');

    const prompt = `
      You are an expert agricultural market analyst for Platform Zero, a B2B produce marketplace.
      Here is the current inventory available on the platform:
      ${inventorySummary}
      Please provide a concise market analysis (max 150 words). 
      Highlight:
      1. Which items are in oversupply (risk of waste).
      2. Suggestions for dynamic pricing (e.g., discount items expiring soon).
      3. A quick sustainability tip for farmers.
      Format the output with bold headers.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI Market Analysis is currently unavailable.";
  }
};

export const getPricingAdvice = async (productName: string, quantity: number, daysToExpiry: number): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `I have ${quantity}kg of ${productName} that expires in ${daysToExpiry} days. 
            Give me a specific pricing strategy to maximize revenue while ensuring it sells before expiry.
            Keep it under 3 sentences.`
        });
        return response.text || "No advice available.";
    } catch (e) {
        return "Could not fetch pricing advice.";
    }
}

export const identifyProductFromImage = async (base64Image: string): Promise<{ name: string; quality: string; confidence: number }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: `You are a Senior Produce Quality Inspector for Platform Zero Marketplace. 
            Analyze this image and identify the specific fresh produce.
            
            Key identification markers:
            - Onions (Brown/Red/White): Look for papery, dry skins and a hairy root base.
            - Eggplants: Look for smooth, glossy, deep purple or striped skin and a green calyx/stem.
            - Potatoes: Look for earth-covered skin or eyes.
            
            Be precise. If you see Brown Onions, call them "Brown Onions". 
            
            Return a JSON object with:
            'name': (string) The common market name of the product.
            'quality': (string) A brief 5-word quality assessment focusing on freshness and grading.`
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        // Added responseSchema for better structured output reliability
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                quality: { type: Type.STRING }
            },
            required: ["name", "quality"]
        }
      }
    });

    const text = response.text;
    if (text) {
        const json = JSON.parse(text);
        return {
            name: json.name || "Unknown Produce",
            quality: json.quality || "Standard Quality",
            confidence: 0.98
        };
    }
    throw new Error("No text returned");
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    // Returning a safer generic instead of hardcoded "Eggplants"
    return { name: "Analyzing...", quality: "Detection failed. Please select manually.", confidence: 0 };
  }
};

export const extractInvoiceItems = async (base64Data: string, mimeType: string): Promise<InvoiceItem[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `Analyze this food invoice image/document. Extract a list of line items found in the document.
            For each item return: 
            - 'name' (string, e.g. "Tomatoes Truss")
            - 'qty' (number, defaults to 1 if not found)
            - 'marketRate' (number, the unit price on the invoice).
            
            Also estimate a 'pzRate' (number) for each item, which represents a "Platform Zero" wholesale price. The pzRate should generally be 15-25% lower than the marketRate found on the invoice.
            Return ONLY a JSON array of objects.`
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        // Added responseSchema for robust item extraction from documents
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    qty: { type: Type.NUMBER },
                    marketRate: { type: Type.NUMBER },
                    pzRate: { type: Type.NUMBER }
                },
                required: ["name", "qty", "marketRate", "pzRate"]
            }
        }
      }
    });

    const text = response.text;
    if (text) {
        return JSON.parse(text);
    }
    return [];
  } catch (error) {
    console.error("Gemini Invoice Analysis Error:", error);
    return [];
  }
};