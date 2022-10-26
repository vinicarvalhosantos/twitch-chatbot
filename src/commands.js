const { containsList } = require("./utils")
const { getGamelistResult } = require("./twitch-requests")

const commandAlises = process.env.SET_GAME_COMMAND_ALIASES.split(";")

const onChangeGameCommand = (target, context, message, ehBot) => {

    const command = message.toLowerCase()

    if (containsList(commandAlises, command)) {
        console.log(getGamelistResult())
    }

}