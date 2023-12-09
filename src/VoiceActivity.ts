class VoiceActivity {
	isOn: boolean
	startTime: EpochTimeStamp

	constructor() {
		this.isOn = false
		this.startTime = 0
	}

	start() {
		// If the activity is already being tracked, do nothing.
		if (this.isOn) {
			console.log('Voice Activity already being tracked')
			return
		}

		this.isOn = true
		this.startTime = Date.now()

		console.log(`Started tracking voice activity`)
	}

	stop(): number | null {
		// If the tracking was already stopped, return null
		// to signal that the caller need not log a message.
		if (!this.isOn) {
			console.log('Tracking is inactive, preventing another deactivation...')
			return null
		}

		// Get the current time.
		const currentTime = Date.now()
		// Get the number of seconds that have passed from when `startTime` was set.
		const seconds = (currentTime - this.startTime) / 1000

		this.isOn = false
		return seconds
	}
}

export { VoiceActivity }
