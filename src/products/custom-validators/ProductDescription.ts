import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

type ProductDetails = {
  name?: string;
  price?: number | string;
  specs?: Record<string, string>;
  image?: string;
};

@ValidatorConstraint({
  name: 'ProductDescription',
  async: true,
})
export class ProductDescription implements ValidatorConstraintInterface {
  message: string = '';
  private readonly models = ['gemini-3.5-flash-lite', 'gemini-3.6-flash'];

  async validate(description: string, args: ValidationArguments) {
    dotenv.config();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const product = (args?.object ?? {}) as ProductDetails;
    const prompt = this.buildPrompt(description, product);

    try {
      const result = await this.generateWithFallback(genAI, prompt);
      const isValid = !result.response.text().toLowerCase().includes('invalid');
      if (!isValid) this.message = result.response.text();

      return isValid;
    } catch (error) {
      this.message =
        error instanceof Error
          ? `Description validation failed: ${error.message}`
          : 'Description validation failed';
      return false;
    }
  }

  private generateWithFallback(genAI: GoogleGenerativeAI, prompt: string) {
    return this.tryGenerate(genAI, prompt, 0, 1);
  }

  private async tryGenerate(
    genAI: GoogleGenerativeAI,
    prompt: string,
    modelIndex: number,
    attempt: number,
    lastError?: unknown,
  ) {
    if (modelIndex >= this.models.length) {
      throw lastError ?? new Error('Description validation failed');
    }

    const model = genAI.getGenerativeModel({
      model: this.models[modelIndex],
    });

    try {
      return await model.generateContent(prompt);
    } catch (error) {
      if (this.isRetryable(error) && attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
        return this.tryGenerate(genAI, prompt, modelIndex, attempt + 1, error);
      }

      return this.tryGenerate(genAI, prompt, modelIndex + 1, 1, error);
    }
  }

  private isRetryable(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return (
      message.includes('503') ||
      message.includes('429') ||
      message.includes('high demand')
    );
  }

  defaultMessage() {
    return this.message;
  }

  private buildPrompt(description: string, product: ProductDetails) {
    const specs =
      product.specs && Object.keys(product.specs).length > 0
        ? JSON.stringify(product.specs)
        : 'not provided';

    return `
      Given the product details below, check if the description is valid from a user perspective.
      The description must not contain offensive content, vague information, or claims that contradict or mislead compared to the other product details (name, price, specs).
      For example, a description mentioning "24 Go RAM" is invalid if specs list 8 Go RAM, and describing a product as cheaper than a phone charger is invalid if the price is 2000.
      Product name: "${product.name ?? 'not provided'}"
      Price: "${product.price ?? 'not provided'}"
      Specs: ${specs}
      Image: "${product.image ?? 'not provided'}"
      Description: "${description}"
      If you think the description is valid, please return "valid". Otherwise type "invalid" and the reason why you think it's invalid.
      The response should be sent in a human-readable format, since it will be used to send feedback to the client.
    `.trim();
  }
}
