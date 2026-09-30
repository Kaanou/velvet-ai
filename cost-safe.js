(() => {
  // Keep default image generation inside a small Pollen balance.
  // User can still choose another size manually in Settings.
  if (!localStorage.getItem('velvet-image-size')) {
    localStorage.setItem('velvet-image-size','512x768');
  }
})();