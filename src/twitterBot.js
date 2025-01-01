const puppeteer = require('puppeteer');
const config = require('./config');
const Database = require('./db');

class TwitterBot {
  constructor() {
    this.db = new Database();
  }

  async initialize(cookie) {
    const { userAgent } = config.puppeteerConfig;

    this.browser = await puppeteer.launch(config.puppeteerConfig);
    this.page = await this.browser.newPage();

    if (userAgent) {
        await this.page.setUserAgent(userAgent);
    }

    
    await this.page.setCookie(...cookie);
    
    await this.page.goto(config.baseUrl);
    // Verify login status
    const isLoggedIn = await this.checkLoginStatus();
    if (!isLoggedIn) {
      throw new Error('Invalid or expired cookies');
    }
  }

  async checkLoginStatus() {
    try {
      // Check for elements that only appear when logged in
      await this.page.waitForSelector('[data-testid="SideNav_AccountSwitcher_Button"]', 
        { timeout: 5000, waitUntil: 'networkidle0' });
      return true;
    } catch (error) {
      return false;
    }
  }

  async performActions(targetAccount) {
    // Navigate to target account
    await this.page.goto(`${config.baseUrl}/i/web/status/${targetAccount}`);
    await this.page.waitForSelector('[data-testid="tweet"]');

    const tweets = await this.page.$('[data-testid="tweet"]');

    try {
        const performLike = await this.likeTweet(tweets)
        console.log(`${targetAccount} ${performLike?"liked":"Already liked"}`)
        const performRetweet = await this.retweetTweet(tweets);
        console.log(`${targetAccount} ${performRetweet?"Retweeted":"Already Retweeted"}`)
    } catch (error) {
        console.log(error.message)
    }
  }

  async likeTweet(tweetElement) {
    const likeSelector = '[data-testid="like"]';
    const unlikeSelector = '[data-testid="unlike"]';

    const element = await Promise.race([
        tweetElement.waitForSelector(likeSelector, { timeout: 5000 }),
        tweetElement.waitForSelector(unlikeSelector, { timeout: 5000 }),
    ]);


    const selector = await element.evaluate(el => el.getAttribute('data-testid'));

    if(selector === "like"){
      await tweetElement.waitForSelector('[data-testid="like"]');
      const likeButton = await tweetElement.$('[data-testid="like"]');
      await likeButton.click();
      return true
    }
    return false;
  }

  async retweetTweet(tweetElement) {
    const retweetSelector = '[data-testid="retweet"]';
    const unretweetSelector = '[data-testid="unretweet"]';

    const element = await Promise.race([
        tweetElement.waitForSelector(retweetSelector, { timeout: 5000 }),
        tweetElement.waitForSelector(unretweetSelector, { timeout: 5000 }),
    ]);


    const selector = await element.evaluate(el => el.getAttribute('data-testid'));

    if(selector === "retweet"){
        const retweetButton = await tweetElement.$('[data-testid="retweet"]');
        await retweetButton.click();
        // Wait for retweet confirmation dialog and click
        await this.page.waitForSelector('[data-testid="retweetConfirm"]');
        await this.page.click('[data-testid="retweetConfirm"]');
        return true
    }
    return false;
  }

  async randomDelay(min, max) {
    const delay = Math.floor(Math.random() * (max - min + 1) + min);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = TwitterBot;