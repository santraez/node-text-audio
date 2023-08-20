import https from "https"
import dotenv from "dotenv"

dotenv.config()

const audioConfig = {
  audioEncoding: "LINEAR16",
  effectsProfileId: ["small-bluetooth-speaker-class-device"],
  pitch: 0,
  speakingRate: 1
}

const apiKey = process.env.GOOGLE_API_KEY

export function requestSynthesis(segmentText) {
  return new Promise((resolve, reject) => {
    const url = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${apiKey}`
    const requestBody = {
      input: { text: segmentText },
      voice: { languageCode: "es-US", name: "es-US-Studio-B" },
      audioConfig: audioConfig
    }
    const jsonData = JSON.stringify(requestBody)
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }
    const req = https.request(url, requestOptions, res => {
      let responseData = ""
      res.on("data", chunk => { responseData += chunk })
      res.on("end", () => {
        if (res.statusCode === 200) {
          const responseBody = JSON.parse(responseData)
          resolve(responseBody.audioContent)
        } else {
          reject(new Error(`Text-to-speech request failed with status code ${res.statusCode}`))
        }
      })
    })
    req.write(jsonData)
    req.end()
  })
}
