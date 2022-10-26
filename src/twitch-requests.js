const { default: axios } = require("axios");
const moment = require('moment-timezone');
const { containsList, randomItemFromList } = require("./utils")

const clientId = process.env.TWITCH_CLIENT_ID
const ignoreGames = process.env.IGNORE_GAMES.split(";")
const defaultGamelistMessages = process.env.GAMELIST_DEFAULT_MESSAGE.split(";")

const OFFLINE_RESULT = "Offline"

let gamesPlayed = []
let gamelistString = ""
let isStreamingOn = true
let twitchToken = {
    accessToken: null,
    expiresIn: null
}

const getGamelistResult = async () => {

    if (!isStreamingOn) {
        gamesPlayed = []
        return OFFLINE_RESULT;
    }

    if (!isValidToken()) {
        await getTwitchToken();
    }

    const playingGame = await getStreamerPlayingGame()

    if (playingGame === null) {
        return gamelistString;
    }

    if (containsList(ignoreGames, playingGame)) {
        return gamelistString;
    }

    gamesPlayed.push(playingGame)

    switch (gamesPlayed.length) {
        case 0:
            gamelistString = playingGame
            break;
        case 1:
            gamelistString = gamelistString.concat(` ${playingGame}`)
            break;
        default:
            gamelistString = gamelistString.concat(` | ${playingGame}`)
            break;
    }

    return gamelistString;

}

const getTwitchToken = async () => {
    const idUrlBase = process.env.TWITCH_ID_URL_BASE

    const clientSecret = process.env.TWITCH_CLIENT_SECRET

    console.log("Getting a twitch token!\n")

    await axios.post(`${idUrlBase}/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`).then(response => {

        if (response.status === 200) {

            twitchToken.accessToken = response.data.access_token
            twitchToken.expiresIn = Math.round((new Date()) + response.data.expires_in)
            console.info("Twitch token successfully got!\n")

        }
    }).catch(err => {
        console.error(`Was not possible to get a twitch token!\n ${err}\n`)
    })
}

const isValidToken = () => {
    if (twitchToken.expiresIn === null || twitchToken.accessToken === null) {
        return false;
    }

    if (moment(twitchToken.expiresIn).isAfter(new Date())) {
        return false;
    }

    return true;

}

const getStreamerPlayingGame = async () => {
    const data = await getStreamerStreamData()

    if (data.length === 0) {

        isStreamingOn = false
        gamesPlayed = []

        return OFFLINE_RESULT
    } else {

        if (gamesPlayed.length === 0) {
            gamelistString = randomItemFromList(defaultGamelistMessages)
        }

        isStreamingOn = true
        const playingGame = data[0].game_name

        if (!containsList(gamesPlayed, playingGame)) {

            return playingGame
        }

        return null
    }
}

const getStreamerStreamData = async () => {
    const apiUrlBase = process.env.TWITCH_API_URL_BASE;

    const userId = process.env.TWITCH_USER_ID

    const config = {
        headers: {
            "Authorization": `Bearer ${twitchToken.accessToken}`,
            "client-id": clientId
        }
    }

    return await axios.get(`${apiUrlBase}/streams?user_id=${userId}`, config).then(resp => {
        if (resp.status === 200) {

            return resp.data.data

        }

        return []
    }).catch((err) => {
        console.error(`An error occurred when try to get the playing game: ${err}`)
        return null
    })

}

const checkStreamerInLive = async () => {
    if (!isValidToken()) {
        await getTwitchToken();
    }

    const streamData = await getStreamerStreamData()

    if (streamData.length === 0) {
        isStreamingOn = false
    } else {
        isStreamingOn = true
    }
}

module.exports = { getGamelistResult, checkStreamerInLive }

