type VoiceActivityState =
	| { ty: 'Active', startTime: EpochTimeStamp } 
	| { ty: 'Inactive' }

class VoiceActivity {
	state: VoiceActivityState

	constructor() {
		this.state = { ty: 'Inactive' }
	}

	start() {
		// If the activity is already on, do nothing.
		if (this.state.ty === 'Active')
			return

		// Activity is not being tracked, start it with the current time.
		this.state = { ty: 'Active', startTime: Date.now() }
		console.log(`Started tracking voice activity`)
	}

	stop() {
		if (this.state.ty === 'Inactive')
			return

		const currentTime = Date.now()
		console.log(`Voice Activity Duration: ${currentTime - this.state.startTime}`)

		this.state = { ty: 'Inactive' }
	}
}

export { VoiceActivity }
