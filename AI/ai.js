import { initializeApp, getAI, getGenerativeModel, GoogleAIBackend, InferenceMode } from "./firebase-ai.js";

const firebaseConfig = {
	apiKey: "AIzaSyC_q2x1MMK7dUav3TrRKtp97HXTo5dpxcs",
	authDomain: "spotihighlighterai.firebaseapp.com",
	projectId: "spotihighlighterai",
	storageBucket: "spotihighlighterai.firebasestorage.app",
	messagingSenderId: "751918799693",
	appId: "1:751918799693:web:0edc799d515d9689663504",
	measurementId: "G-X5KNBZQR1L",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize the Google AI service.
const googleAI = getAI(app, { backend: new GoogleAIBackend() });

export class AiService {
	constructor() {}

	async initialize() {
		// Create a `GenerativeModel` instance with a model that supports your use case.
		this.model = getGenerativeModel(googleAI, {
			mode: InferenceMode.PREFER_ON_DEVICE,
			inCloudParams: { model: "gemini-2.5-flash" },
		});
	}

	/**@returns {Promise<HighlightBlock[]>} */
	async highlightText(promptText) {
		this.model ?? (await this.initialize());
		try {
			const result = await this.model.generateContent(promptText);
			const response = await result.response.text();
			return extractJSONContent(response);
		} catch (err) {
			console.warn("AI highlights failed:", err);
			const response = await generateContentOnGeminiServer(promptText);
			return extractJSONContent(response);
		}
	}
}

export const aiService = new AiService();

/** @param {string} markText*/
function extractJSONContent(markText) {
	markText = markText.trim();
	if (markText.startsWith("{") && markText.startsWith("}")) return JSON.parse(markText);
	let jsonStartIndex = markText.indexOf("```json");
	if (jsonStartIndex === -1) return markText;

	jsonStartIndex = jsonStartIndex + 7;
	const blockEndIndex = markText.indexOf("```", jsonStartIndex);
	const jsonContent = markText.slice(jsonStartIndex, blockEndIndex);
	return JSON.parse(jsonContent.trim());
}

/* Fallback if firebase throw api rate limit */
export async function generateContentOnGeminiServer(promptMessage) {
	const API_KEY = (await getStore("GeminiAPIKey")).GeminiAPIKey ?? "AIzaSyBlu3XiXCkh0PiZdVHnqCQ--tYnKAgk3O4";
	const headers = new Headers({ "Content-Type": "application/json" });
	const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
	const payload = {
		contents: [
			{
				parts: [{ text: promptMessage }],
			},
		],
	};

	try {
		const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
		const jsonData = await response.json();
		if (response.ok) return jsonData.candidates[0].content.parts.map((part) => part.text).join("");
	} catch (error) {
		console.error(error);
	}
}

/**
 * @typedef {Object} HighlightBlock
 * @property {string} id - Unique identifier for the highlight block, usually derived from input.
 * @property {string} tagName - The HTML tag name where the highlight is applied.
 * @property {string} textContent - Exact snippet text extracted from the original context to highlight.
 * @property {'yellow' | 'green' | 'blue' | 'orange' | 'purple'} color - Highlight color used for visual distinction.
 * @property {number} relevanceScore - Numerical score (0–100) indicating the relevance of this snippet to the project.
 * @property {string} reason - Short explanation describing why this snippet is relevant to the user's project.
 */
