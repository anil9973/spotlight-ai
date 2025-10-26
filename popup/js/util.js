export const getCrtTab = async () => (await chrome.tabs.query({ active: true, currentWindow: true }))[0];

export async function getUrlSuggestions() {
	const pageUrls = (await chrome.tabs.query({})).filter((tab) => tab.url).map((tab) => tab.url);
	const urlSuggestions = [];
	for (const tabUrl of pageUrls) {
		const url = new URL(tabUrl);
		if (url.protocol !== "https:") continue;
		const origin = url.origin + "/*";
		const originPath = `${url.origin}/${url.pathname.slice(1, url.pathname.indexOf("/", 1))}/*`;
		urlSuggestions.indexOf(origin) === -1 && urlSuggestions.push(origin);
		url.pathname === "/" || (urlSuggestions.indexOf(originPath) === -1 && urlSuggestions.push(originPath));
	}
	return urlSuggestions;
}
