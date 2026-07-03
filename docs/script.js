function setLang(pt, save) {
  const btn = document.getElementById('lang-toggle');
  if (pt) {
    document.body.classList.add('lang-pt');
    document.documentElement.lang = 'pt-BR';
    btn.textContent = '🇺🇸 English';
  } else {
    document.body.classList.remove('lang-pt');
    document.documentElement.lang = 'en';
    btn.textContent = '🇧🇷 Português';
  }
  if (save) localStorage.setItem('lang', pt ? 'pt' : 'en');
}

function toggleLang() {
  setLang(!document.body.classList.contains('lang-pt'), true);
}

(function initLang() {
  const saved = localStorage.getItem('lang');
  if (saved) {
    setLang(saved === 'pt', false);
  } else {
    const browserLang = navigator.language || navigator.userLanguage || '';
    setLang(browserLang.toLowerCase().startsWith('pt'), false);
  }
})();
