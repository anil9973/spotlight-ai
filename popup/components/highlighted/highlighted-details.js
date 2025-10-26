import { getPageHighlightCount } from "../../../noteboard/db/highlight-db.js";
import { html } from "../../js/om.compact.js";
import { getCrtTab } from "../../js/util.js";
import { ConfirmDelete } from "../utils/confirm-delete.js";

export class HighlightedDetails extends HTMLElement {
	constructor() {
		super();
	}

	async openSidePanel() {
		const tabId = (await getCrtTab()).id;
		chrome.sidePanel.open({ tabId });
		close();
	}

	async clearHighlight() {
		const confirmDelete = new ConfirmDelete();
		const tabId = (await getCrtTab()).id;
		$on(confirmDelete, "positive", () =>
			chrome.tabs.sendMessage(tabId, "removeHighlights").then(() => toast("Highlight cleared"))
		);
		document.body.appendChild(confirmDelete);
	}

	onThresholdUpdate() {}

	render() {
		return html`<threshold-range-input @range=${this.onThresholdUpdate.bind(this)}></threshold-range-input>
			<div class="flex border-box">
				<span> <atom-icon ico="hide" title=""></atom-icon> Hide highlights on current webpage</span>
				<label class="switch">
					<input type="checkbox" />
					<span class="slider"></span>
				</label>
			</div>
			<div class="flex">
				<button style="--btn-clr:red" @click=${this.clearHighlight.bind(this)}>
					<atom-icon ico="clear-highlight" title=""></atom-icon>
					<span>Clear this tab's highlight</span>
				</button>
				<button style="--btn-clr:orange;align-self:end" @click=${this.openSidePanel.bind(this)}>
					<atom-icon ico="marker" title=""></atom-icon>
					<span> Show this tab's highlights
				</button>
			</div>`;
	}

	async connectedCallback() {
		const tabUrl = (await getCrtTab()).url;
		const count = await getPageHighlightCount(tabUrl);
		if (count === 0) return;
		this.replaceChildren(this.render());
	}
}

customElements.define("highlighted-details", HighlightedDetails);
