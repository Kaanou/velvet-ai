/* Safari-safe reference-image adapter.
   The browser never fetches the reference image itself.
   Pollinations fetches the public reference URL server-side. */
(() => {
  const nativeFetch=window.fetch.bind(window);
  window.fetch=async function(input,init){
    try{
      const u=typeof input==='string'?input:(input&&input.url)||'';
      if(u.includes('/v1/images/edits') && init?.method==='POST'){
        let body=null;
        if(typeof init.body==='string') body=JSON.parse(init.body);
        const ref=body?.images?.[0]?.image_url;
        if(ref){
          const model=body.model||'kontext';
          const dims=String(body.size||'768x1024').split('x');
          const prompt=body.prompt||'Create a new photorealistic portrait using the reference image.';
          const key=(typeof PUBLIC_POLLINATIONS_KEY!=='undefined')?PUBLIC_POLLINATIONS_KEY:'';
          const editUrl='https://gen.pollinations.ai/image/'+encodeURIComponent(prompt)
            +'?model='+encodeURIComponent(model)
            +'&image='+encodeURIComponent(ref)
            +'&width='+encodeURIComponent(dims[0]||768)
            +'&height='+encodeURIComponent(dims[1]||1024)
            +'&nologo=true'
            +(key?'&key='+encodeURIComponent(key):'');
          return nativeFetch(editUrl,{method:'GET'});
        }
      }
    }catch(e){console.warn('Velvet image adapter:',e);}
    return nativeFetch(input,init);
  };
})();
