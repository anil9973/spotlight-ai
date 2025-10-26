export const Store = {
	Highlights: "Highlights",
	Webpages: "Webpages",
	AutoHighlighters: "AutoHighlighters",
	SyncFolderHandles: "SyncFolderHandles",
};

class DatabaseManager {
	constructor() {}

	db;

	onupgradeneeded({ target }) {
		const highlightStore = target.result.createObjectStore(Store.Highlights, { keyPath: "id" });
		highlightStore.createIndex("pageId", "pageId", { unique: false });

		const pageStore = target.result.createObjectStore(Store.Webpages, { keyPath: "id" });
		pageStore.createIndex("tags", "tags", { unique: false, multiEntry: true });
		pageStore.createIndex("date", "date", { unique: false });
		pageStore.createIndex("domain", "domain", { unique: false });

		const autohighlighterStore = target.result.createObjectStore(Store.AutoHighlighters, { keyPath: "id" });
		autohighlighterStore.createIndex("urlPatterns", "urlPatterns", { unique: false, multiEntry: true });

		target.result.createObjectStore(Store.SyncFolderHandles);
	}

	/** @returns {Promise<IDBDatabase>} */
	connect() {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open("SpotLightAI", 1);
			request.onupgradeneeded = this.onupgradeneeded;
			request.onsuccess = () => {
				this.db = request.result;
				this.db.onclose = () => (this.db = null);
				resolve(this.db);
			};
			request.onerror = () => reject(request.error);
			request.onblocked = () => console.warn("pending till unblocked");
		});
	}

	/** @param {string} storeName */
	async getObjStore(storeName, mode = "readonly") {
		this.db ??= await this.connect();
		return this.db.transaction(storeName, mode).objectStore(storeName);
	}

	/** @param {string} storeName */
	async getObjTxn(storeName, mode = "readwrite") {
		this.db ??= await this.connect();
		return this.db.transaction(storeName, mode);
	}
}

export const db = new DatabaseManager();
