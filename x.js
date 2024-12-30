const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class BrowserAutomation {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    generateId() {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      return Array.from({length: 6}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

    async initialize(options = {}) {
        const { proxyServer, userAgent, cookies } = options;

        const browserOptions = {
            headless: true, // Set headless to true for better performance
            args: []
        };

        if (proxyServer) {
            browserOptions.args.push(`--proxy-server=${proxyServer}`);
        }

        this.browser = await puppeteer.launch(browserOptions);
        this.page = this.browser

        if (userAgent) {
            await this.page.setUserAgent(userAgent);
        }

        if (cookies && Array.isArray(cookies)) {
            await this.page.setCookie(...cookies);
        }
    }

    async openReel() {
        await this.loadPage('https://m.facebook.com/reel', { waitUntil: 'networkidle0' });
    }

    async checkIsLoggedIn() {
        const regexString = '.*?facebook\\.com/login/';
        const hasMatchingLink = await this.page.$$eval('a', (links, regexString) => {
            const regex = new RegExp(regexString, 'gm');
            return links.some(link => regex.test(link.href));
        }, regexString);

        if (hasMatchingLink) {
            await automation.moveCookieToDeadFolder(cookiePath);
            throw new Error('User is not logged in');
        }
    }

    async sendReelComment(str) {
        await this.checkIsLoggedIn();

        const init = "#screen-root > div > div.m.vscroller.vscroller-snap.vscroller-snap-start.disable-virtualization.force-reset-scroll-height > div:nth-child(4) > div:nth-child(16)";
        await this.page.waitForSelector(init);
        await this.page.click(init);

        const videoId = await this.page.$eval('#screen-root > div > div.m.vscroller.vscroller-snap.vscroller-snap-start.disable-virtualization.force-reset-scroll-height > div:nth-child(4) > div:nth-child(1) > div:nth-child(4)', (element) => {
            return element.getAttribute('data-video-id');
        });

        await this.page.waitForSelector('textarea');
        await this.page.type('textarea', str);
        await this.page.click("#screen-root div:nth-child(2) > div > div:nth-child(4) > div:nth-child(1) > div > div:nth-child(2) > div > div");

        console.log(`Success: https://facebook.com/${videoId}`);
    }

    async loadPage(url, options = {}) {
        if (!this.page) {
            throw new Error('Browser not initialized. Call initialize() first.');
        }
        await this.page.goto(url, options);
    }

    async getCookies() {
        return await this.page.cookies();
    }

    async saveCookiesToFile(filepath) {
        const cookies = await this.getCookies();
        await fs.writeFile(filepath, JSON.stringify(cookies, null, 2));
    }

    async loadCookiesFromFile(filepath) {
        try {
            const cookieData = await fs.readFile(filepath, 'utf8');
            const cookies = JSON.parse(cookieData);
            await this.page.setCookie(...cookies);
        } catch (error) {
            console.error('Error loading cookies:', error);
            throw error;
        }
    }

    generateSpintaxText(spintax) {
      // Helper function to replace spintax patterns with a random choice
      function replaceRandom(text) {
          const regex = /\{([^}]+)\}/; // Match the first spintax pattern
          const match = text.match(regex);
  
          if (!match) return text; // No more spintax patterns, return the text
  
          const options = match[1].split('|'); // Split the options by '|'
          const randomOption = options[Math.floor(Math.random() * options.length)]; // Pick a random option
  
          // Replace the spintax with the chosen option and process recursively
          return replaceRandom(text.replace(match[0], randomOption));
      }
  
      return replaceRandom(spintax);
    }

    async moveCookieToDeadFolder(cookieFilePath) {
        const deadFolder = path.join(path.dirname(cookieFilePath), '../dead');
        await fs.mkdir(deadFolder, { recursive: true });

        const deadCookiePath = path.join(deadFolder, path.basename(cookieFilePath));
        await fs.rename(cookieFilePath, deadCookiePath);
        console.log(`Moved cookie to dead folder: ${deadCookiePath}`);
    }

    async retryFunction(func, maxRetries = 3, delay = 2000) {
        let attempt = 0;
        while (attempt < maxRetries) {
            try {
                return await func();
            } catch (error) {
                attempt++;
                console.error(`Attempt ${attempt} failed. Retrying in ${delay / 1000}s...`);
                if (attempt >= maxRetries) {
                    throw error;
                }
                await this.delay(delay);
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    shuffleArray(array) {
      for (let i = array.length - 1; i >= 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
      }
  }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
    }
}

// Function to scan cookies directory and handle multiple instances
async function handleMultipleInstances(max = 3 ) {
    const cookieDir = path.join(__dirname, 'cookies', 'live');
    const cookieFiles = await fs.readdir(cookieDir);

    // Filter for JSON cookie files
    const cookieFilePaths = cookieFiles
        .filter(file => file.endsWith('.json'))
        .map(file => path.join(cookieDir, file));

    const browserInstances = cookieFilePaths.map(async (cookiePath, index) => {
        const automation = new BrowserAutomation();

        try {
            console.log(`Starting instance ${index + 1} with cookie file: ${cookiePath}`);
            await automation.initialize({userAgent: 'Mozilla/5.0 (Linux; U; Android 5.0.2; zh-CN; Redmi Note 3 Build/LRX22G) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 OPR/11.2.3.102637 Mobile Safari/537.36'});

            // Load cookies from the current file
            await automation.loadCookiesFromFile(cookiePath);

            // Retry opening the reel and sending comment
            await automation.retryFunction(async () => {
                const readMassage = await fs.readFile('message.json', 'utf8')
                let massage = JSON.parse(readMassage); // Parse the JSON string
                automation.shuffleArray(massage)
                const comment = automation.generateSpintaxText(massage[0])
                await automation.openReel();
                await automation.sendReelComment(`${comment}\nhttps://gifhub.my.id/go/${automation.generateId()}`);
            });

            // Save cookies back to file (if needed)
            await automation.saveCookiesToFile(cookiePath);

        } catch (error) {
            console.error(`Error in instance ${index + 1}:`, error);

        } finally {
            await automation.close();
        }
    });

    // Run concurrently with max 3 instances
    await Promise.all(browserInstances.slice(0, max));
}

async function run() {
    await handleMultipleInstances();
}

run();
