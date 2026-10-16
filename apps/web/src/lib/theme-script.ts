/** Runs in <head> before first paint. Stored choice wins, then the system setting, then dark. */
export const themeScript = `(function(){var s=null;try{s=localStorage.getItem('zk-theme');}catch(e){}var t=s;if(t!=='light'&&t!=='dark'){try{t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}catch(e){t='dark';}}document.documentElement.dataset.theme=t;})();`;
