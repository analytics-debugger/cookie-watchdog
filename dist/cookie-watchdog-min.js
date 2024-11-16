!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).CookieWatchdog=t()}(this,(function(){"use strict";const e={watches:new Map,cookieCache:new Map,checkCookieStoreApi(){if("undefined"==typeof window||!("cookieStore"in window))return console.error("cookieStore API is not supported in this browser."),!1},getCookie(e){const t=document.cookie.match(new RegExp("(^| )"+e+"=([^;]+)"));return t?decodeURIComponent(t[2]):null},handleCookieChange(e){e.changed.forEach((e=>{const t=this.cookieCache.get(e.name),o=this.getCookie(e.name);let n="unchanged";t?t.deleted?n="created":t.value!==o&&(n="updated"):n="created","unchanged"!==n&&(this.cookieCache.set(e.name,{value:o,deleted:!1}),this.notifyWatchers(e.name,{name:e.name,value:o,type:n}))})),e.deleted.forEach((e=>{const t=this.cookieCache.get(e.name)||null;this.cookieCache.set(e.name,{value:null,deleted:!0}),this.notifyWatchers(e.name,{name:e.name,value:t,type:"deleted"})}))},notifyWatchers(e,t){this.watches.has(e)&&this.watches.get(e).forEach((e=>e(t)))},watch(e,t){let o=arguments.length>2&&void 0!==arguments[2]&&arguments[2];if("undefined"==typeof window)return;if("function"!=typeof t)throw new Error(`The callback for ${e} must be a function.`);if(this.checkCookieStoreApi(),this.watches.has(e))throw new Error(`A listener already exists for the cookie: ${e}`);const n=e=>{this.handleCookieChange(e);let i=!1;e.changed&&e.changed.length>0&&e.changed.forEach((e=>{if(this.watches.has(e.name)){const n=this.getCookie(e.name);t({name:e.name,value:n,type:e.deleted?"deleted":"updated"}),o&&(null!==n||e.deleted||void 0!==e.name)&&(i=!0)}})),i&&window.cookieStore.removeEventListener("change",n)};0===this.watches.size&&window.cookieStore.addEventListener("change",n),this.watches.set(e,[t]);const i=this.getCookie(e)||null;this.cookieCache.set(e,{value:i,deleted:null===i}),t({name:e,value:i,type:null!==i?"existing":"missing"})},unwatch(e){"undefined"!=typeof window&&this.watches.has(e)&&(this.watches.delete(e),this.cookieCache.delete(e),0===this.watches.size&&window.cookieStore.removeEventListener("change",this.handleCookieChange.bind(this)))}};return{watch:e.watch.bind(e),unwatch:e.unwatch.bind(e)}}));
