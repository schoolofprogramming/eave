import { TextChannel, VoiceState } from "discord.js"
import { VoiceActivity } from "../VoiceActivity"

// The minimum number of users to be present in a voice chat to start
// accounting for activity.
const MIN_MEMBER_COUNT = 2

const units = ['s', 'm', 'h']

class VoiceStateUpdateHandler {
	channel: TextChannel | null

	setChannel(channel: TextChannel) {
		this.channel = channel
	}

	handle(oldState: VoiceState, newState: VoiceState) {
		let newMemberCount = newState.channel?.members.size || 0
		let oldMemberCount = oldState.channel?.members.size || 0

		console.log(`Members in ${oldState.channel?.name} (old): ${oldMemberCount}`)
		console.log(`Members in ${newState.channel?.name} (new): ${newMemberCount}`)

		// If nobody joined or left the chat, we have nothing to do.
		if (oldState.channel === newState.channel) {
			console.log("Nobody left or joined a voice chat")
			return
		}

		// If the channel is `null` in the `oldState`, it means
		// that the user newly joined voice, otherwise
		// if the channel is `null` in the `newState`, it means
		// that the user left the server.
		// If neither of the channels are `null`, it means the user
		// moved from one VC to another, as both of them being the same
		// is handled previously.
		let change = oldState.channel == null
			? 'entered' : newState.channel == null
			? 'left'    : 'moved'

		console.log(`${newState.member?.displayName} ${change}: ${oldState.channel?.name} -> ${newState.channel?.name}`);

		// If the new member count is greater than the threshold, we should
		// start tracking the activit (if the activity was already being
		// tracked, the state will be untouched), otherwise if the old member
		// count drops below the threshold, stop tracking the activity and send
		// out a message with the duration of the session (if the activity
		// tracking was already stopped, the value returned will be `null`, else
		// will be equal the number of seconds the session was active for.
		const seconds = ((newMemberCount >= MIN_MEMBER_COUNT)
			? this.state.start : (oldMemberCount < MIN_MEMBER_COUNT)
			? this.state.stop  : () => null).bind(this.state)()

		if (seconds == null)
			return

		const hours = seconds / 3600
		const minutes = seconds / 60

		const time = [Math.floor(seconds) % 60, Math.floor(minutes) % 60, Math.floor(hours)]

		let time_log = []

		for (let i = 0;	i < 3; i++) {
			if (time[i] === 0)
				break
			time_log.push(`${time[i]}${units[i]}`)
		}

		time_log.reverse()
		const time_log_str = time_log.join(' ')

		console.log(`Voice Activity Duration: ${time_log_str}`)
		this.channel?.send(`Previous voice chat session lasted for *${time_log_str}*.`)

		this.state.stop()
	}

	constructor(public state: VoiceActivity) {
		this.channel = null
	}
}

export { VoiceStateUpdateHandler }
