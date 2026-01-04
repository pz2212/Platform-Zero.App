
import { GoogleGenAI, Type } from "@google/genai";
import { mockService } from "./mockDataService";
import { User, UserRole } from "../types";

export interface CommLog {
  id: string;
  timestamp: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  type: 'INVITE' | 'CONFIRMATION' | 'ORDER_UPDATE' | 'PRICE_AUDIT';
  status: 'SENT' | 'DELIVERED' | 'BOUNCED';
  provider: 'SENDGRID_INTEGRATION' | 'SES_SIMULATOR';
}

export const emailService = {
  /**
   * Generates a professional B2B email using Gemini and logs it to the platform ledger.
   */
  sendSmartEmail: async (
    recipient: { email: string; name: string; businessName: string; role?: UserRole },
    type: CommLog['type'],
    context: any
  ): Promise<boolean> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const prompt = `
        You are the Automated Communications Officer for Platform Zero, a premium B2B fresh produce marketplace.
        Write a professional, high-conversion B2B email for the following scenario:
        
        RECIPIENT: ${recipient.name} at ${recipient.businessName} (${recipient.role || 'Partner'})
        EMAIL TYPE: ${type}
        CONTEXT: ${JSON.stringify(context)}
        
        Guidelines:
        - Tone: Professional, urgent (but friendly), and tech-forward.
        - Formatting: Use HTML-style line breaks (<br/>). 
        - Include a clear Call to Action.
        
        Return ONLY a JSON object:
        {
          "subject": "Clear, catchy B2B subject line",
          "body": "The full email body text"
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    subject: { type: Type.STRING },
                    body: { type: Type.STRING }
                },
                required: ["subject", "body"]
            }
        }
      });

      const emailContent = JSON.parse(response.text);

      // Log the "Delivery" to our observable ledger
      const log: CommLog = {
        id: `msg-${Date.now()}`,
        timestamp: new Date().toISOString(),
        recipientEmail: recipient.email,
        recipientName: recipient.name,
        subject: emailContent.subject,
        body: emailContent.body,
        type: type,
        status: 'DELIVERED',
        provider: 'SENDGRID_INTEGRATION'
      };

      // @ts-ignore - extending mock service dynamically for this update
      mockService.logCommunication(log);
      
      return true;
    } catch (error) {
      console.error("Email Service Error:", error);
      return false;
    }
  }
};
