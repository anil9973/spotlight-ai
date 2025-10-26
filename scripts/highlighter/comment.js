// @ts-ignore
import commentCss from "./comment.css" with { type: "css" };

const xmlns = "http://www.w3.org/2000/svg";
export class CommentBox {
	constructor() {
		this.commentBox = document.createElement("marker-comment");
		this.commentBox.attachShadow({ mode: "open" });
		this.commentBox.shadowRoot.adoptedStyleSheets = [commentCss];
		document.body.appendChild(this.commentBox);
	}

	/**@param {Range} range*/
	showCommentBox(range, comment) {
		const commentBox = document.createElement("comment-box");
		const icon = document.createElementNS(xmlns, "svg");
		const path = document.createElementNS(xmlns, "path");
		const title = document.createElementNS(xmlns, "title");
		const rect = range.getBoundingClientRect();
		icon.setAttribute("viewBox", "0 0 24 24");
		icon.setAttribute("class", comment ? "comment-text" : "comment-plus");
		icon.appendChild(path);
		icon.appendChild(title);
		title.textContent = comment
			? chrome.i18n.getMessage("view_edit_comment")
			: chrome.i18n.getMessage("add_comment");
		commentBox.tabIndex = 0;
		commentBox.style.top = rect.top + scrollY - 16 + "px";
		commentBox.style.left = rect.left + rect.width - 5 + "px";
		commentBox.appendChild(icon);
		this.commentBox.shadowRoot.appendChild(commentBox);
		comment ? createCommentField() : icon.addEventListener("mouseup", () => createCommentField(), { once: true });
		//biome-ignore format:
		comment || setTimeout(() => commentBox.lastElementChild?.["value"] || commentBox.lastElementChild === this.commentBox.shadowRoot.activeElement || commentBox.remove(), 6000);

		function createCommentField() {
			const textField = document.createElement("textarea");
			textField.placeholder = "write comment";
			textField.value = comment ?? "";
			textField.focus();
			textField.addEventListener("change", saveComment);
			commentBox.appendChild(textField);
			return textField;
		}

		async function saveComment({ target }) {
			icon.setAttribute("class", target.value ? "comment-text" : "comment-plus");
			//TODO save comment
		}
	}

	removeCommentBox(markerId) {
		this.commentBox.shadowRoot.getElementById(markerId)?.remove();
	}
}
