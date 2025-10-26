import { getUrlSuggestions, getCrtTab } from "../../js/util.js";
import { html, map } from "../../js/om.compact.js";

export class MatchWebpages extends HTMLElement {
	/** @param {string[]} matchUrls */
	constructor(matchUrls) {
		super();
		this.matchUrls = matchUrls;
	}

	async requestTabPermission() {
		const granted = await chrome.permissions.request({ permissions: ["tabs"] });
		if (!granted) toast(i18n("permission_denied"), true);
	}

	removeMatchPage({ currentTarget, target }) {
		const liElem = target.closest("li");
		if (!liElem) return;
		const page = liElem.textContent.trim();
		if (!target.closest("atom-icon"))
			return (currentTarget.previousElementSibling.previousElementSibling.value = page);
		const idx = this.matchUrls.indexOf(page);
		if (idx !== -1) this.matchUrls.splice(idx, 1);
	}

	addMatchPage({ code, target }) {
		if (code !== "Enter") return;
		this.matchUrls.push(target.value);
		target.value = "";
	}

	render(urlDataList, tabAccess) {
		const chipItem = (page) =>
			html`<li class="chip-item"><span>${page}</span> <atom-icon ico="close" title="remove"></atom-icon></li>`;

		return html`<label>
				<span>Auto-highlight webpages </span> ${tabAccess
					? ""
					: html`<button title="" @click=${this.requestTabPermission.bind(this)} hidden></button>`}
			</label>
			<input
				type="url"
				name="matches"
				list="tab-urls"
				placeholder="https://google.com/* (Enter to add)"
				@keyup=${this.addMatchPage.bind(this)} />
			<datalist id="tab-urls">
				<option value="https://*/*">${i18n("all_websites")}</option>
				${urlDataList.map((url) => html`<option value="${url}"></option>`)}
			</datalist>
			<ul class="chip-list" @click=${this.removeMatchPage.bind(this)}>
				${map(this.matchUrls, chipItem)}
			</ul>`;
	}

	async connectedCallback() {
		const tabAccess = await chrome.permissions.contains({ permissions: ["tabs"] });
		const urlDataList = await getUrlSuggestions();
		this.replaceChildren(this.render(urlDataList, tabAccess));
	}
}

customElements.define("match-page-urls", MatchWebpages);
