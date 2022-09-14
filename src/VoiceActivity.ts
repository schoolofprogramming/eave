class VoiceActivityState {
	is_active: boolean

	constructor() {
		this.is_active = false
	}

	start() {
		this.is_active ||= true
	}

	stop() {
		this.is_active &&= false
	}
}

class VoiceActivity {
	state: VoiceActivityState
	startTime: EpochTimeStamp

	constructor() {
		this.state = new VoiceActivityState()
		this.startTime = 0
	}

	start() {
		// If the activity is already being tracked, do nothing.
		if (this.state.is_active) {
			console.log('Voice Activity already being tracked')
			return
		}

		this.state.start()
		this.startTime = Date.now()

		console.log(`Started tracking voice activity`)
	}

	stop(): number | null {
		// If the tracking was already stopped, return null
		// to signal that the caller need not log a message.
		if (!this.state.is_active) {
			console.log('Tracking is inactive, preventing another deactivation...')
			return null
		}

		// Get the current time.
		const currentTime = Date.now()
		// Get the number of seconds that have passed from when `startTime` was set.
		const seconds = (currentTime - this.startTime) / 1000

		this.state.stop()

		return seconds
	}
}

export { VoiceActivity }
