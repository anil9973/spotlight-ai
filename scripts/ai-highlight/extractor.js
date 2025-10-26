import { BlockElemTags, BlockStyles } from "./enums.js";

const $ = (selector, /** @type {Element} */ scope) => (scope || document.body).querySelector(selector);
const spaceRx = /\n\s+/g;

export class BlockTextExtractor {
	constructor() {
		this.blockElements = new Map();
		this.blockTextContents = [];
		// Cache for custom element detection
		this.customElementCache = new Map();
		this.extract();
	}

	/** @description Extract webpage main Element @returns {HTMLElement} */
	getArticleRoot() {
		// prettier-ignore
		const IgnoreTags = new Set(["IMG", "FIGURE", "PICTURE", "svg", "CANVAS", "VIDEO", "STYLE", "HEADER", "NAV", "SCRIPT", "ASIDE", "BLOCKQUOTE", "P", "FOOTER", "H1", "H2", "H3", "UL", "OL", "FORM", "LI", "A", "TEXTAREA", "INPUT", "DL", "DD", "TABLE"]);
		const IgnoreClasses = new Set(["comments"]);
		const minWidth = innerWidth * 0.5;
		const elementStack = [];

		/** @param {HTMLElement} parentElem*/
		function traverse(parentElem) {
			function filterElem(elem) {
				if (IgnoreTags.has(elem.tagName)) return false;
				if (elem.childElementCount === 0) return false;
				//biome-ignore format:
				for (const igClass of IgnoreClasses)
					if (elem.className?.toLowerCase()?.includes?.(igClass) || elem.id?.toLowerCase()?.includes?.(igClass))
						return false;
				//if (elem.computedStyleMap().get("position").value !== "static") return false;
				return true;
			}
			const childElements = Array.prototype.filter.call(parentElem.children, filterElem);
			if (childElements.length === 0) return;
			const heights = Array.prototype.map.call(childElements, (elem) => elem.offsetHeight);

			const maxHeight = Math.max(...heights);
			const index = heights.indexOf(maxHeight);
			const element = childElements[index];
			if (!element) return;
			if (element.offsetWidth < minWidth) return;
			if (element.offsetHeight < elementStack.at(-1)?.offsetHeight * 0.5) return;
			elementStack.push(element);
			element.childElementCount > 0 && traverse(element);
		}

		traverse($("main") ?? document.body);
		return elementStack.at(-1) ?? $("article") ?? $("main") ?? document.body;
	}

	isBlockElement(element) {
		const tagName = element.tagName;
		// Check standard block elements first (fastest)
		if (BlockElemTags.has(tagName)) return true;

		// Check for custom elements (contains hyphen)
		if (tagName.includes("-")) {
			// Use cache to avoid repeated computedStyle calls
			if (this.customElementCache.has(tagName)) return this.customElementCache.get(tagName);

			// Check computed display style
			const computedStyle = window.getComputedStyle(element);
			const isBlock = BlockStyles.has(computedStyle.display);

			// Cache the result
			this.customElementCache.set(tagName, isBlock);
			return isBlock;
		}

		return false;
	}

	extract() {
		const traverse = (element) => {
			const isBlock = this.isBlockElement(element);
			if (isBlock) {
				// Check if this block element has block children
				let hasBlockChildren = false;

				// Only check direct children for block elements
				for (const child of element.children) {
					if (this.isBlockElement(child)) {
						hasBlockChildren = true;
						break;
					}
				}

				if (!hasBlockChildren) this.insert(element);
			}

			// Continue traversal for all children
			for (const childElem of element.children) traverse(childElem);
		};

		const rootElem = this.getArticleRoot();
		for (const childElem of rootElem.children) traverse(childElem);
		return this.blockTextContents;
	}

	/** @param {HTMLElement} blockElem */
	insert(blockElem) {
		const textContent = blockElem.textContent.trim().replaceAll(spaceRx, " ");
		const blockTextContent = new BlockTextContent(blockElem.tagName, textContent);
		this.blockElements.set(blockTextContent.id, blockElem);
		this.blockTextContents.push(blockTextContent);
	}
}

class BlockTextContent {
	/** @param {string} tagName @param {string} textContext */
	constructor(tagName, textContext) {
		this.id = Math.random().toString(36).slice(2);
		this.tagName = tagName;
		this.textContext = textContext;
	}
}
