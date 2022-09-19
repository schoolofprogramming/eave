import { ActivityType } from "discord.js"

export class ActivityMsg {
	public msg: string = "N/A"
	public name: ActivityType.Watching | ActivityType.Listening

	constructor(duration: string | null) {
		[this.name, this.msg] = duration
			? [ActivityType.Listening, `since ${duration}`]
			: [ActivityType.Watching, 'for Voice Activity']
	}
}
