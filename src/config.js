const config = {
    baseUrl: 'https://x.com',
    dbUrl: 'https://twitter-bot.pockethost.io/', // PocketBase URL
    puppeteerConfig: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        // `--proxy-server=${proxyServer}`
      ],
      defaultViewport: { width: 1280, height: 800 }
    }
  };
  
module.exports = config;