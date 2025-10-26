import { html, react } from "../../js/om.compact.js";

export class ThresholdRangeInput extends HTMLElement {
	constructor() {
		super();
	}

	props = react({ value: 70 });

	sendValue({ target }) {
		this.props.value = target.valueAsNumber;
		fireEvent(this, "range", target.valueAsNumber);
	}

	render() {
		return html`<div class="input-label">
				<span>🎯 AI Confidence Threshold</span>
				<input
					type="number"
					name="confidence-threshold"
					.value=${() => this.props.value}
					@input=${this.sendValue.bind(this)} />
				<var>%</var>
			</div>
			<input
				type="range"
				name="confidence-threshold"
				min="0"
				max="100"
				.value=${() => this.props.value}
				@input=${this.sendValue.bind(this)} />`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("threshold-range-input", ThresholdRangeInput);
