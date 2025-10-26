/**@param {Node} parentNode*/
function getParentTree(parentNode) {
	const element = parentNode.nodeType === Node.TEXT_NODE ? parentNode.parentElement : parentNode;
	const indexTree = [element["markerIdx"]];
	let parentElem = element;
	while ((parentElem = parentElem.parentElement)) {
		if (parentElem === document.body) break;
		indexTree.push(parentElem["markerIdx"]);
	}
	return indexTree.reverse();
}

/**@param {Node} txtNode*/
function getTxtNodeIdx(txtNode) {
	let txtNodeIdx = 0;

	let prevSibling = txtNode.previousSibling;
	while (prevSibling) {
		prevSibling = prevSibling.previousSibling;
		txtNodeIdx++;
	}
	return txtNodeIdx;
}

/**@param {Node} commonParent, @param {Node} textNode, @returns {Number[]}*/
function getRangeNodeParents(commonParent, textNode) {
	const parents = [];
	let parentElem = textNode.parentElement;
	while (parentElem !== commonParent) {
		parents.push(parentElem["markerIdx"]);
		parentElem = parentElem.parentElement;
	}
	return parents.length !== 0 ? parents.reverse() : null;
}

export class HighlightRange {
	/**@param {Range} range, @param {String} color @param {object} [analysis] */
	constructor(range, textContent, color, source = "manual", analysis) {
		const startTxtNodeIdx = getTxtNodeIdx(range.startContainer);
		const endTxtNodeIdx = getTxtNodeIdx(range.endContainer);
		const parentNode = range.commonAncestorContainer;

		this.id = Math.random().toString(36).slice(2);
		this.pageId = URLToHash(location.host + location.pathname);
		this.startTxtNodeIdx = startTxtNodeIdx;
		this.startOffset = range.startOffset;
		this.endTxtNodeIdx = endTxtNodeIdx;
		this.endOffset = range.endOffset;
		this.commonParentTree = getParentTree(parentNode);

		if (range.startContainer === range.endContainer) this.startParents = this.endParents = null;
		else {
			this.startParents = getRangeNodeParents(parentNode, range.startContainer);
			this.endParents = getRangeNodeParents(parentNode, range.endContainer);
		}

		this.textContent = textContent;
		this.color = color;
		this.source = source;
		this.comment = "";
		this.analysis = analysis;
		this.createdAt = Date.now();
	}
}

export class AIHighlightRange extends HighlightRange {
	constructor(highlight) {
		super(highlight.range, highlight.textContent, highlight.color, "auto");
		this.relevanceScore = highlight.relevanceScore;
		this.reason = highlight.reason;
	}
}

export function URLToHash(url) {
	let hash = 2166136261;

	for (let i = 0; i < url.length; i++) {
		hash ^= url.charCodeAt(i);
		hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
	}

	return hash >>> 0;
}
