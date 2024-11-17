'use strict';

/*!
  * Cookie-store v4.0.0-next.4
  * https://github.com/markcellus/cookie-store
  *
  * Copyright (c) 2023 Mark
  * Licensed under the MIT license
 */

const decode = decodeURIComponent;
const pairSplitRegExp = /; */;
// Try decoding a string using a decoding function.
function tryDecode(str, decode) {
    try {
        return typeof decode === 'boolean' ? decodeURIComponent(str) : decode(str);
    }
    catch (e) {
        return str;
    }
}
var CookieSameSite;
(function (CookieSameSite) {
    CookieSameSite["strict"] = "strict";
    CookieSameSite["lax"] = "lax";
    CookieSameSite["none"] = "none";
})(CookieSameSite || (CookieSameSite = {}));
/**
 * Parse a cookie header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 */
function parse(str, options = {}) {
    if (typeof str !== 'string') {
        throw new TypeError('argument str must be a string');
    }
    const obj = [];
    const opt = options || {};
    const pairs = str.split(pairSplitRegExp);
    const dec = opt.decode || decode;
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        let eqIdx = pair.indexOf('=');
        // skip things that don't look like key=value
        if (eqIdx < 0) {
            continue;
        }
        const key = pair.substr(0, eqIdx).trim();
        let val = pair.substr(++eqIdx, pair.length).trim();
        // quoted values
        if ('"' == val[0]) {
            val = val.slice(1, -1);
        }
        // only assign once
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (undefined == obj[key]) {
            obj.push({
                name: key,
                value: tryDecode(val, dec),
            });
        }
    }
    return obj;
}
class CookieChangeEvent extends Event {
    constructor(type, eventInitDict = { changed: [], deleted: [] }) {
        super(type, eventInitDict);
        this.changed = eventInitDict.changed || [];
        this.deleted = eventInitDict.deleted || [];
    }
}
class CookieStore extends EventTarget {
    constructor() {
        super();
        throw new TypeError('Illegal Constructor');
    }
    get [Symbol.toStringTag]() {
        return 'CookieStore';
    }
    async get(init) {
        if (init == null) {
            throw new TypeError('CookieStoreGetOptions must not be empty');
        }
        else if (init instanceof Object && !Object.keys(init).length) {
            throw new TypeError('CookieStoreGetOptions must not be empty');
        }
        return (await this.getAll(init))[0];
    }
    async set(init, possibleValue) {
        var _a, _b, _c;
        const item = {
            name: '',
            value: '',
            path: '/',
            secure: false,
            sameSite: CookieSameSite.strict,
            expires: null,
            domain: null,
        };
        if (typeof init === 'string') {
            item.name = init;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            item.value = possibleValue;
        }
        else {
            Object.assign(item, init);
            if (item.path && !item.path.startsWith('/')) {
                throw new TypeError('Cookie path must start with "/"');
            }
            if ((_a = item.domain) === null || _a === void 0 ? void 0 : _a.startsWith('.')) {
                throw new TypeError('Cookie domain cannot start with "."');
            }
            if (item.domain && item.domain !== window.location.hostname) {
                throw new TypeError('Cookie domain must domain-match current host');
            }
            if (((_b = item.name) === null || _b === void 0 ? void 0 : _b.startsWith('__Host')) && item.domain) {
                throw new TypeError('Cookie domain must not be specified for host cookies');
            }
            if (((_c = item.name) === null || _c === void 0 ? void 0 : _c.startsWith('__Host')) && item.path != '/') {
                throw new TypeError('Cookie path must not be specified for host cookies');
            }
            if (item.path && item.path.endsWith('/')) {
                item.path = item.path.slice(0, -1);
            }
            if (item.path === '') {
                item.path = '/';
            }
        }
        if (item.name === '' && item.value && item.value.includes('=')) {
            throw new TypeError("Cookie value cannot contain '=' if the name is empty");
        }
        if (item.name && item.name.startsWith('__Host')) {
            item.secure = true;
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        let cookieString = `${item.name}=${encodeURIComponent(item.value)}`;
        if (item.domain) {
            cookieString += '; Domain=' + item.domain;
        }
        if (item.path) {
            cookieString += '; Path=' + item.path;
        }
        if (typeof item.expires === 'number') {
            cookieString += '; Expires=' + new Date(item.expires).toUTCString();
        }
        else if (item.expires instanceof Date) {
            cookieString += '; Expires=' + item.expires.toUTCString();
        }
        if ((item.name && item.name.startsWith('__Secure')) || item.secure) {
            item.sameSite = CookieSameSite.lax;
            cookieString += '; Secure';
        }
        switch (item.sameSite) {
            case CookieSameSite.lax:
                cookieString += '; SameSite=Lax';
                break;
            case CookieSameSite.strict:
                cookieString += '; SameSite=Strict';
                break;
            case CookieSameSite.none:
                cookieString += '; SameSite=None';
                break;
        }
        const previousCookie = this.get(item);
        document.cookie = cookieString;
        if (this.onchange) {
            const changed = [];
            const deleted = [];
            if (previousCookie && !(await this.get(item))) {
                deleted.push({ ...item, value: undefined });
            }
            else {
                changed.push(item);
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const event = new CookieChangeEvent('change', { changed, deleted });
            this.onchange(event);
        }
    }
    async getAll(init) {
        const cookies = parse(document.cookie);
        if (init == null || Object.keys(init).length === 0) {
            return cookies;
        }
        let name;
        let url;
        if (typeof init === 'string') {
            name = init;
        }
        else {
            name = init.name;
            url = init.url;
        }
        if (url) {
            const parsedURL = new URL(url, window.location.origin);
            if (window.location.href !== parsedURL.href ||
                window.location.origin !== parsedURL.origin) {
                throw new TypeError('URL must match the document URL');
            }
            return cookies.slice(0, 1);
        }
        return cookies.filter((cookie) => cookie.name === name);
    }
    async delete(init) {
        const item = {
            name: '',
            value: '',
            path: '/',
            secure: false,
            sameSite: CookieSameSite.strict,
            expires: null,
            domain: null,
        };
        if (typeof init === 'string') {
            item.name = init;
        }
        else {
            Object.assign(item, init);
        }
        item.expires = 0;
        await this.set(item);
    }
}
const workerSubscriptions = new WeakMap();
const registrations = new WeakMap();
class CookieStoreManager {
    get [Symbol.toStringTag]() {
        return 'CookieStoreManager';
    }
    constructor() {
        throw new TypeError('Illegal Constructor');
    }
    async subscribe(subscriptions) {
        const currentSubcriptions = workerSubscriptions.get(this) || [];
        const worker = registrations.get(this);
        if (!worker)
            throw new TypeError('Illegal invocation');
        for (const subscription of subscriptions) {
            const name = subscription.name;
            const url = new URL(subscription.url || '', worker.scope).toString();
            if (currentSubcriptions.some((x) => x.name === name && x.url === url))
                continue;
            currentSubcriptions.push({
                name: subscription.name,
                url,
            });
        }
        workerSubscriptions.set(this, currentSubcriptions);
    }
    async getSubscriptions() {
        return (workerSubscriptions.get(this) || []).map(({ name, url }) => ({
            name,
            url,
        }));
    }
    async unsubscribe(subscriptions) {
        let currentSubcriptions = workerSubscriptions.get(this) || [];
        const worker = registrations.get(this);
        if (!worker)
            throw new TypeError('Illegal invocation');
        for (const subscription of subscriptions) {
            const name = subscription.name;
            // TODO: Parse the url with the relevant settings objects API base URL.
            // https://wicg.github.io/cookie-store/#CookieStoreManager-unsubscribe
            const url = new URL(subscription.url || '', worker.scope).toString();
            currentSubcriptions = currentSubcriptions.filter((x) => {
                if (x.name !== name)
                    return true;
                if (x.url !== url)
                    return true;
                return false;
            });
        }
        workerSubscriptions.set(this, currentSubcriptions);
    }
}
if (!('cookies' in ServiceWorkerRegistration.prototype)) {
    Object.defineProperty(ServiceWorkerRegistration.prototype, 'cookies', {
        configurable: true,
        enumerable: true,
        get() {
            const manager = Object.create(CookieStoreManager.prototype);
            registrations.set(manager, this);
            Object.defineProperty(this, 'cookies', { value: manager });
            return manager;
        },
    });
}
const cookieStore = Object.create(CookieStore.prototype);

const CookieWatchdog = {
  // Internal state: Maps to store cookies and respective callbacks
  watchers: new Map(),
  // Internal: Check for cookieStore API support in the current environment
  checkCookieStoreApi() {
    if (typeof window === 'undefined' || !("cookieStore" in window)) {
      console.error("cookieStore API is not supported in this browser.");
      window.cookieStore = cookieStore;
      window.CookieStore = CookieStore;
      window.CookieChangeEvent = CookieChangeEvent;
    }
    return true;
  },
  // Internal: Get the value of a specific cookie
  getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  },
  watch(cookieName, callback) {
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
      untilReady: false
    };
    const listener = event => {
      const filteredChanges = event.changed.filter(cookie => this.watchers.has(cookie.name));
      const filteredDeletions = event.deleted.filter(cookie => this.watchers.has(cookie.name));
      if (filteredChanges.length > 0) {
        filteredChanges.forEach(change => {
          const currentValue = this.watchers.get(change.name);
          const actionType = currentValue.value === change.value ? 'unchanged' : currentValue.value === null ? 'created' : 'updated';
          callback({
            name: change.name,
            value: change.value,
            type: actionType
          });
          if (currentValue.options?.untilReady && actionType === "created") {
            this.unwatch(change.name);
          }
          currentValue.value = change.value;
          this.watchers.set(change.name, currentValue);
        });
      }
      if (filteredDeletions.length > 0) {
        filteredDeletions.forEach(change => {
          const currentValue = this.watchers.get(change.name);
          currentValue.value = null;
          callback({
            name: change.name,
            value: change.value,
            type: 'deleted'
          });
          this.watchers.set(change.name, currentValue);
        });
      }
    };
    if (typeof window === 'undefined') {
      throw new Error('This needs to run in a browser.');
    }
    if (typeof callback !== 'function') {
      throw new Error(`The callback for ${cookieName} must be a function.`);
    }
    if (!this.checkCookieStoreApi()) {
      throw new Error('cookieStore API not available');
    }

    // Save listener function as a property of CookieWatchdog to reference it later
    this.listener = listener;

    // Add global listener if it's the first watcher
    if (this.watchers.size === 0) {
      window.cookieStore.addEventListener('change', this.listener);
    }
    const watcherPointer = this.watchers.get(cookieName);
    if (watcherPointer) {
      throw new Error(`A listener already exists for the cookie: ${cookieName}`);
    } else {
      const currentCookieValue = this.getCookie(cookieName);
      this.watchers.set(cookieName, {
        value: currentCookieValue,
        callback: callback,
        options: options
      });
      callback({
        name: cookieName,
        value: currentCookieValue,
        type: currentCookieValue !== null ? 'existing' : 'missing'
      });
      if (currentCookieValue !== null && options?.untilReady) {
        this.unwatch(cookieName);
      }
    }
  },
  // Public: Stop watching a specific cookie
  unwatch(cookieName) {
    if (typeof window === 'undefined') return;
    if (this.watchers.has(cookieName)) {
      console.log("REMOVING LISTENER FOR COOKIE", cookieName);
      this.watchers.delete(cookieName);
      if (this.watchers.size === 0) {
        console.log("REMOVE GLOBAL LISTENER ");
        window.cookieStore.removeEventListener("change", this.listener);
      }
    }
  }
};

// Expose the public methods for external use
var index = {
  watch: CookieWatchdog.watch.bind(CookieWatchdog),
  unwatch: CookieWatchdog.unwatch.bind(CookieWatchdog)
};

module.exports = index;
//# sourceMappingURL=cookie-watchdog.cjs.js.map
