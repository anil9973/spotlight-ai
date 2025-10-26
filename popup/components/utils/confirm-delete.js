export class ConfirmDelete extends HTMLDialogElement {
	constructor() {
		super();
	}

	render() {
		return `<h3 style="text-align:center">Confirm delete</h3>
				<p class="msg-text">Are you sure you want to all highlights on current webpage</p>
				<div class="confirm-action" style="display: flex">
					<button class="outline-btn">Cancel</button>
					<button style="--btn-clr:red">Delete</button>
				</div>`;
	}

	connectedCallback() {
		this.id = "confirm-delete";
		this.innerHTML = this.render();
		this.showModal();
		const negativeBtn = $(".outline-btn", this);
		$on(negativeBtn.nextElementSibling, "click", this.deleteAction.bind(this, "positive"));
		$on(negativeBtn, "click", this.deleteAction.bind(this, "negative"));
	}

	deleteAction(action) {
		fireEvent(this, action);
		this.remove();
	}
}

customElements.define("confirm-delete", ConfirmDelete, { extends: "dialog" });
