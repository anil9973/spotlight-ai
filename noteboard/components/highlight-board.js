import { html } from "../../popup/js/om.compact.js";
import { lightdb } from "../db/highlight-db.js";
import { HighlightBlock } from "./highlight-block.js";

import boardCss from "../style/board.css" with { type: "css" };
document.adoptedStyleSheets.push(boardCss)

export class HighlightBoard extends HTMLElement {
	constructor() {
		super();
	}

	render(allHighlights) {
		return allHighlights.map((highlight) => new HighlightBlock(highlight));
	}

	async connectedCallback() {
		const allHighlights = await lightdb.pipeHighlightList();

		this.replaceChildren(...this.render(allHighlights));
	}
}

customElements.define("highlight-board", HighlightBoard);

document.body.appendChild(new HighlightBoard());
