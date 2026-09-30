/* Velvet Safari image-edit compatibility layer */
(() => {
  const nativeFetch = window.fetch.bind(window);

  function bytesToBase64(bytes) {
    let out = '';
    const step = 0x8000;
    for (let i = 0; i < bytes.length; i += step) {
      out += String.fromCharCode(...bytes.subarray(i, i + step));
    }
    return btoa(out);
  }

  window.fetch = async function(input, init) {
    try {
      const reqUrl = typeof input === 'string' ? input : input?.url || '';
      if (reqUrl.includes('/v1/images/edits') && init?.method === 'POST' &&
          typeof init.body === 'string' && init.body.trim().startsWith('{')) {
        const body = JSON.parse(init.body);
        const ref = body?.images?.[0]?.image_url;
        if (ref) {
          const model = body.model || 'kontext';
          const size = String(body.size || '768x1024').split('x');
          const editUrl =
            'https://gen.pollinations.ai/image/' + encodeURIComponent(body.prompt || 'Create a new photo') +
            '?model=' + encodeURIComponent(model) +
            '&image=' + encodeURIComponent(ref) +
            '&width=' + encodeURIComponent(size[0] || '768') +
            '&height=' + encodeURIComponent(size[1] || '1024') +
            '&nologo=true';

          const headers = new Headers(init.headers || {});
          const r = await nativeFetch(editUrl, { method: 'GET', headers });
          if (!r.ok) return r;

          const blob = await r.blob();
          if (!blob.type.startsWith('image/')) return r;

          const bytes = new Uint8Array(await blob.arrayBuffer());
          const b64 = bytesToBase64(bytes);
          return new Response(JSON.stringify({
            data: [{ b64_json: b64 }]
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    } catch (e) {
      console.warn('Velvet image compatibility:', e);
    }
    return nativeFetch(input, init);
  };
})();
