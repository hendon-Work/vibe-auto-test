import { chromium } from 'playwright';

export interface ScrapedData {
  url: string;
  title: string;
  interactives: Array<{
    tag: string;
    text: string;
    id: string;
    name: string;
    placeholder: string;
    href: string;
  }>;
  bodyText: string;
}

export async function scrapeWebsite(url: string): Promise<ScrapedData> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    // Wait an additional second for any dynamic content
    await page.waitForTimeout(1000);

    const title = await page.title();

    const data = await page.evaluate(() => {
      // Gather all interactive elements
      const elements = Array.from(document.querySelectorAll('input, button, a, select, textarea')).map(el => {
        const typeEl = el as HTMLElement;
        const inputEl = el as HTMLInputElement;
        const anchorEl = el as HTMLAnchorElement;
        
        return {
          tag: typeEl.tagName.toLowerCase(),
          text: typeEl.innerText?.trim() || '',
          id: typeEl.id || '',
          name: inputEl.name || '',
          placeholder: inputEl.placeholder || '',
          href: anchorEl.href || ''
        };
      });

      // Gather significant body text efficiently
      const bodyText = document.body.innerText.substring(0, 10000); // 10k chars max to save context window

      return { interactives: elements, bodyText };
    });

    return {
      url: page.url(),
      title,
      interactives: data.interactives,
      bodyText: data.bodyText
    };
  } catch (error: any) {
    throw new Error(`Scraping failed: ${error.message}`);
  } finally {
    await context.close();
    await browser.close();
  }
}
