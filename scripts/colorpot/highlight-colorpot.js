// import { ImageHighlighter } from "../highlighter/image-highlighter.js";
import { Highlighter } from "../highlighter/highlighter.js";
// @ts-ignore
import highlighterCss from "./highlighter.css" with { type: "css" };

const { colors } = await chrome.storage.sync.get("colors");
const spotLightHighlighter = new Highlighter();
// const imageHighlighter = new ImageHighlighter();

//biome-ignore format:
export function createColorPot(onColorClick = spotLightHighlighter.highlightSelectedByUser.bind(spotLightHighlighter), onDeleteClick = spotLightHighlighter.deleteHighlight.bind(spotLightHighlighter)) {
	const markerColorPot = document.createElement("markernote-highlighter");
	const highlighterUi = `<div class="color-list" popover>
	${colors
		.filter((color) => color.enable)
		.map((color) => `<span title="${color.title ?? ""}"  style="--mark-clr: ${color.highlightClr}"></span>`)
		.join("")}
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="remove-highlight" hidden><title>${chrome.i18n.getMessage("remove_highlight")}</title><path  /></svg>`;
	const domFrag = document.createRange().createContextualFragment(highlighterUi);
	markerColorPot.attachShadow({ mode: "open" });
	markerColorPot.shadowRoot.adoptedStyleSheets = [highlighterCss];
	markerColorPot.shadowRoot.appendChild(domFrag);
	document.body.appendChild(markerColorPot);

	const colorPot = markerColorPot.shadowRoot.firstElementChild;
	colorPot.addEventListener("pointerdown", (evt) => {
		const color = evt.target["style"].getPropertyValue("--mark-clr");
		onColorClick(color);
		colorPot["hidePopover"]();
	});

	colorPot.lastElementChild.addEventListener("pointerdown", (evt) => {
		evt.stopImmediatePropagation();
		onDeleteClick();
		colorPot["hidePopover"]();
	});
	return colorPot;
}

export function showColorPot(posX, posY) {
	const selection = getSelection();
	if (selection.isCollapsed) return;
	globalThis.colorPot ??= createColorPot();
	globalThis.colorPot.style.top = posY + 5 + "px";
	globalThis.colorPot.style.left = `min(85%, ${posX - 40}px)`;
	globalThis.colorPot.showPopover();

	const parentNode = selection.getRangeAt(0).commonAncestorContainer;
	const parentElem = parentNode.nodeType === 1 ? parentNode : parentNode.parentElement;
	// TODO show delete highlight icon
	spotLightHighlighter.showCommentBoxOnSelect(selection.getRangeAt(0), parentElem);
}

export function onSelectText() {
	const selection = getSelection();
	if (selection.isCollapsed) return;
	const range = selection.getRangeAt(0);
	const react = range.getBoundingClientRect();
	const posX = react.left + react.width / 2;
	const posY = react.top + react.height;
	showColorPot(posX, posY);
}

export function onSelectImage(srcUrl) {
	/* function getTargetImgElem() {
		const imgElements = document.body.querySelectorAll("img");
		for (const imgElem of imgElements) if (imgElem.currentSrc === srcUrl) return imgElem;
	}
	const imgElem = getTargetImgElem();
	if (!imgElem) return;
	const rect = imgElem.getBoundingClientRect();
	imageHighlighter.targetImgElem = imgElem;
	//biome-ignore format:
	globalThis.imgColorPot ??= createColorPot(imageHighlighter.highlightImage.bind(imageHighlighter), imageHighlighter.removeHighlightFromImg.bind(imageHighlighter));
	globalThis.imgColorPot.style.top = rect.y + rect.height / 2 + "px";
	globalThis.imgColorPot.style.left = rect.x + rect.width / 2 + "px";
	globalThis.imgColorPot.showPopover();
	imgElem.hasAttribute("data-markerid")
		? globalThis.imgColorPot.lastElementChild.removeAttribute("hidden")
		: globalThis.imgColorPot.lastElementChild.setAttribute("hidden", ""); */
}

addEventListener("keydown", (evt) => {
	if (evt.ctrlKey && evt.shiftKey && evt.code === "KeyH") spotLightHighlighter.highlightSelectedByUser(null);
	else if (evt.shiftKey && evt.code === "Space") {
		const selection = getSelection();
		selection.modify("extend", "forward", "line");
		evt.preventDefault();
	}
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.msg === "showColorpotPopup") {
		onSelectText();
		import(chrome.runtime.getURL("scripts/auto-popup.js")).catch((err) => console.error(err));
		sendResponse("popup shown");
	} else if (request.msg === "showColorpotPopupOnImg") {
		onSelectImage(request.arg);
		sendResponse("popup shown on image");
	} else if (request.msg === "applyPageHighlights") {
		sendResponse("highlight applied");
	}
});
