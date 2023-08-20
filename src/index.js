import fs from 'fs';
import https from 'https';
import dotenv from "dotenv"

dotenv.config()

// Audio configuration
const audioConfig = {
  audioEncoding: 'LINEAR16',
  effectsProfileId: ['small-bluetooth-speaker-class-device'],
  pitch: 0,
  speakingRate: 1,
};

// Full text
const fullText = `
En La Ballena, cinta de drama y comedia dirigida por Darren Aronofsky (Réquiem por un sueño), Charlie es un hombre moribundo y deprimido está atrapado en el sofá de su casa, en las afueras de Mormon Country, Idaho, comiendo sin saciar, esperando la muerte. Alcanzando un peso que casi alcanza los 300 kilogramos, es un hombre que se odia así mismo y es tan consciente de la incomodidad que su apariencia física genera en los demás que prefiere mencionarlo él mismo. Se ha separado de todas las personas que alguna vez quiso, incluyendo su ex esposa y su hija adolescente Ellie, siendo acompañado por Liz, su cuidadora, quien, aunque manifiesta una verdadera preocupación por él, parece estar cómoda junto a alguien que tiene más problemas que ella. Un día cualquiera, Thomas, un joven misionero mormón, llega a su puerta, en un momento que parecía catastrófico pero que, poco a poco, se revela como el correcto y con su ayuda, Charlie decide que es tiempo de transformar su vida, proceso que inicia con el intento por reconectarse con Ellie.
`;

// Text segments
const textSegments = fullText.match(/.{1,500}/g); // Divide the text into segments of up to 500 characters

// Your Google Cloud API key
const apiKey = process.env.GOOGLE_API_KEY

// Function to make the text-to-speech request
const requestSynthesis = segmentText => {
  return new Promise((resolve, reject) => {
    // Build the text-to-speech request URL
    const url = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${apiKey}`;

    // Build the request body
    const requestBody = {
      input: { text: segmentText },
      voice: { languageCode: 'es-US', name: 'es-US-Studio-B' },
      audioConfig: audioConfig,
    };

    // Convert the request body to JSON format
    const jsonData = JSON.stringify(requestBody);

    // HTTPS request configuration
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Make the text-to-speech request
    const req = https.request(url, requestOptions, res => {
      let responseData = '';

      res.on('data', chunk => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          const responseBody = JSON.parse(responseData);
          resolve(responseBody.audioContent);
        } else {
          reject(responseData);
        }
      });
    });

    // Send the request body
    req.write(jsonData);
    req.end();
  });
};

// Function to combine audio segments into a single file
const combineAudio = (audioSegments, outputFile) => {
  const combinedAudio = audioSegments.join('');
  fs.writeFile(outputFile, audioSegments, 'base64', err => {
    if (err) {
      console.error('Error saving the audio file:', err);
    } else {
      console.log(`The audio file '${outputFile}' has been created.`);
    }
  });
};

// Synthesize each text segment separately
// const synthesisPromises = textSegments.map(segment => requestSynthesis(segment));
const synthesisPromises = requestSynthesis(fullText);

(synthesisPromises)
  .then(audioSegments => {
    // Combine the audio segments into a single file
    const outputFile = 'audio_response.mp3';
    combineAudio(audioSegments, outputFile);
  })
  .catch(error => {
    console.error('Error in the text-to-speech request:', error);
  });
