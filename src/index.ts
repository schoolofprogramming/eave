import { Client, Events, TextChannel } from "discord.js"
import { IntentOptions } from "./config/IntentOptions"
import { VoiceStateUpdateHandler } from "./handlers/VoiceStateUpdateHandler"
import { VoiceActivity } from "./VoiceActivity"


(async () => {
	const BOT = new Client({intents: IntentOptions})
	const updateHandler = new VoiceStateUpdateHandler(new VoiceActivity())

	BOT.on(Events.ClientReady, async () => {
		console.log("Connected")

		const channel = await BOT.channels.fetch(process.env.CHANNEL_ID || "unwrap") as TextChannel

		if (!channel) {
			console.log("The server does not have a channel with that id.")
			return
		}

		updateHandler.setChannel(channel)
	})



	BOT.on(Events.VoiceStateUpdate, updateHandler.handle.bind(updateHandler))

	await BOT.login(process.env.BOT_TOKEN)
})()

// TODO: Account for disconnects due to bad internet.
