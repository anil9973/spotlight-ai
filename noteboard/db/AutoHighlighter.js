export class AutoHighlighter {
	constructor() {
		this.id = crypto.randomUUID();
		this.aiMode = "Hybrid";
		this.projectId = "";
		this.confidenceThreshold = 60;
		this.urlPatterns = [];
		this.customInstruction = "";
		this.createdAt = Date.now();
	}
}

/* export class HighlightText {
	constructor(highlight) {
		this.id = crypto.randomUUID();
		this.tagName = highlight.tagName;
		this.textContent = highlight.textContent;
		this.color = highlight.color;
		this.relevanceScore = highlight.relevanceScore;
		this.reason = highlight.reason;
	}
} */

/** Represents a webpage entry stored in IndexedDB. */
export class Webpage {
	/**
	 * @param {string} url - Unique identifier for the webpage (e.g., URL hash or UUID).
	 * @param {string[]} tags - List of descriptive tags related to the webpage.
	 * @param {"article"|"documentation"|"ecommerce"|"social"|"forum"|"other"} [websiteType="other"] - Categorized type of the website.
	 */
	constructor(url, tags, websiteType) {
		this.url = cleanLink(url);
		this.id = URLToHash(this.url);
		this.tags = tags ?? [];
		this.domain = new URL(url).hostname;
		this.websiteType = websiteType ?? "other";
		this.date = new Date().toLocaleDateString("default", { day: "2-digit", month: "long", year: "numeric" });
	}
}

export function URLToHash(url) {
	let hash = 2166136261;

	for (let i = 0; i < url.length; i++) {
		hash ^= url.charCodeAt(i);
		hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
	}

	return hash >>> 0;
}

export function cleanLink(tabUrl) {
	const url = new URL(tabUrl);
	return url.host + url.pathname;
}
