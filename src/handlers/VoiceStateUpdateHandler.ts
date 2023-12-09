import { TextChannel, VoiceState } from "discord.js"
import { VoiceActivity } from "../VoiceActivity"

// The minimum number of users to be present in a voice chat to start
// accounting for activity.
const MIN_MEMBER_COUNT = 2
// Then minimum number of seconds a Voice Chat Session should last to be
// considered worthy of reporting.
const MIN_VC_SESSION_DURATION = 30

const units = ['h', 'm', 's']

function getHourMinuteSeconds(seconds: number): number[] {
	const hours = seconds / 3600
	const minutes = seconds / 60

	const time = [Math.floor(hours), Math.floor(minutes) % 60, Math.floor(seconds) % 60]

	let hour_minute_seconds = []

	for (let i = 0;	i < 3; i++) {
		hour_minute_seconds.push(time[i])
	}

	return hour_minute_seconds
}

function timeArrayToString(timeArray: number[]): string {
	return timeArray
		.map((v, i) => [v, units[i]])
		.filter(v => v[0])
		.map(v => v.join(''))
		.join(' ')
}

function getTimeString(seconds: number): string {
	return timeArrayToString(getHourMinuteSeconds(seconds))
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

		// FIXME: Don't count the activity if people are in `AFK` channel.

		// FIXME: Activity happening in channels other than active vc can break the logic.
		//
		// If there are two people in one VC, and a new person joins another VC,
		// and leaves it to join another VC, other than the one where there were two already,
		// this logic breaks.
		//
		// *Old State*
		// Foo: 07734willy, theteachr
		// Bar: ForgotMyLemonade
		// Baz:
		//
		// *New State*
		// Foo: 07734willy, theteachr
		// Bar:
		// Baz: ForgotMyLemonade
		//
		// `ForgotMyLemonade` jumped from `Bar` to `Baz`, `oldMemberCount` and `newMemberCount`
		// equal `0` and `1`, less than the threshold, which will result in the activity being stopped,
		// even though `07734willy` and `theteachr` were still having a discussion.

		// If the new member count is greater than the threshold, we should
		// start tracking the activity (if the activity was already being
		// tracked, the `voiceActivity` will be untouched), otherwise, if the old member
		// count drops below the threshold, stop tracking the activity and send
		// out a message with the duration of the session (if the activity
		// tracking was already stopped, the value returned will be `null`, else
		// will be equal the number of seconds the session was active for.
		const seconds = ((newMemberCount >= MIN_MEMBER_COUNT)
			? this.voiceActivity.start : (oldMemberCount < MIN_MEMBER_COUNT)
			? this.voiceActivity.stop  : () => null).bind(this.voiceActivity)() // XXX

		// If the duration of the voice chat session is less than `MIN_VC_SESSION_DURATION` seconds,
		// we don't want to report it as it was most probably an insignificant session.
		if (seconds == null || seconds < MIN_VC_SESSION_DURATION)
			return

		const time_log_str = getTimeString(seconds)

		console.log(`Voice Activity Duration: ${time_log_str}`)
		this.channel?.send(`Previous voice chat lasted for *${time_log_str}*.`)
	}

	activityDuration(): string | null {
		if (!this.voiceActivity.state.is_active) {
			return null
		}

		const seconds = (Date.now() - this.voiceActivity.startTime) / 1000
		return timeArrayToString(getHourMinuteSeconds(seconds).slice(0, 2))
	}

	constructor(public voiceActivity: VoiceActivity) {
		this.channel = null
	}
}

export { VoiceStateUpdateHandler }
