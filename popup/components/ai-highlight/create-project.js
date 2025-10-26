import { html, react } from "../../js/om.compact.js";

export class CreateProject extends HTMLDialogElement {
	constructor() {
		super();
		this.project = react({ id: Math.random().toString(36).slice(2), name: "", goal: "" });
	}

	createProject() {
		fireEvent(this, "created", Object.assign({}, this.project));
	}

	render() {
		const placeholder = "e.g., PhD Literature Review, Product Launch Research";
		const placeholder2 = "Project goal — what do you want to collect/highlight for this project?";
		return html`<label>
				<span>Name</span>
				<input type="text" name="name" placeholder="${placeholder}" .value=${() => this.project.name} />
			</label>
			<label style="display:block;margin-top:0.5em">
				<span>Goal</span>
				<textarea name="goal" placeholder="${placeholder}" .value=${() => this.project.goal}></textarea>
			</label>
			<button @click=${this.createProject.bind(this)}>Create Project</button>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
		this.showModal();
	}
}

customElements.define("create-project-popup", CreateProject, { extends: "dialog" });
