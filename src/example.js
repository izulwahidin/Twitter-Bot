const TwitterBot = require("./twitterBot")
const Database = require("./db")

async function main(tweetID) {
    const db = new Database()
    const cookies = await db.getUserRandomCookies("474ivi1i046ssa7");
    for (const account of cookies) {
    // cookies.map( async (account)=> {
        const bot = new TwitterBot();
        let {id, cookie} = account
        try {
            await bot.initialize(cookie);
            await bot.performActions(tweetID);
            const currentCookie = await bot.page.cookies();
            await db.saveCookies(id,{cookie:currentCookie})
        } catch (error) {
            console.log(error.message)
            switch (error.message) {
                case "Invalid or expired cookies":
                    await db.saveCookies(id,{status: "dead"})
                    break;
                default:
                    console.log(error.message);
                    break;
            }
        } finally {
            await bot.close()
        }
    // })
    }
  }
  
main("1874390779084546522");