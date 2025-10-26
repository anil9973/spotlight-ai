import { autodb } from "../../noteboard/db/auto-highlighter-db.js";

const ID = "auto_highlight";

// register Auto highlight script
export async function registerScriptsOnUpdate() {
	const urlPatterns = await autodb.getAllUrlPatterns();
	urlPatterns.length > 0 && registerContentScript(urlPatterns);
}

export async function registerContentScript(matches) {
	if (matches.length === 0) return;
	await chrome.scripting.registerContentScripts([
		{
			id: ID,
			allFrames: true,
			js: ["scripts/ai-highlight/auto-highlight.js"],
			matches: matches,
			runAt: "document_start",
		},
	]);
}

/**@param {string[]} matches*/
export async function updateUrlInContentScript(matches, command) {
	if (!Array.isArray(matches)) return;
	try {
		const scripts = await chrome.scripting.getRegisteredContentScripts({ ids: [ID] });
		if (!scripts || scripts.length === 0) return await registerContentScript(matches);
		const script = scripts[0];
		if (script.id !== ID) return;
		if (matches) {
			command === "remove"
				? script.matches?.splice(script.matches.indexOf(matches[0]), 1)
				: script.matches.push(...matches);
		}

		if (script.matches.length === 0) return toast(i18n("atleast_one_match_urls"), true);
		await chrome.scripting.updateContentScripts([script]);
	} catch (error) {
		console.error(error);
		if (self["clients"]) return;
	}
}

export async function unRegisterContentScript() {
	const scripts = await chrome.scripting.getRegisteredContentScripts({ ids: [ID] });
	if (!scripts[0]) return;
	await setStore({ advRuleScriptSnapshot: scripts[0] });
	await chrome.scripting.unregisterContentScripts({ ids: [ID] });
}

// /** @param {string[]} webpages*/
// export async function requestPermission(webpages) {
// 	const editorDialog = $("editor-dialog");
// 	const permissions = { origins: webpages };
// 	const hasPermission = await chrome.permissions.contains(permissions);
// 	if (hasPermission) return editorDialog?.remove();
// 	const { HostPermission } = await import("../components/utils/host-permission.js");
// 	(editorDialog?.shadowRoot ?? document.body).appendChild(new HostPermission(webpages));
// }
