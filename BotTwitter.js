const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class BotTwitter{
    constructor() {
        this.browser = null;
        this.page = null;
    }

    async initialize(options = {}) {
        const { proxyServer, userAgent, cookies } = options;

        const browserOptions = {
            headless: false, // Set headless to true for better performance
            args: []
        };

        if (proxyServer) {
            browserOptions.args.push(`--proxy-server=${proxyServer}`);
        }

        this.browser = await puppeteer.launch(browserOptions);
        this.page = await this.browser.newPage();

        if (userAgent) {
            await this.page.setUserAgent(userAgent);
        }

        if (cookies && Array.isArray(cookies)) {
            await this.page.setCookie(...cookies);
        }
    }
    
    async loadPage(url, options = {}) {
        if (!this.page) {
            throw new Error('Browser not initialized. Call initialize() first.');
        }
        await this.page.goto(url, options);
    }
    async getTrending(){
        await this.loadPage("https://x.com/explore/tabs/for-you")
    }
}

module.exports = BotTwitter;