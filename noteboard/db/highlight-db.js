import { cleanLink, URLToHash } from "./AutoHighlighter.js";
import { db, Store } from "./db.js";

/** @returns {Promise< import("../../scripts/highlighter/HighlightRange.js").HighlightRange[]>} */
export async function pipePageHighlightList(pageUrl) {
	const pageId = URLToHash(cleanLink(pageUrl));
	return new Promise((resolve, reject) => {
		db.getObjStore(Store.Highlights).then((store) => {
			const putTask = store.index("pageId").getAll(IDBKeyRange.only(pageId));
			putTask.onsuccess = (evt) => resolve(evt.target["result"]);
			putTask.onerror = (e) => reject(e);
		});
	});
}

/** @returns {Promise< import("../../scripts/highlighter/HighlightRange.js").HighlightRange[]>} */
export async function pipeHighlightList() {
	return new Promise((resolve, reject) => {
		db.getObjStore(Store.Highlights).then((store) => {
			const putTask = store.getAll();
			putTask.onsuccess = (evt) => resolve(evt.target["result"]);
			putTask.onerror = (e) => reject(e);
		});
	});
}

/** @returns {Promise<number>} */
export async function getPageHighlightCount(pageUrl) {
	const pageId = URLToHash(cleanLink(pageUrl));
	return new Promise((resolve, reject) => {
		db.getObjStore(Store.Highlights).then((store) => {
			const putTask = store.index("pageId").count(IDBKeyRange.only(pageId));
			putTask.onsuccess = (evt) => resolve(evt.target["result"]);
			putTask.onerror = (e) => reject(e);
		});
	});
}

/** @param {import("../../scripts/highlighter/HighlightRange.js").HighlightRange} highlight */
export async function insertHighlighter(highlight) {
	return new Promise((resolve, reject) => {
		db.getObjStore(Store.Highlights, "readwrite").then((store) => {
			const putTask = store.put(highlight);
			putTask.onsuccess = (evt) => resolve(highlight.id);
			putTask.onerror = (e) => reject(e);
		});
	});
}

export const lightdb = {
	pipeHighlightList,
	insertHighlighter,
	getPageHighlightCount,
};
