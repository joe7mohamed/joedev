/**
 * Runs in <head> before first paint. Stored choice wins, then the system setting, then dark.
 * It also adds `intro` when motion is allowed, so the hero's one-shot build starts with the first paint instead of
 * restarting when the app takes over. Those animations only fill backwards: they end visible without any script.
 */
export const themeScript = `(function(){var d=document.documentElement,s=null;try{s=localStorage.getItem('zk-theme');}catch(e){}var t=s;if(t!=='light'&&t!=='dark'){try{t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}catch(e){t='dark';}}d.dataset.theme=t;try{if(matchMedia('(prefers-reduced-motion: no-preference)').matches)d.classList.add('intro');}catch(e){}})();`;
