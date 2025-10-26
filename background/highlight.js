import { getPageHighlightCount } from "../noteboard/db/highlight-db.js";
import { applyHighlight } from "../scripts/func-script.js";
import { injectFuncScript2 } from "./util.js";

export async function onUpdateTab(tabId, info, tab) {
	if (info.status !== "complete") return;
	if (!tab.url && !tab.url?.startsWith("http")) return;
	const count = await getPageHighlightCount(tab.url);
	if (count === 0) return;

	injectFuncScript2(applyHighlight, tabId, "applyPageHighlights");
	chrome.action.setBadgeText({ tabId, text: count.toString() });
	chrome.action.setBadgeBackgroundColor({ tabId, color: "#ffcc00" });
}
