/* Velvet AI runtime routing override: chat -> Grok, images -> FLUX. */
(() => {
  if (window.__velvetRoutingOverride) return;
  window.__velvetRoutingOverride = true;
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init = {}) => {
    const url = typeof input === 'string' ? input : (input?.url || '');
    if (url.includes('/v1/chat/completions') && init.body) {
      try {
        const body = JSON.parse(init.body);
        body.model = 'x-ai/grok-4.20';
        init = {...init, body: JSON.stringify(body)};
      } catch (_) {}
    }
    if (url.includes('/v1/images/generations') && init.body) {
      try {
        const body = JSON.parse(init.body);
        body.model = 'flux';
        init = {...init, body: JSON.stringify(body)};
      } catch (_) {}
    }
    return nativeFetch(input, init);
  };
})();
