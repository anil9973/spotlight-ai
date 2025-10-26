import { HighlightCommander } from "./highlighterCmd.js";
import { HighlightRange } from "./HighlightRange.js";

const blockTags = new Set(["BLOCKQUOTE", "PRE", "OL", "UL"]);

export class Highlighter extends HighlightCommander {
	constructor() {
		super();
		this.highlightSheet = new CSSStyleSheet();
		CSS.highlights.set("spotlight", this.highlighters.get("yellow"));
		this.highlightSheet.insertRule(":scope {--highlight-clr:yellow; --text-clr:black}");
		this.highlightSheet.insertRule(
			"*::highlight(spotlight) {background-color:var(--highlight-clr); color:var(--text-clr)}"
		);
		document.adoptedStyleSheets.push(this.highlightSheet);
	}

	addCssHighlight(color) {
		const colorKey = color.startsWith("#") ? color.slice(1) : color;
		const highlighter = new Highlight();
		this.highlighters.set(color, highlighter);
		this.highlightSheet.insertRule(`*::highlight(spotlight${colorKey}) { background-color:${color}; ) }`);
		CSS.highlights.set("spotlight" + colorKey, highlighter);
	}

	/** @param {Range} range */ // User and AI
	addHighlight(range, color = "yellow") {
		this.highlighters.has(color) || this.addCssHighlight(color);
		this.highlighters.get(color).add(range);
	}

	#addChildIndexOnElem() {
		/**@param {HTMLCollection} children*/
		function setIndex(children) {
			for (let index = 0; index < children.length; index++) {
				const element = children[index];
				if (element["markerIdx"]) continue; // BUY cannot not defined ma markerIdx
				Object.defineProperty(element, "markerIdx", { value: index });
				if (element.childElementCount > 0) setIndex(element.children);
			}
		}

		setIndex(document.body.children);
	}

	/** @param {HighlightRange} highlight*/
	async applyHighlight(highlight, index) {
		try {
			function getParentElem(parentTree, parentElem = document.body) {
				// @ts-ignore
				for (const elemIdx of parentTree) parentElem = parentElem.children[elemIdx];
				return parentElem;
			}

			const commonParentElem = getParentElem(highlight.commonParentTree);
			const range = new Range();
			const startParentElem = highlight.startParents
				? getParentElem(highlight.startParents, commonParentElem)
				: commonParentElem;
			const startTxtNode = startParentElem.childNodes[highlight.startTxtNodeIdx];
			range.setStart(startTxtNode, highlight.startOffset);

			const endParentElem = highlight.endParents
				? getParentElem(highlight.endParents, commonParentElem)
				: commonParentElem;
			const endTxtNode = endParentElem.childNodes[highlight.endTxtNodeIdx];
			range.setEnd(endTxtNode, highlight.endOffset);
			highlight.comment && this.comment.showCommentBox(range, highlight.comment);

			this.setHighlight(range, highlight.color);
		} catch (error) {
			index !== undefined ? setTimeout(() => this.applyHighlight(highlight), 1000) : console.error(error.message);
		}
	}

	/** @public @param {String} color */
	async highlightSelectedByUser(color) {
		const selection = getSelection();
		const range = selection.getRangeAt(0);

		this.setHighlight(range, color);
		const markTextContent = await this.#getHighlightTxt(range, color);
		const highlight = new HighlightRange(range, selection.toString(), color);
		this.comment.showCommentBox(range);
		selection.removeAllRanges();

		const message = { command: "saveHighlight", markContents: markTextContent, highlight, pageUrl: location.href };
		const response = await chrome.runtime.sendMessage(message);
	}

	/** @param {Range} range, @param {String} color*/
	setHighlight(range, color) {
		const parentNode = range.commonAncestorContainer;
		const parentElem = parentNode.nodeType === 1 ? parentNode : parentNode.parentElement;
		parentElem["markerIdx"] === undefined && this.#addChildIndexOnElem();
		this.addHighlight(range, color);
	}

	/* Temporary, Must change later */
	/** @param {Range} range, @param {object} info*/
	async saveAiHighlights(range, info) {
		const markTextContent = await this.#getHighlightTxt(range, info.color);
		const highlight = new HighlightRange(range, range.toString(), info.color, "ai", info);
		this.comment.showCommentBox(range);

		const message = { command: "saveHighlight", markContents: markTextContent, highlight, pageUrl: location.href };
		const response = await chrome.runtime.sendMessage(message);
	}

	showCommentBoxOnSelect() {}

	deleteHighlight() {}

	async requestPermission() {
		/* const message = { msg: "requestHostPermission", domain: location.origin + "/*" };
		const granted = await chrome.runtime.sendMessage(message);
		granted
			? localStorage.setItem(KEY, granted)
			: alert(chrome.i18n.getMessage("highlighted_text_not_display_until_permission")); */
	}

	/* Save Highlight */
	/** @param {Range} range, @param {String} color*/
	async #getHighlightTxt(range, color) {
		const ancestorElem =
			range.commonAncestorContainer.nodeType === 1
				? range.commonAncestorContainer
				: range.commonAncestorContainer.parentElement;
		const parentTag = blockTags.has(ancestorElem.parentElement.tagName)
			? ancestorElem.parentElement.tagName
			: ancestorElem["tagName"];
		const parentElem = document.createElement(parentTag.toLowerCase());
		parentElem.appendChild(range.cloneContents());

		return await this.extractSelectedContent(parentElem, color);
	}

	/**@param {HTMLElement} contentFrag, @param {string} color*/
	async extractSelectedContent(contentFrag, color) {
		if (!this.markdownGenerator) {
			const generateUrl = chrome.runtime.getURL("/scripts/serializer/markdown/mark-json-serializer.js");
			const { MarkJsonSerializer } = await import(generateUrl);
			this.markdownGenerator = new MarkJsonSerializer();
		}
		return this.markdownGenerator.generate([contentFrag], color);
	}
}
