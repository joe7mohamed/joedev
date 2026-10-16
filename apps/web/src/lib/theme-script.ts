/** Runs in <head> before first paint. Stored choice wins, then the system setting, then dark. */
export const themeScript = `(function(){try{var s=localStorage.getItem('zk-theme');var t=s==='light'||s==='dark'?s:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`;
