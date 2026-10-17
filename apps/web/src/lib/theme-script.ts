/**
 * Runs in <head> before first paint. Stored choice wins, then the system setting, then dark.
 * It also adds `intro` when motion is allowed, so the hero's one-shot build starts with the first paint instead of
 * restarting when the app takes over. Those animations only fill backwards: they end visible without any script.
 * On the first visit of the session (and only when motion is allowed) it adds `loading`, which shows the loading
 * screen above the page and holds the hero build; storage that cannot be read counts as seen. It marks the loader
 * seen for the session at once, so it never shows twice, even when the app arrives late or never. The same branch
 * removes `loading` after 6 s, so even if no app script ever runs the overlay goes and the page underneath, which
 * was readable the whole time, builds and stays.
 */
export const themeScript = `(function(){var d=document.documentElement,s=null;try{s=localStorage.getItem('zk-theme');}catch(e){}var t=s;if(t!=='light'&&t!=='dark'){try{t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}catch(e){t='dark';}}d.dataset.theme=t;try{if(matchMedia('(prefers-reduced-motion: no-preference)').matches){d.classList.add('intro');var v=true;try{v=!!sessionStorage.getItem('zk-intro');}catch(e){}if(!v){d.classList.add('loading');try{sessionStorage.setItem('zk-intro','1');}catch(e){}setTimeout(function(){d.classList.remove('loading')},6000);}}}catch(e){}})();`;
