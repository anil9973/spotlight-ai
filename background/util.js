export const getCrtTab = async () => (await chrome.tabs.query({ currentWindow: true, active: true }))[0];

/**@param {(...args: any[]) => any} func*/
export async function injectFuncScript(func, tabId, ...args) {
	tabId ??= (await getCrtTab()).id;

	try {
		const results = await chrome.scripting.executeScript({
			target: { tabId },
			func: func,
			args: args,
		});
		return results[0].result;
	} catch (error) {
		console.warn(error);
	}
}

/** @param {()=>void} func*/
export async function injectFuncScript2(func, tabId, command, frameId, arg = null) {
	const target = { tabId };
	frameId ? frameId > 0 && (target.frameIds = [frameId]) : (target.allFrames = true);
	const execScript = () =>
		chrome.scripting.executeScript({ target, func, args: [arg] }).catch((err) => console.error(err));

	try {
		const response = await chrome.tabs.sendMessage(tabId, { img: command, arg });
		response ?? execScript();
	} catch (error) {
		execScript();
	}
}
