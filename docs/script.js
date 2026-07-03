function toggleLang() {
  const btn = document.getElementById('lang-toggle');
  if (document.body.classList.toggle('lang-pt')) {
    document.documentElement.lang = 'pt-BR';
    btn.textContent = '🇺🇸 English';
  } else {
    document.documentElement.lang = 'en';
    btn.textContent = '🇧🇷 Português';
  }
}
