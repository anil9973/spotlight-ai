(async function () {
	const aiHighlightedUrls = (await chrome.storage.local.get("aiHighlightedUrls")).aiHighlightedUrls ?? [];
	const pageUrl = location.host + location.pathname;
	if (aiHighlightedUrls.includes(pageUrl)) return;
	import("./ai-highlighter.js").then(({ AIAutoHighlighter }) => new AIAutoHighlighter());
})();
