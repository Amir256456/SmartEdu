import axios from 'axios'
import { useState } from 'react'
import './App.css'

function App() {
	const [file, setFile] = useState(null)
	const [audioUrl, setAudioUrl] = useState(null)
	const [transcribedText, setTranscribedText] = useState('')

	const handleFileChange = event => {
		setFile(event.target.files[0])
	}

	const test = async () => {
		if (!file) {
			alert('Please select a file first!')
			return
		}

		const formData = new FormData()
		formData.append('video', file)
		formData.append('output_format', 'wav')
		formData.append('duration', '500')

		try {
			// Extract audio from video file
			const response = await axios.post(
				'https://api.apyhub.com/extract/video/audio/file?output=test-sample',
				formData,
				{
					headers: {
						'apy-token':
							'APY0j2EPbzohrEQTqv5gQDKlAocKnu7aa51ausNkGMWD3Zu3nLJiQ3Yz73vvoJk7X1MjvTy8W',
						'Content-Type': 'multipart/form-data',
					},
					responseType: 'blob',
				}
			)

			// Create a blob from the audio data
			const audioBlob = new Blob([response.data], { type: 'audio/wav' })
			const audioUrl = URL.createObjectURL(audioBlob)
			setAudioUrl(audioUrl)

			// Send the .wav file to the speech-to-text API
			const sttFormData = new FormData()
			sttFormData.append('file', audioBlob, 'audio.wav') // Appending with the filename 'audio.wav'
			sttFormData.append('language', 'en-US')

			const sttResponse = await axios.post(
				'https://api.apyhub.com/stt/file',
				sttFormData,
				{
					headers: {
						'apy-token':
							'APY0j2EPbzohrEQTqv5gQDKlAocKnu7aa51ausNkGMWD3Zu3nLJiQ3Yz73vvoJk7X1MjvTy8W',
						'Content-Type': 'multipart/form-data',
					},
				}
			)

			// Get the transcribed text from the response
			console.log('sttResponse', sttResponse)
			setTranscribedText(sttResponse.data.data)
		} catch (error) {
			console.error('Error:', error)
		}
	}

	return (
		<div>
			<input type='file' onChange={handleFileChange} />
			<button onClick={test}>Test</button>

			{audioUrl && (
				<div>
					<h3>Audio Preview:</h3>
					<audio controls>
						<source src={audioUrl} type='audio/wav' />
						Your browser does not support the audio element.
					</audio>
				</div>
			)}

			{transcribedText && (
				<div>
					<h3>Transcribed Text:</h3>
					<p>{transcribedText}</p>
				</div>
			)}
		</div>
	)
}

export default App
