import { VoiceState } from "discord.js"
import { VoiceActivity } from "../VoiceActivity"

// The minimum number of users to be present in a voice chat to start
// accounting for activity.
const MIN_MEMBER_COUNT = 2

class VoiceStateUpdateHandler {
	handle(oldState: VoiceState, newState: VoiceState) {
		let newMemberCount = newState.channel?.members.size || 0
		let oldMemberCount = oldState.channel?.members.size || 0

		// If nobody joined or left the chat, we have nothing to do.
		if (oldState.channel == newState.channel) {
			console.log("Nobody left or joined a voice chat")
			return
		}

		if (newMemberCount >= MIN_MEMBER_COUNT) {
			// TODO: Start counting activity time for new channel
			this.state.start()
		}

		if (oldMemberCount < MIN_MEMBER_COUNT) {
			// TODO: Stop counting activity time for old channel
			this.state.stop()
		}

		console.log(`Members in old voice: ${oldMemberCount}`)
		console.log(`Members in new voice: ${newMemberCount}`)
	}

	constructor(public state: VoiceActivity) {}
}

export { VoiceStateUpdateHandler }
