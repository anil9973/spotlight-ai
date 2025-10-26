import "../../popup/js/reset.js"
import { HighlightBlock } from "./highlight-block.js";
import { getCrtTab } from "../../popup/js/util.js";
// @ts-ignore
import baseCss from "../style/base.css" with { type: "css" };
console.log(baseCss);
import pageHighlightCss from "../style/page-highlight.css" with { type: "css" };
document.adoptedStyleSheets.push(baseCss, pageHighlightCss);

export class PageHighlights extends HTMLElement {
	constructor() {
		super();
	}

	render(highlights) {
		return highlights.map((highlight) => new HighlightBlock(highlight));
	}

	async onWebpageSwitch(tabUrl) {
		try {
			const pageHighlights = await chrome.runtime.sendMessage({ command: "getPageHighlights", pageUrl: tabUrl });
			Array.isArray(pageHighlights) ? this.replaceChildren(...this.render(pageHighlights)) : this.replaceChildren();
		} catch (error) {
			this.replaceChildren(new Text("No highlight found"));
		}
	}

	async connectedCallback() {
		const tabUrl = (await getCrtTab()).url
		this.onWebpageSwitch(tabUrl);

		chrome.tabs.onActivated.addListener(async ({ tabId }) => chrome.tabs.get(tabId).then((tab)=>this.onWebpageSwitch(tab.url)));
		chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
			if (!tab.active) return;
			info.status === "complete" && this.onWebpageSwitch(tabId);
		});
	}
}

customElements.define("page-highlights", PageHighlights);
