import fs from "fs"

export async function combineAudio(audioSegments, outputFile) {
  const combinedAudio = audioSegments.join("")
  const outputPath = `./audios/${outputFile}`
  try {
    fs.writeFileSync(outputPath, combinedAudio, "base64")
    console.log(`The audio file "${outputFile}" has been created.`)
  } catch (err) {
    throw new Error(`Error saving the audio file: ${err.message}`)
  }
}
