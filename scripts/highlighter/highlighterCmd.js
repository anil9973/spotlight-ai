import { CommentBox } from "./comment.js";

export class HighlightCommander {
	highlighters = new Map([["yellow", new Highlight()]]);

	constructor() {
		this.comment = new CommentBox();
		this.fetchSavedHighlights();
		chrome.runtime.onMessage.addListener(this.onHightlightMessage.bind(this));
		document.body.addEventListener("keyup", (evt) => evt.ctrlKey && evt.shiftKey && this.undoRedo[evt.code]?.());
		document.body.addEventListener("dblclick", this.onHighlightClick.bind(this));
	}

	onHightlightMessage(request, _, sendResponse) {
		if (request === "clearHighlights") this.clearHighlights();
	}

	//TODO
	undoRedo = {
		KeyZ: async () => {},

		KeyY: () => {},

		// KeyH: this.deleteHighlight.bind(this),
	};

	onHighlightClick({ clientX, clientY }) {
		// @ts-ignore
		const highlights = CSS.highlights.highlightsFromPoint(clientX, clientY);
		if (highlights.length === 0) return;

		for (const highlight of highlights) {
			// TODO Show delete icon to delete hightlights
			highlight.highlight.delete(highlight.ranges[0]);
		}
	}

	async fetchSavedHighlights() {
		if (!location.protocol.startsWith("http")) return;
		const pageHighlights = await chrome.runtime.sendMessage({ command: "getPageHighlights", pageUrl: location.href });
		if (!Array.isArray(pageHighlights)) return;
		pageHighlights.forEach(this["applyHighlight"].bind(this));
	}

	clearHighlights() {
		this.highlighters.forEach((highlight) => highlight.clear());
	}
}
