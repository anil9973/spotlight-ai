import { insertAutoHighlighterInDb } from "../../../noteboard/db/auto-highlighter-db.js";
import { AutoHighlighter } from "../../../noteboard/db/AutoHighlighter.js";
import { updateUrlInContentScript } from "../../js/content-script.js";
import { MatchWebpages } from "./match-webpages.js";
import { html, react } from "../../js/om.compact.js";
import { CreateProject } from "./create-project.js";
import { getCrtTab } from "../../js/util.js";
import "./range-input.js";
// @ts-ignore
import highlightCss from "../../style/highlight.css" with { type: "css" };
document.adoptedStyleSheets.push(highlightCss);

export class AIModeSwitch extends HTMLElement {
	constructor() {
		super();
	}

	render() {
		const mode = ["Offline", "Hybrid", "Cloud"];
		const item = (mode) => html`<label><input type="radio" value="${mode}" hidden /><span>${mode}</span></label>`;
		return mode.map(item);
	}

	connectedCallback() {
		this.replaceChildren(...this.render());
		this.children[1].setAttribute("active", "");
	}
}

customElements.define("ai-mode-switch", AIModeSwitch);

export class AutoHighlightForm extends HTMLElement {
	constructor() {
		super();
	}

	async onSubmit() {
		try {
			// If no url pattern selected, just highlight one
			if (this.autoHighlight.urlPatterns.length === 0)  throw new Error("urlPatterns required");
			if (!this.autoHighlight.projectId)  throw new Error("projectId required");
			const autoHighlight = Object.assign({}, this.autoHighlight);
			autoHighlight.urlPatterns = Object.assign([], this.autoHighlight.urlPatterns);
			await insertAutoHighlighterInDb(autoHighlight);
			await updateUrlInContentScript(autoHighlight.urlPatterns);
			notify("Auto highlight config added");
			const tabId = (await getCrtTab()).id
			chrome.tabs.reload(tabId);
			setTimeout(() => close(), 5000);
		} catch (error) {
			console.error(error);
		}
	}

	onAiModeSwitch({ target }) {
		this.autoHighlight.aiMode = target.value;
	}

	onProjectSelect({ target }) {
		if (target.value === "newProject") {
			const createProjectDialog = new CreateProject();
			this.appendChild(createProjectDialog);

			$on(createProjectDialog, "created", ({ detail: project }) => {
				target.add(new Option(project.name, project.id));
				this.autoHighlight.projectId = project.id;
				createProjectDialog.remove();
			});
		}
	}

	onInstructionUpdate({ target }) {
		this.autoHighlight.customInstruction = target.value;
		// target.tagName === "textarea" && // TODO save instruction per project wise
	}

	onThresholdUpdate({ detail: value }) {
		this.autoHighlight.confidenceThreshold = value;
	}

	render() {
		const item = (instruction) =>
			html`<li>
				<label><input type="radio" name="instruction" value="${instruction}" /> <span>${instruction}</span> </label>
			</li>`;
		const option = (project) => html`<option value="${project.id}">${project.name}</option>`;

		return html`<div class="flex">
				<span>AI Mode</span> <ai-mode-switch @change=${this.onAiModeSwitch.bind(this)}></ai-mode-switch>
			</div>
			<label>
				<span>Project</span>
				<select .value=${() => this.autoHighlight.projectId} @click=${this.onProjectSelect.bind(this)}>
					${this.projects.map(option)}
				</select>
			</label>
			<fieldset @change=${this.onInstructionUpdate.bind(this)}>
				<legend>Custom instructions</legend>
				<ul class="instructions">
					${this.instructions.map(item)}
				</ul>
				<textarea placeholder="Add Custom intruction"></textarea>
			</fieldset>
			<threshold-range-input @range=${this.onThresholdUpdate.bind(this)}></threshold-range-input>
			<button type="submit" @click=${this.onSubmit.bind(this)}>Auto Highlight</button>`;
	}

	async connectedCallback() {
		const { projects, instructions } = await getStore(["projects", "instructions"]);
		projects["newProject"] = { id: "newProject", name: "Create New" };
		this.projects = Object.values(projects ?? {});
		this.instructions = instructions ?? [];
		this.autoHighlight = react(new AutoHighlighter());
		this.autoHighlight.projectId = Object.keys(projects)[0];

		this.replaceChildren(this.render());
		this.lastElementChild.before(new MatchWebpages(this.autoHighlight.urlPatterns));
	}
}

customElements.define("ai-auto-highlight", AutoHighlightForm);
