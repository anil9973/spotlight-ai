import { Webpage } from "./AutoHighlighter.js";
import { db, Store } from "./db.js";

/** @param {Webpage} webpage */
export async function insertHighlighterInDb(webpage) {
	return new Promise((resolve, reject) => {
		db.getObjStore(Store.Webpages, "readwrite").then((store) => {
			const putTask = store.put(webpage);
			putTask.onsuccess = (evt) => resolve(webpage.id);
			putTask.onerror = (e) => reject(e);
		});
	});
}
