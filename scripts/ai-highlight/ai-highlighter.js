import { showToast } from "../func-script.js";
import { Highlighter } from "../highlighter/highlighter.js";
import { BlockTextExtractor } from "./extractor.js";

const spaceRx = /\n\s+/g;

export class AIAutoHighlighter {
	constructor() {
		this.highlighter = new Highlighter();
		this.init();
	}

	async init() {
		const blockExtractor = new BlockTextExtractor();
		const blockTextContents = blockExtractor.extract();

		showToast("Ai Highlight in progess. Please wait ...");
		const message = { command: "aiAutoHighlight", blockTextContents };
		/**@type {import("../../AI/ai.js").HighlightBlock[]} */
		const highlightedTextContents = await chrome.runtime.sendMessage(message);
		this.applyHighlight(highlightedTextContents, blockExtractor.blockElements);

		// Save url in highlighted store so that no need to do again
		const aiHighlightedUrls = (await chrome.storage.local.get("aiHighlightedUrls")).aiHighlightedUrls ?? [];
		const pageUrl = location.host + location.pathname;
		aiHighlightedUrls.push(pageUrl);
		chrome.storage.local.set({ aiHighlightedUrls });
	}

	applyHighlight(highlightBlockTextContents, blockElements) {
		for (const blockTextContent of highlightBlockTextContents) {
			const parentElem = blockElements.get(blockTextContent.id);
			const rangeData = this.getHighlightRange(parentElem, blockTextContent.textContent);
			rangeData && this.highlight(rangeData, blockTextContent);
		}
	}

	highlight(rangeData, blockTextContent) {
		const range = new Range();
		range.setStart(rangeData.startNode, rangeData.startOffset);
		range.setEnd(rangeData.endNode, rangeData.endOffset);
		this.highlighter.setHighlight(range, blockTextContent.color);
		this.highlighter.saveAiHighlights(range, blockTextContent);
	}

	getHighlightRange(blockParentElem, highlightText) {
		const highlightTextWords = highlightText.split(" ");
		const range = {}; // startNode. startOffset, endNode, endOffset,
		let highlightTextIndex = 0;

		const nodeIterator = document.createNodeIterator(blockParentElem, NodeFilter.SHOW_TEXT);

		/**@type {Text} */
		let textNode;
		// @ts-ignore
		while ((textNode = nodeIterator.nextNode())) {
			const textNodeData = textNode.data;
			if (!textNodeData.trim()) continue;
			//prettier-ignore
			const textWords = textNodeData.replaceAll(spaceRx, " ").split(" ").filter((text) => text.trim());

			nodeText: for (const textWord of textWords) {
				// && textWord.slice(0, -1) !== highlightTextWords[highlightTextIndex] //BUG If word endswith .!, and AI will not include this, char, cannot highlight
				if (textWord !== highlightTextWords[highlightTextIndex]) {
					highlightTextIndex = 0; // If stop matching , reset  highlightTextIndex
					continue nodeText;
				}
				highlightTextIndex++; // If matched, highlight next word of highlighted  text

				if (highlightTextIndex === 1) {
					range.startNode = textNode;
					range.startOffset = textNodeData.indexOf(textWord); // Temp improve later
				}

				// If highlight text completed
				if (!highlightTextWords[highlightTextIndex]) {
					range.endNode = textNode;
					range.endOffset = textNodeData.indexOf(textWord) + textWord.length; // Temp improve later
					return range;
				}
			}
		}
	}
}

// AI Output schema
class HighlightBlockTextContent {
	constructor() {
		this.id = "";
		this.tagName = "";
		this.textContext = "";
		this.reason = "";
		this.color = "yellow";
	}
}
