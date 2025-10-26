/* import { initializeApp, getAI, getGenerativeModel, GoogleAIBackend, InferenceMode } from "./firebase-ai.js";

const firebaseConfig = {
	apiKey: "AIzaSyAIk1fbClnDhML83VLkasR5xMSGyL6n4_w",
	authDomain: "hawk-vision-1918c.firebaseapp.com",
	projectId: "hawk-vision-1918c",
	storageBucket: "hawk-vision-1918c.firebasestorage.app",
	messagingSenderId: "164004079436",
	appId: "1:164004079436:web:9148fc8e837c0c810491e9",
	measurementId: "G-BT2LM7DHJ0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize the Google AI service.
const googleAI = getAI(app, { backend: new GoogleAIBackend() });

// Create a `GenerativeModel` instance with a model that supports your use case.
const model = getGenerativeModel(googleAI, { mode: InferenceMode.ONLY_IN_CLOUD }); */

import { MarkdownParser } from "../markdown/parser/mark-htmldom/parser.js";

/** @param {string} text @param {HTMLElement} writerHTMLElem*/
export async function generateContent(text, writerHTMLElem) {
	text = "## This is response from GEMINI server AI of prompt " + text;
	/* const markParser = new MarkdownParser();
	const contentFrag = await markParser.parse(text);
	contentFrag && writerHTMLElem.replaceChildren(contentFrag); */

	const readStream = new ReadableStream({
		start(controller) {
			controller.enqueue(text);
			controller.close();
		},
	});

	parseMarkDomStream(readStream, writerHTMLElem);
}

/** @param {ReadableStream<string>} readStream*/
export async function parseMarkDomStream(readStream, writerHTMLElem) {
	let previousChunk = "";
	const transformStream = new TransformStream({
		transform(chunk, controller) {
			const newChunk = chunk.startsWith(previousChunk) ? chunk.slice(previousChunk.length) : chunk;
			if (!newChunk) return;
			controller.enqueue(newChunk);
			previousChunk = chunk;
		},

		flush() {
			writerHTMLElem.dispatchEvent(new Event("markstreamcomplete"));
		},
	});
	const stream = readStream.pipeThrough(transformStream);
	writerHTMLElem.replaceChildren();

	const markParser = new MarkdownParser();
	for await (const contentFrag of markParser.parseStream(stream)) {
		writerHTMLElem.appendChild(contentFrag);
	}
}
