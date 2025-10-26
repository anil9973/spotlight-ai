import { findAutoHighlighterByUrl } from "../noteboard/db/auto-highlighter-db.js";
import { extractPageInfo } from "../scripts/func-script.js";
import { getCrtTab, injectFuncScript } from "./util.js";
import { PromptBuilder } from "../AI/prompt-builder.js";
import { aiService } from "../AI/ai.js";

/**@returns {Promise<import("../AI/ai.js").HighlightBlock[]>} */
export async function aiAutoHighlightText(blockTextContents) {
	try {
		const tab = await getCrtTab();
		const pageInfo = await injectFuncScript(extractPageInfo, tab.id);
		const autoHighlighter = await findAutoHighlighterByUrl(tab.url);
		const promptText = await new PromptBuilder().build(pageInfo, blockTextContents, autoHighlighter);
		const highlightedTextContents = await aiService.highlightText(promptText);
		//TODO save highlights in DB
		return highlightedTextContents;
	} catch (error) {
		console.error(error);
	}
}
