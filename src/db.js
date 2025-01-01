// db.js
const PocketBase = require('pocketbase/cjs');
const config = require('./config');

class Database {
  constructor() {
    this.pb = new PocketBase(config.dbUrl);
  }

  async saveCookie(id, options = {}) {
    const {cookie, status} = options

    return await this.pb.collection('cookies').update(id,{
      cookie: JSON.stringify(cookie),
      status
    });
  }

  
  async getUserRandomCookies(accountId, limit =5) {
    try {
      const record = await this.pb.collection('cookies')
        .getList(1, limit, {
            sort: "@random",
            filter: `status="live"`
        })
      return record?.items.map(({ id, cookie }) => ({ id, cookie }))
    } catch (error) {
      console.error(`No cookies found for account ${accountId}`);
      return null;
    }
  }
}

module.exports = Database;