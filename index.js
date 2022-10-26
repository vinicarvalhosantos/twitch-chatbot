require('dotenv/config');

const tmi = require("tmi.js");

const cron = require("node-cron");

const { getGamelistResult, checkStreamerInLive } = require("./src/twitch-requests")


const BOT_NAME = process.env.BOT_NAME;
const CHANNEL_NAME = process.env.CHANNEL_NAME;

const configuration = {
    identity: {
        username: BOT_NAME,
        password: process.env.TWITCH_TOKEN
    },
    channels: [CHANNEL_NAME]
};

cron.schedule("* * * * *", async () => {
	await checkStreamerInLive()
    const gamelist = await getGamelistResult()
    console.log(`gamelist -> ${gamelist}`)
})

const client = tmi.client(configuration);

//client.on("message", onMessage);

client.connect();
