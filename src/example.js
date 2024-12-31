const TwitterBot = require("./twitterBot")
const Database = require("./db")

async function main(tweetID) {
    const db = new Database()
    const cookies = await db.getUserRandomCookies("474ivi1i046ssa7");
    cookies.map( async (account)=> {
        let bot
        try {
            bot = new TwitterBot();
            let {id, cookie} = account
            await bot.initialize(cookie);
            await bot.performActions(tweetID);
            const currentCookie = await bot.page.cookies();
            await db.saveCookies({cookie:currentCookie})
        } catch (error) {
            switch (error.message) {
                case "Invalid or expired cookies":
                    await db.saveCookies(id,{status: "dead"})
                    break;
                default:
                    console.log(error.message);
                    await bot.close()
                    break;
            }
        } finally {
            
            await bot.close()
        }
    })
  }
  
main("1873598174218363305");