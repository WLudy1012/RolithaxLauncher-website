try {
  var savedTheme = localStorage.getItem('rolithax-theme');
  document.documentElement.dataset.theme = savedTheme === 'dark' || (savedTheme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
} catch (_) {}
