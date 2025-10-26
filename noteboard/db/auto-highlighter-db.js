import { AutoHighlighter } from "./AutoHighlighter.js";
import { db, Store } from "./db.js";

/**
 * Finds a autoHighlighter in IndexedDB that match a given URL.
 * @param {string} currentUrl - The URL of the current webpage.
 * @returns {Promise<AutoHighlighter>} A promise that resolves to a matching autoHighlighter.
 */
export async function findAutoHighlighterByUrl(currentUrl) {
	return new Promise((resolve, reject) => {
		db.getObjStore(Store.AutoHighlighters).then((store) => {
			const request = store.index("urlPatterns").openCursor();

			request.onsuccess = (event) => {
				const cursor = event.target["result"];
				if (cursor) {
					const pattern = cursor.key;
					const theme = cursor.value;

					try {
						// Convert the wildcard pattern to a regular expression for matching.
						const regex = new RegExp("^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$");
						// Test the current page's URL against the pattern's regex.
						if (regex.test(currentUrl)) return resolve(theme);
					} catch (e) {
						console.error(`Invalid URL pattern "${pattern}" in theme "${theme.name}":`, e);
					}

					cursor.continue();
				} else resolve(null);
			};

			request.onerror = (event) => reject(event);
		});
	});
}

export async function getAllUrlPatterns() {
	return new Promise((resolve, reject) => {
		db.getObjStore(Store.AutoHighlighters, "readwrite").then((store) => {
			const putTask = store.index("urlPatterns").getAllRecords({ direction: "nextunique" });
			putTask.onsuccess = (evt) => {
				const objList = evt.target.result;
				const urlPatterns = objList.map((obj) => obj.key);
				resolve(urlPatterns);
			};
			putTask.onerror = (e) => reject(e);
		});
	});
}

/** @param {AutoHighlighter} autoHighlighter */
export async function insertAutoHighlighterInDb(autoHighlighter) {
	return new Promise((resolve, reject) => {
		db.getObjStore(Store.AutoHighlighters, "readwrite").then((store) => {
			const putTask = store.put(autoHighlighter);
			putTask.onsuccess = (evt) => resolve(autoHighlighter.id);
			putTask.onerror = (e) => reject(e);
		});
	});
}

export const autodb = { getAllUrlPatterns };
