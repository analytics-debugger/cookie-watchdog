(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.CookieWatchdog = factory());
})(this, (function () { 'use strict';

    const CookieWatchdog = {
      // Internal state: Maps to store cookies and respective callbacks
      watches: new Map(),
      cookieCache: new Map(),
      // Internal: Check for cookieStore API support in the current environment
      checkCookieStoreApi() {
        if (typeof window === 'undefined' || !("cookieStore" in window)) {
          console.error("cookieStore API is not supported in this browser.");
          return false;
        }
      },
      // Internal: Get the value of a specific cookie
      getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
      },
      // Internal: Handle changes in cookies, including updates and deletions
      handleCookieChange(event) {
        // Handle updated or created cookies
        event.changed.forEach(change => {
          const previousState = this.cookieCache.get(change.name);
          const newValue = this.getCookie(change.name);
          let operationType = "unchanged";

          // Determine the type of change (created, updated, or unchanged)
          if (previousState) {
            if (previousState.deleted) {
              operationType = "created";
            } else if (previousState.value !== newValue) {
              operationType = "updated";
            }
          } else {
            operationType = "created";
          }

          // Notify watchers if the cookie value has changed
          if (operationType !== "unchanged") {
            this.cookieCache.set(change.name, {
              value: newValue,
              deleted: false
            });
            this.notifyWatchers(change.name, {
              name: change.name,
              value: newValue,
              type: operationType
            });
          }
        });

        // Handle cookie deletions
        event.deleted.forEach(deletion => {
          const cachedValue = this.cookieCache.get(deletion.name) || null;
          this.cookieCache.set(deletion.name, {
            value: null,
            deleted: true
          });
          this.notifyWatchers(deletion.name, {
            name: deletion.name,
            value: cachedValue,
            type: "deleted"
          });
        });
      },
      // Internal: Notify all watchers for a given cookie
      notifyWatchers(cookieName, changeInfo) {
        if (this.watches.has(cookieName)) {
          this.watches.get(cookieName).forEach(callback => callback(changeInfo));
        }
      },
      // Public: Start watching a specific cookie for changes
      watch(cookieName, callback) {
        let untilReady = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        if (typeof window === 'undefined') return;
        // Ensure callback is a function
        if (typeof callback !== 'function') {
          throw new Error(`The callback for ${cookieName} must be a function.`);
        }
        this.checkCookieStoreApi();

        // Ensure only one listener exists for each cookie
        if (this.watches.has(cookieName)) {
          throw new Error(`A listener already exists for the cookie: ${cookieName}`);
        }

        // Define a listener function to handle the cookie changes
        const listener = event => {
          this.handleCookieChange(event);

          // Flag to stop listening after the first event that matches the conditions
          let stopListening = false;
          if (event.changed && event.changed.length > 0) {
            event.changed.forEach(change => {
              if (this.watches.has(change.name)) {
                // Notify the callback about the change
                const newValue = this.getCookie(change.name);
                callback({
                  name: change.name,
                  value: newValue,
                  type: change.deleted ? 'deleted' : 'updated'
                });

                // If 'untilReady' is true, stop listening on 'existing', 'updated', or 'created' events
                if (untilReady && (newValue !== null || change.deleted || change.name !== undefined)) {
                  stopListening = true;
                }
              }
            });
          }

          // If 'untilReady' is true, remove the event listener after the first 'existing', 'update', or 'create'
          if (stopListening) {
            window.cookieStore.removeEventListener('change', listener);
          }
        };

        // Add the event listener to monitor cookie changes
        if (this.watches.size === 0) {
          window.cookieStore.addEventListener('change', listener);
        }

        // Store the watch for the cookie
        this.watches.set(cookieName, [callback]);

        // Retrieve and cache the current cookie value
        const existingCookie = this.getCookie(cookieName);
        const initialValue = existingCookie || null;

        // Store the initial cookie state in cache
        this.cookieCache.set(cookieName, {
          value: initialValue,
          deleted: initialValue === null
        });

        // Notify the watcher with the initial state
        callback({
          name: cookieName,
          value: initialValue,
          type: initialValue !== null ? 'existing' : 'missing' // Type depends on cookie presence
        });
      },
      // Public: Stop watching a specific cookie
      unwatch(cookieName) {
        if (typeof window === 'undefined') return;

        // Remove all watchers for the specified cookie
        if (this.watches.has(cookieName)) {
          this.watches.delete(cookieName);
          this.cookieCache.delete(cookieName);

          // Remove event listener if no watches remain
          if (this.watches.size === 0) {
            window.cookieStore.removeEventListener("change", this.handleCookieChange.bind(this));
          }
        }
      }
    };

    // Expose the public methods for external use
    var index = {
      watch: CookieWatchdog.watch.bind(CookieWatchdog),
      unwatch: CookieWatchdog.unwatch.bind(CookieWatchdog)
    };

    return index;

}));
//# sourceMappingURL=cookie-watchdog.js.map
