import axios from 'axios'
import { useState } from 'react'
import './App.css'

const apiToken =
	'APY0fyXxz76lfb2Js5CRdzH5qvb552QfkbbI0XvBZTCIUW3mGE9bDn8Vhk0gkjewsM'

function App() {
	const [file, setFile] = useState(null)
	const [fileName, setFileName] = useState('')
	const [audioUrl, setAudioUrl] = useState(null)
	const [transcribedText, setTranscribedText] = useState('')
	const [summary, setSummary] = useState('')
	const [timeCodes, setTimeCodes] = useState('')
	const [videoUrl, setVideoUrl] = useState(null)

	const handleFileChange = event => {
		const selectedFile = event.target.files[0]
		setFile(selectedFile)
		setFileName(selectedFile.name) // Set the file name
	}

	const processVideo = async () => {
		if (!file) {
			alert('Please select a file first!')
			return
		}

		try {
			// Step 1: Extract audio from the video
			const formData = new FormData()
			formData.append('video', file)
			formData.append('output_format', 'wav')
			formData.append('duration', '120')

			const audioResponse = await axios.post(
				'https://api.apyhub.com/extract/video/audio/file?output=test-sample',
				formData,
				{
					headers: {
						'apy-token': apiToken,
						'Content-Type': 'multipart/form-data',
					},
					responseType: 'blob',
				}
			)

			const audioBlob = new Blob([audioResponse.data], { type: 'audio/wav' })
			const audioUrl = URL.createObjectURL(audioBlob)
			setAudioUrl(audioUrl)

			// Step 2: Transcribe the audio to text
			const sttFormData = new FormData()
			sttFormData.append('file', audioBlob, 'audio.wav')
			sttFormData.append('language', 'en-US')

			const sttResponse = await axios.post(
				'https://api.apyhub.com/stt/file',
				sttFormData,
				{
					headers: {
						'apy-token': apiToken,
						'Content-Type': 'multipart/form-data',
					},
				}
			)
			setTranscribedText(sttResponse.data.data)

			// Step 3: Generate summary of the transcribed text
			const summaryResponse = await axios.post(
				'https://api.apyhub.com/sharpapi/api/v1/content/summarize',
				{
					content: sttResponse.data.data,
					max_length: '250',
					language: 'English',
				},
				{
					headers: {
						'apy-token': apiToken,
						'Content-Type': 'application/json',
					},
				}
			)

			const jobId = summaryResponse.data.job_id

			await new Promise(resolve => setTimeout(resolve, 7000))

			const textResponse = await axios.get(
				`https://api.apyhub.com/sharpapi/api/v1/content/summarize/job/status/${jobId}`,
				{
					headers: {
						'apy-token': apiToken,
						'Content-Type': 'application/json',
					},
				}
			)

			console.log('textResponse', textResponse)
			setSummary(textResponse.data?.data?.attributes?.result?.summary)
		} catch (error) {
			console.error('Error:', error)
		}
	}

	return (
		<div className='app-container'>
			<h1>Brie fly</h1>
			<div className='custom-file-upload'>
				<label htmlFor='file-input' className='upload-btn'>
					Choose File
				</label>
				<input id='file-input' type='file' onChange={handleFileChange} />
			</div>
			<button onClick={processVideo}>Upload</button>

			{fileName && (
				<div className='file-info'>
					<h3 className='headingInfo'>Uploaded File:</h3>
					<p className='infoText'>{fileName}</p>
				</div>
			)}

			{audioUrl && (
				<div className='audio-container'>
					<h3 className='headingInfo'>Audio</h3>
					<audio controls>
						<source src={audioUrl} type='audio/wav' />
						Your browser does not support the audio element.
					</audio>
				</div>
			)}

			{videoUrl && (
				<div className='video-container'>
					<h3>Generated Video:</h3>
					<video width='400' height='300' controls>
						<source src={videoUrl} type='video/mp4' />
						Your browser does not support the video tag.
					</video>
				</div>
			)}

			{/* {transcribedText && (
				<div className='text-container'>
					<h3 className='headingInfo'>Transcribed Text:</h3>
					<p className='infoText'>{transcribedText}</p>
				</div>
			)} */}

			{summary && (
				<div className='text-container'>
					<h3 className='headingInfo'>Summary:</h3>
					<p className='infoText'>{summary}</p>
				</div>
			)}
		</div>
	)
}

export default App
