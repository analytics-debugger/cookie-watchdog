var CookieWatchdog=function(){"use strict";
/*!
    * Cookie-store v4.0.0-next.4
    * https://github.com/markcellus/cookie-store
    *
    * Copyright (c) 2023 Mark
    * Licensed under the MIT license
   */const e=decodeURIComponent,t=/; */;function o(e,t){try{return"boolean"==typeof t?decodeURIComponent(e):t(e)}catch(t){return e}}var n;!function(e){e.strict="strict",e.lax="lax",e.none="none"}(n||(n={}));class i extends Event{constructor(e,t={changed:[],deleted:[]}){super(e,t),this.changed=t.changed||[],this.deleted=t.deleted||[]}}class r extends EventTarget{constructor(){throw super(),new TypeError("Illegal Constructor")}get[Symbol.toStringTag](){return"CookieStore"}async get(e){if(null==e)throw new TypeError("CookieStoreGetOptions must not be empty");if(e instanceof Object&&!Object.keys(e).length)throw new TypeError("CookieStoreGetOptions must not be empty");return(await this.getAll(e))[0]}async set(e,t){var o,r,s;const a={name:"",value:"",path:"/",secure:!1,sameSite:n.strict,expires:null,domain:null};if("string"==typeof e)a.name=e,a.value=t;else{if(Object.assign(a,e),a.path&&!a.path.startsWith("/"))throw new TypeError('Cookie path must start with "/"');if(null===(o=a.domain)||void 0===o?void 0:o.startsWith("."))throw new TypeError('Cookie domain cannot start with "."');if(a.domain&&a.domain!==window.location.hostname)throw new TypeError("Cookie domain must domain-match current host");if((null===(r=a.name)||void 0===r?void 0:r.startsWith("__Host"))&&a.domain)throw new TypeError("Cookie domain must not be specified for host cookies");if((null===(s=a.name)||void 0===s?void 0:s.startsWith("__Host"))&&"/"!=a.path)throw new TypeError("Cookie path must not be specified for host cookies");a.path&&a.path.endsWith("/")&&(a.path=a.path.slice(0,-1)),""===a.path&&(a.path="/")}if(""===a.name&&a.value&&a.value.includes("="))throw new TypeError("Cookie value cannot contain '=' if the name is empty");a.name&&a.name.startsWith("__Host")&&(a.secure=!0);let c=`${a.name}=${encodeURIComponent(a.value)}`;switch(a.domain&&(c+="; Domain="+a.domain),a.path&&(c+="; Path="+a.path),"number"==typeof a.expires?c+="; Expires="+new Date(a.expires).toUTCString():a.expires instanceof Date&&(c+="; Expires="+a.expires.toUTCString()),(a.name&&a.name.startsWith("__Secure")||a.secure)&&(a.sameSite=n.lax,c+="; Secure"),a.sameSite){case n.lax:c+="; SameSite=Lax";break;case n.strict:c+="; SameSite=Strict";break;case n.none:c+="; SameSite=None"}const h=this.get(a);if(document.cookie=c,this.onchange){const e=[],t=[];h&&!await this.get(a)?t.push({...a,value:void 0}):e.push(a);const o=new i("change",{changed:e,deleted:t});this.onchange(o)}}async getAll(n){const i=function(n,i={}){if("string"!=typeof n)throw new TypeError("argument str must be a string");const r=[],s=i||{},a=n.split(t),c=s.decode||e;for(let e=0;e<a.length;e++){const t=a[e];let n=t.indexOf("=");if(n<0)continue;const i=t.substr(0,n).trim();let s=t.substr(++n,t.length).trim();'"'==s[0]&&(s=s.slice(1,-1)),null==r[i]&&r.push({name:i,value:o(s,c)})}return r}(document.cookie);if(null==n||0===Object.keys(n).length)return i;let r,s;if("string"==typeof n?r=n:(r=n.name,s=n.url),s){const e=new URL(s,window.location.origin);if(window.location.href!==e.href||window.location.origin!==e.origin)throw new TypeError("URL must match the document URL");return i.slice(0,1)}return i.filter((e=>e.name===r))}async delete(e){const t={name:"",value:"",path:"/",secure:!1,sameSite:n.strict,expires:null,domain:null};"string"==typeof e?t.name=e:Object.assign(t,e),t.expires=0,await this.set(t)}}const s=new WeakMap,a=new WeakMap;class c{get[Symbol.toStringTag](){return"CookieStoreManager"}constructor(){throw new TypeError("Illegal Constructor")}async subscribe(e){const t=s.get(this)||[],o=a.get(this);if(!o)throw new TypeError("Illegal invocation");for(const n of e){const e=n.name,i=new URL(n.url||"",o.scope).toString();t.some((t=>t.name===e&&t.url===i))||t.push({name:n.name,url:i})}s.set(this,t)}async getSubscriptions(){return(s.get(this)||[]).map((({name:e,url:t})=>({name:e,url:t})))}async unsubscribe(e){let t=s.get(this)||[];const o=a.get(this);if(!o)throw new TypeError("Illegal invocation");for(const n of e){const e=n.name,i=new URL(n.url||"",o.scope).toString();t=t.filter((t=>t.name!==e||t.url!==i))}s.set(this,t)}}"cookies"in ServiceWorkerRegistration.prototype||Object.defineProperty(ServiceWorkerRegistration.prototype,"cookies",{configurable:!0,enumerable:!0,get(){const e=Object.create(c.prototype);return a.set(e,this),Object.defineProperty(this,"cookies",{value:e}),e}});const h=Object.create(r.prototype),l={watchers:new Map,checkCookieStoreApi:()=>("undefined"!=typeof window&&"cookieStore"in window||(console.error("cookieStore API is not supported in this browser."),window.cookieStore=h,window.CookieStore=r,window.CookieChangeEvent=i),!0),getCookie(e){const t=document.cookie.match(new RegExp("(^| )"+e+"=([^;]+)"));return t?decodeURIComponent(t[2]):null},watch(e,t){let o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{untilReady:!1};if("undefined"==typeof window)throw new Error("This needs to run in a browser.");if("function"!=typeof t)throw new Error(`The callback for ${e} must be a function.`);if(!this.checkCookieStoreApi())throw new Error("cookieStore API not available");this.listener=e=>{const o=e.changed.filter((e=>this.watchers.has(e.name))),n=e.deleted.filter((e=>this.watchers.has(e.name)));o.length>0&&o.forEach((e=>{const o=this.watchers.get(e.name),n=o.value===e.value?"unchanged":null===o.value?"created":"updated";t({name:e.name,value:e.value,type:n}),o.options?.untilReady&&"created"===n&&this.unwatch(e.name),o.value=e.value,this.watchers.set(e.name,o)})),n.length>0&&n.forEach((e=>{const o=this.watchers.get(e.name);o.value=null,t({name:e.name,value:e.value,type:"deleted"}),this.watchers.set(e.name,o)}))},0===this.watchers.size&&window.cookieStore.addEventListener("change",this.listener);if(this.watchers.get(e))throw new Error(`A listener already exists for the cookie: ${e}`);{const n=this.getCookie(e);this.watchers.set(e,{value:n,callback:t,options:o}),t({name:e,value:n,type:null!==n?"existing":"missing"}),null!==n&&o?.untilReady&&this.unwatch(e)}},unwatch(e){"undefined"!=typeof window&&this.watchers.has(e)&&(console.log("REMOVING LISTENER FOR COOKIE",e),this.watchers.delete(e),0===this.watchers.size&&(console.log("REMOVE GLOBAL LISTENER "),window.cookieStore.removeEventListener("change",this.listener)))}};return{watch:l.watch.bind(l),unwatch:l.unwatch.bind(l)}}();
