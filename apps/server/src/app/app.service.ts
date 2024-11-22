import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

export type ScrapeReturn = {
  cards: {
    name: string;
    id: string;
    price: {
      isDiscounted: boolean;
      amount: string;
    };
    image?: string;
    ingredients?: string[];
  }[];
};

@Injectable()
export class AppService {
  async scrapeWebPage(url: string): Promise<ScrapeReturn> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      const cards = await page.$$eval(
        '[data-test-id="horizontal-item-card"]',
        (cardElements) => {
          // Inside the callback, you can't access this, so we define the filterSimilarStrings function here
          const levenshtein = (a, b) => {
            const tmp = [];
            let i;
            let j;
            const alen = a.length;
            const blen = b.length;
            let ch;

            for (i = 0; i <= alen; i++) {
              tmp[i] = [i];
            }

            for (j = 0; j <= blen; j++) {
              tmp[0][j] = j;
            }

            for (i = 1; i <= alen; i++) {
              ch = a.charAt(i - 1);
              for (j = 1; j <= blen; j++) {
                tmp[i][j] = Math.min(
                  tmp[i - 1][j] + 1,
                  tmp[i][j - 1] + 1,
                  tmp[i - 1][j - 1] + (ch !== b.charAt(j - 1) ? 1 : 0),
                );
              }
            }
            return tmp[alen][blen];
          };

          const filterSimilarStrings = (strings, threshold = 0.2) => {
            const uniqueStrings = [];
            for (const str of strings) {
              let isUnique = true;
              for (const uniqueStr of uniqueStrings) {
                const distance = levenshtein(str, uniqueStr);
                const similarity =
                  1 - distance / Math.max(str.length, uniqueStr.length);
                if (similarity >= 1 - threshold) {
                  isUnique = false;
                  break;
                }
              }
              if (isUnique) {
                uniqueStrings.push(str);
              }
            }
            return uniqueStrings;
          };

          return cardElements.map((card) => {
            const name = card.querySelector(
              '[data-test-id="horizontal-item-card-header"]',
            ).innerHTML;

            const id = card.firstElementChild.getAttribute('id');

            const price = {
              isDiscounted: false,
              amount: '',
            };

            const discountPrice = card.querySelector(
              '[data-test-id="horizontal-item-card-discounted-price"]',
            )?.innerHTML;

            if (discountPrice) {
              price.isDiscounted = true;
              price.amount = discountPrice;
            } else {
              price.amount = card.querySelector(
                '[data-test-id="horizontal-item-card-price"]',
              )?.innerHTML;
            }

            const imageUrl = card.querySelector('img').getAttribute('srcset');

            const ingredientsElement = card.querySelector(
              '[data-test-id="horizontal-item-card-header"] + p',
            ).innerHTML;
            const ingredients = ingredientsElement
              .trim()
              .toLowerCase()
              .split(',')
              .filter((item) => item !== '')
              .map((item) => item.trim());

            const filteredIngredients = filterSimilarStrings(ingredients);

            return {
              name,
              id,
              price,
              image: imageUrl,
              ingredients: filteredIngredients,
            };
          });
        },
      );

      return { cards };
    } catch (error) {
      throw Error(error);
    } finally {
      await browser.close();
    }
  }
}
