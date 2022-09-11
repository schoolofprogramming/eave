class VoiceActivityState {
	state: boolean

	constructor() {
		this.state = false
	}

	start() {
		this.state ||= true
	}

	stop() {
		this.state &&= false
	}

	is_active(): boolean {
		return this.state
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
		if (this.state.is_active()) {
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
		if (!this.state.is_active()) {
			console.log('Tracking is inactive, preventing another deactivation...')
			return null
		}

		// Return the number of seconds that passed from the time the
		// activity was started to now.
		const currentTime = Date.now()

		console.log(`Current Time: ${currentTime}`)
		console.log(`Voice Activity Start Time: ${this.startTime}`)

		this.state.stop()

		return (currentTime - this.startTime) / 1000
	}
}

export { VoiceActivity }
