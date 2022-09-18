import { TextChannel, VoiceState } from "discord.js"
import { VoiceActivity } from "../VoiceActivity"

// The minimum number of users to be present in a voice chat to start
// accounting for activity.
const MIN_MEMBER_COUNT = 2
// Then minimum number of seconds a Voice Chat Session should last to be
// considered worthy of reporting.
const MIN_VC_SESSION_DURATION = 30

const units = ['s', 'm', 'h']

function getSecondMinuteHours(seconds: number): number[] {
	const hours = seconds / 3600
	const minutes = seconds / 60

	const time = [Math.floor(seconds) % 60, Math.floor(minutes) % 60, Math.floor(hours)]

	let second_minute_hours = []

	for (let i = 0;	i < 3; i++) {
		if (time[i] === 0)
			break
		second_minute_hours.push(time[i])
	}

	return second_minute_hours
}

function timeArrayToString(timeArray: number[], unitIndex: number = 0): string[] {
	return timeArray.map((v, i) => `${v.toString()}${units[i + unitIndex]}`).reverse()
}

function getTimeString(seconds: number): string {
	return timeArrayToString(getSecondMinuteHours(seconds)).join(' ')
}

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
		// tracked, the voiceActivity will be untouched), otherwise if the old member
		// count drops below the threshold, stop tracking the activity and send
		// out a message with the duration of the session (if the activity
		// tracking was already stopped, the value returned will be `null`, else
		// will be equal the number of seconds the session was active for.
		const seconds = ((newMemberCount >= MIN_MEMBER_COUNT)
			? this.voiceActivity.start : (oldMemberCount < MIN_MEMBER_COUNT)
			? this.voiceActivity.stop  : () => null).bind(this.voiceActivity)()

		// If the duration of the voice chat session is less than `MIN_VC_SESSION_DURATION` seconds,
		// we don't want to report it as it was most probably an insignificant session.
		if (seconds == null || seconds < MIN_VC_SESSION_DURATION)
			return

		const time_log_str = getTimeString(seconds)

		console.log(`Voice Activity Duration: ${time_log_str}`)
		this.channel?.send(`Previous voice chat session lasted for *${time_log_str}*.`)

		this.voiceActivity.stop()
	}

	activityDuration(): string | null {
		if (!this.voiceActivity.state.is_active) {
			return null
		}

		const seconds = (Date.now() - this.voiceActivity.startTime) / 1000
		return timeArrayToString(getSecondMinuteHours(seconds).slice(1), 1).join(' ')
	}

	constructor(public voiceActivity: VoiceActivity) {
		this.channel = null
	}
}

export { VoiceStateUpdateHandler }
