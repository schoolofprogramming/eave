import { ActivityType, PresenceUpdateStatus } from "discord.js"

export class ActivityStatus {
	public msg: string
	public name: ActivityType.Watching | ActivityType.Listening
	public status: PresenceUpdateStatus.Online | PresenceUpdateStatus.Idle

	constructor(duration: string | null) {
		[this.name, this.msg, this.status] = duration
			? [ActivityType.Listening, `since ${duration}`, PresenceUpdateStatus.Online]
			: [ActivityType.Watching, 'for Voice Activity', PresenceUpdateStatus.Idle]
	}
}
