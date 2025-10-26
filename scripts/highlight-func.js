export async function showColorPot(imgUrl) {
	try {
		const scriptUrl = chrome.runtime.getURL("scripts/colorpot/highlight-colorpot.js");
		const { onSelectText, onSelectImage } = await import(scriptUrl);
		imgUrl ? onSelectImage(imgUrl) : onSelectText();
	} catch (error) {
		console.error(error);
	}
	/* location.href.startsWith("https://www.youtube.com/watch?v=") ||
		import(chrome.runtime.getURL("scripts/auto-popup.js")).catch((err) => console.error(err)); */
}
