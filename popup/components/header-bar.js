import { html } from "../js/om.compact.js";
import { getCrtTab } from "../js/util.js";

export class Headerbar extends HTMLElement {
	constructor() {
		super();
	}

	async openNoteboard() {
		const tab = await getCrtTab();
		chrome.tabs.create({ url: "/noteboard/index.html", index: tab.index + 1 });
	}

	render() {
		return html`<span style="font-weight: bold"> <img src="/icon.png" alt="" height="16" /> SpotLightAI</span>
			<button id="open_noteboard" style="--btn-clr:orange;padding-block:0">
				<atom-icon ico="noteboard" title=""></atom-icon>
				<span id="noteboard" @click=${this.openNoteboard.bind(this)}>noteboard</span>
			</button>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("top-header-bar", Headerbar);
