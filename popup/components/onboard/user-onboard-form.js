import { html, map, react } from "../../js/om.compact.js";

const professions = [
	"Data Scientist",
	"Student",
	"Marketing Manager",
	"Web Developer",
	"Designer",
	"Writer",
	"Marketing Professional",
	"Researcher",
	"Manager",
	"Professional",
];

export class UserProfile {
	constructor() {
		this.profession = "";
		this.coreInterests = [];
		this.mainGoal = "";
		this.expertiseLevel = "beginner";
	}
}

export class Project {
	constructor() {
		this.id = Math.random().toString(36).slice(2);
		this.name = "";
		this.goal = "";
	}
}

export class UserOnboardForm extends HTMLElement {
	constructor() {
		super();
		this.userProfile = react(new UserProfile());
		this.project = react(new Project());
		this.props = react({ coreInterests: [], mainGoals: [] });
	}

	async onSubmit() {
		const userProfile = Object.assign({}, this.userProfile);
		userProfile.coreInterests = Object.assign([], this.userProfile.coreInterests);
		const project = Object.assign({}, this.project);
		await setStore({ userProfile, projects: { [project.id]: project } });
		notify("Your preferences saved");
		this.remove();
	}

	onChipItemClick({ target }) {
		if (target.closest("atom-icon")) {
			const index = +target.closest("chip-item").dataset.index;
			this.props.splice(index, 1);
		}
	}

	onKeyDown({ code, target }) {
		if (code && code !== "Enter") return;
		setTimeout(() => {
			this.userProfile.coreInterests.push(target.value);
			target.value = "";
			target.placeholder = "";
		}, 0);
	}

	onProfessionUpdate() {
		//TODO ai generate coreInterests and mainGoals based on profession
		const coreInterests = ["Machine Learning", "Digital Marketing", " Climate Science", "Philosophy"];
		const mainGoals = ["Conducting Research", "Content Creation", "Project Management", "Personal Growth"];
		this.props.coreInterests.splice(0, this.props.coreInterests.length, ...coreInterests);
		this.props.mainGoals.push(0, this.props.mainGoals.length, ...mainGoals);
	}

	render() {
		const placeholder = "e.g., Data Scientist, Student, Marketing Manager";
		const placeholder2 = "e.g., Machine Learning, Digital Marketing, Climate Science, Philosophy";
		const option = (value) => html`<option value="${value}"></option>`;
		const chipItem = (item, index) =>
			html`<li data-index="${index}"><span>${item}</span> <atom-icon ico="close"></atom-icon></li class="chip-it" >`;

		return html`<h2 style="margin-block:0.5em;text-align:center">Welcome to SpotLightAI</h2 style="margin-block:0.5em" >
			<label>
				<span>Profession</span> 
				<input type="text" 
					.value=${() => this.userProfile.profession} 
					placeholder="${placeholder}"
					list="professions" 
					@click=${this.onProfessionUpdate.bind(this)} />
			</label>
			<datalist id="professions">${professions.map(option)}</datalist>
			<label>
				<span>Core Interests</span>
				<div class="core-interests">
					<ul class="chip-list" @click=${this.onChipItemClick.bind(this)}>
						${map(this.userProfile.coreInterests, chipItem)}
					</ul>
					<input type="text" list="core-interests" placeholder="${placeholder2}" @keydown=${this.onKeyDown.bind(this)} />
				</div>
				<datalist id="core-interests">${map(this.props.coreInterests, option)}</datalist>
			</label>
			<div class="flex">
				<label>
					<span>Main Goal</span>
					<input type="text" .value=${() => this.userProfile.mainGoal} list="main-goals" placeholder="" />
					<datalist id="main-goals">${map(this.props.mainGoals, option)}</datalist>
				</label>
				<label>
					<span>Expertise level</span>
					<select .value=${() => this.userProfile.expertiseLevel}>
						<option value="beginner">Beginner</option>
						<option value="intermediate">Intermediate</option>
						<option value="expert">Expert</option>
					</select>
				</label>
			</div>
			<fieldset>
				<legend>Create a Project</legend>
				<label><span>Name</span> <input type="text" .value=${() =>
					this.project.name} placeholder="e.g., PhD Literature Review, Product Launch Research"/></label>
				<label style="display:block;margin-top:0.5em">
					<span>Goal</span>
					<textarea .value=${() =>
						this.project
							.goal} placeholder="Project goal — what do you want to collect/highlight for this project?"></textarea>
				</label>
			</fieldset>
			<button type="submit" @click=${this.onSubmit.bind(this)}>Get Started</button>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("user-onboard-form", UserOnboardForm);
