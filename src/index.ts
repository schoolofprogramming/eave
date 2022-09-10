import { Client, Events } from "discord.js"
import { IntentOptions } from "./config/IntentOptions"
import { VoiceStateUpdateHandler } from "./handlers/VoiceStateUpdateHandler"
import { VoiceActivity } from "./VoiceActivity"

(async () => {
	const BOT = new Client({intents: IntentOptions})

	const updateHandler = new VoiceStateUpdateHandler(new VoiceActivity())

	BOT.on(Events.ClientReady, () => console.log("Connected"))
	BOT.on(Events.VoiceStateUpdate, updateHandler.handle.bind(updateHandler))

	await BOT.login(process.env.BOT_TOKEN)
})()

// TODO: Account for disconnects due to bad internet.
