import { html } from "../../popup/js/om.compact.js";

export class HighlightBlock extends HTMLElement {
	constructor(highlight) {
		super();
		this.highlight = highlight;
	}

	async updateComment({ target }) {
		/* const tabUrl = (await chrome.tabs.get(globalThis.tabId)).url;
		const pageId = tabUrl.split("#", 1)[0].slice(8, 100);
		const pageHighlights = (await chrome.storage.local.get(pageId))[pageId] ?? {};
		pageHighlights[this.highlight.markerId].comment = target.value.trim();
		await chrome.storage.local.set({ [pageId]: pageHighlights }); */
	}

	render() {
		return html`<p>${this.highlight.textContent}</p>
			<textarea placeholder="comment" @change=${this.updateComment.bind(this)}>${this.highlight.comment}</textarea>`;
	}

	connectedCallback() {
		this.tabIndex = 0;
		this.style.setProperty("--mark-clr", this.highlight.color);
		this.replaceChildren(this.render());
		$on(this, "focusin", () =>
			chrome.tabs.sendMessage(globalThis.tabId, { msg: "scrollTo", top: this.highlight.top })
		);
	}
}

customElements.define("highlight-block", HighlightBlock);
