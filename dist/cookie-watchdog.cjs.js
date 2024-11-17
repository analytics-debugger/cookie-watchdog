'use strict';

const CookieWatchdog = {
  // Internal state: Maps to store cookies and respective callbacks
  watchers: new Map(),
  // Internal: Check for cookieStore API support in the current environment
  checkCookieStoreApi() {
    if (typeof window === 'undefined' || !("cookieStore" in window)) {
      console.error("cookieStore API is not supported in this browser.");
      return false;
    } else {
      return true;
    }
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
      console.log('ADD GLOBAL LISTENER');
      window.cookieStore.addEventListener('change', this.listener);
    }
    const watcherPointer = this.watchers.get(cookieName);
    if (watcherPointer) {
      throw new Error(`A listener already exists for the cookie: ${cookieName}`);
    } else {
      console.log(arguments);
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
