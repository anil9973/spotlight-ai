import { lightdb, pipePageHighlightList } from "../noteboard/db/highlight-db.js";
import { registerScriptsOnUpdate } from "../popup/js/content-script.js";
import { showColorPot } from "../scripts/highlight-func.js";
import { aiAutoHighlightText } from "./ai-auto-highlight.js";
import { onUpdateTab } from "./highlight.js";
import { injectFuncScript2 } from "./util.js";

globalThis.getStore = chrome.storage.local.get.bind(chrome.storage.local);
globalThis.setStore = chrome.storage.local.set.bind(chrome.storage.local);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.command === "aiAutoHighlight") {
		aiAutoHighlightText(request.blockTextContents).then(sendResponse);
		return true;
	}
	if (request.command === "saveHighlight") {
		//TODO check website access permission
		lightdb.insertHighlighter(request.highlight).then(sendResponse);
		return true;
	}
	if (request.command === "getPageHighlights") {
		pipePageHighlightList(request.pageUrl).then(sendResponse);
		return true;
	}
});

chrome.tabs.onUpdated.addListener(onUpdateTab);

export const contextHandler = {
	//prettier-ignore
	highlight: (info, tab) => injectFuncScript2(showColorPot, tab.id, info.srcUrl ? "showColorpotPopupOnImg" : "showColorpotPopup", info.frameId, info.srcUrl ),
	noteboard: (info, tab) => chrome.tabs.create({ url: "noteboard/index.html" }),
};
chrome.contextMenus.onClicked.addListener((info, tab) => contextHandler[info.menuItemId](info, tab));

//commands
const commands = {
	colorpot_popup: async () => {
		const tabId = (await chrome.tabs.query({ currentWindow: true, active: true }))[0].id;
		injectFuncScript2(showColorPot, tabId, "showColorpotPopup");
	},
};
chrome.commands.onCommand.addListener((cmd) => commands[cmd]?.());

export function setInstallation({ reason }) {
	async function oneTimeInstall() {
		chrome.storage.sync.set({
			colors: [
				{ highlightClr: "#c8ff00", textClr: "black", title: "", enable: true },
				{ highlightClr: "#ffdb58", textClr: "black", title: "", enable: true },
				{ highlightClr: "#ffa07a", textClr: "black", title: "", enable: true },
				{ highlightClr: "#e0b0ff", textClr: "black", title: "", enable: true },
				{ highlightClr: "#00fa9a", textClr: "black", title: "", enable: true },
				{ highlightClr: "#ff9999", textClr: "black", title: "", enable: true },
			],
		});
		// chrome.runtime.setUninstallURL(SURVEY_URL);
	}
	reason === "install" && oneTimeInstall();
	reason === "update" && onUpdate();

	async function onUpdate() {
		registerScriptsOnUpdate();
	}

	chrome.contextMenus.create({
		id: "highlight",
		title: "Highlight" + " (Alt+H)",
		contexts: ["selection", "image"],
	});
	chrome.contextMenus.create({ id: "noteboard", title: "📒 Noteboard", contexts: ["action"] });
}

// installation setup
chrome.runtime.onInstalled.addListener(setInstallation);
