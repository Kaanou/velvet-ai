/* Velvet AI — single media engine
   One path: profile reference -> image -> video.
   Keep the UI simple; the existing page provides current/girls/history/save/renderMessages.
*/
(() => {
  const CFG = {
    key: 'velvet-pollinations-key',
    model: 'velvet-image-model',
    video: 'velvet-video-model',
    size: 'velvet-image-size',
    levelPrefix: 'velvet-level-'
  };

  // Static GitHub Pages fallback. Prefer a server-side secret in production.
  const PUBLIC_KEY = 'sk_rs1x2fKZLGIFyEcatpez9OG5yGJayAKz';
  const apiKey = () => PUBLIC_KEY.startsWith('sk_') ? PUBLIC_KEY : (localStorage.getItem(CFG.key) || '');

  const imageModel = () => localStorage.getItem(CFG.model) || 'kontext';
  const videoModel = () => localStorage.getItem(CFG.video) || 'alibaba/wan-2.2-fast';
  const size = () => localStorage.getItem(CFG.size) || '768x1024';

  const currentGirl = () =>
    (typeof current !== 'undefined' && current !== null && typeof girls !== 'undefined')
      ? girls[current] : null;

  const level = g => localStorage.getItem(CFG.levelPrefix + g.id) || 'adulte';

  function addResult(g, item) {
    history[g.id] = history[g.id] || [];
    history[g.id].push(item);
    save();
    renderMessages();
  }

  function fail(g, kind, e) {
    removeTyping();
    addResult(g, {role:'ai', text:'Erreur '+kind+': '+(e?.message || 'indisponible')});
  }

  function promptFor(g, userPrompt, kind) {
    const lvl = level(g);
    const intensity = {
      soft: 'casual and natural',
      flirt: 'playful and flirty',
      sensuel: 'sensual and elegant',
      seducteur: 'very seductive and glamorous',
      adulte: 'bold adult boudoir mood, provocative but non-explicit'
    }[lvl] || 'sensual and elegant';

    const base =
      'Photorealistic smartphone photo/video of the SAME fictional adult woman '+g.name+
      ', age '+g.age+'. Preserve the exact recognizable face from the supplied profile reference: same eyes, eyebrows, nose, lips, jawline, face proportions, skin tone, hair and apparent age. '+
      'Do not invent a different person. Realistic skin texture, natural imperfections, believable hands and anatomy, authentic phone-camera optics, natural lighting, no illustration, no CGI, no beauty-filter look. '+
      intensity+'. ';

    const variants = [
      'candid selfie at home',
      'mirror selfie before going out',
      'hotel-room selfie while getting ready',
      'sunset balcony selfie',
      'beach vacation selfie',
      'night city selfie under ambient lights',
      'cozy bedroom selfie in morning light',
      'café selfie during a weekend outing',
      'post-workout selfie in realistic sportswear',
      'elegant evening outfit at a restaurant',
      'rainy street selfie at night',
      'bathroom mirror selfie wearing a robe'
    ];
    const variant = variants[Math.floor(Math.random()*variants.length)];

    let extra = '';
    const q = String(userPrompt || '').toLowerCase();
    if (/miroir|mirror/.test(q)) extra += ' realistic mirror reflection and phone visible.';
    if (/plage|mer|beach/.test(q)) extra += ' natural beach vacation atmosphere.';
    if (/nuit|soir|night/.test(q)) extra += ' cinematic night ambience.';
    if (/hôtel|hotel/.test(q)) extra += ' realistic hotel room.';
    if (/sport|gym|fitness/.test(q)) extra += ' realistic sportswear and athletic setting.';
    if (/robe|dress/.test(q)) extra += ' elegant fitted dress.';
    if (/lingerie|soutien|culotte/.test(q)) extra += ' tasteful non-explicit lingerie styling.';
    if (/plein pied|full body|jambes/.test(q)) extra += ' three-quarter or full-body framing with natural proportions.';

    return base + (kind === 'video'
      ? 'Short realistic vertical video with subtle natural movement, breathing, blinking, hair and clothing motion. '
      : '') +
      variant + '. ' + (userPrompt || (kind === 'video' ? 'spontaneous short selfie video' : 'spontaneous realistic selfie')) +
      '.' + extra +
      ' Keep the identity fixed. Change only pose, expression, clothing, framing, lighting and environment. No random replacement person, no face morphing, no distorted anatomy, no explicit sexual acts.';
  }

  async function responseBlob(r, expected) {
    if (!r.ok) {
      const raw = await r.text().catch(()=>'');
      let msg = '';
      try { msg = JSON.parse(raw)?.error?.message || ''; } catch {}
      if (r.status === 401) throw Error('clé API invalide ou refusée');
      if (r.status === 402) throw Error('budget Pollen insuffisant');
      throw Error('HTTP '+r.status+(msg ? ' — '+msg : ''));
    }
    const blob = await r.blob();
    if (!blob.type.startsWith(expected)) throw Error('réponse '+expected+' invalide');
    return URL.createObjectURL(blob);
  }

  async function generateImage(g, prompt) {
    if (!g?.photo) throw Error('photo de profil absente');
    const dims = size().split('x');
    const params = new URLSearchParams({
      model: imageModel(),
      width: dims[0] || '768',
      height: dims[1] || '1024',
      nologo: 'true',
      image: g.photo
    });
    const url = 'https://gen.pollinations.ai/image/'+encodeURIComponent(prompt)+'?'+params;
    const r = await fetch(url, {headers:{Authorization:'Bearer '+apiKey()}});
    return responseBlob(r, 'image/');
  }

  async function generateVideo(g, prompt) {
    if (!g?.photo) throw Error('photo de profil absente');
    const params = new URLSearchParams({
      model: videoModel(),
      duration: '4',
      aspectRatio: '9:16',
      'image[0]': g.photo
    });
    const url = 'https://gen.pollinations.ai/video/'+encodeURIComponent(prompt)+'?'+params;
    const r = await fetch(url, {headers:{Authorization:'Bearer '+apiKey()}});
    return responseBlob(r, 'video/');
  }

  window.generatePhoto = async function(userPrompt='') {
    const g = currentGirl();
    if (!g) return;
    if (!apiKey()) return window.openAI?.('Clé IA manquante.');
    addTyping();
    try {
      const src = await generateImage(g, promptFor(g, userPrompt, 'image'));
      removeTyping();
      addResult(g, {role:'ai', text:'📷', image:src});
    } catch(e) { fail(g, 'photo', e); }
  };

  window.generateVideo = async function(userPrompt='') {
    const g = currentGirl();
    if (!g) return;
    if (!apiKey()) return window.openAI?.('Clé IA manquante.');
    addTyping();
    try {
      const src = await generateVideo(g, promptFor(g, userPrompt, 'video'));
      removeTyping();
      addResult(g, {role:'ai', text:'🎥', video:src});
    } catch(e) { fail(g, 'vidéo', e); }
  };

  // Gallery = four variations, using the exact same single image path.
  window.generateGallery = async function() {
    const g = currentGirl();
    const grid = document.getElementById('galleryGrid');
    if (!g || !grid) return;
    grid.innerHTML = '<div style="color:#aaa;padding:20px">Génération…</div>';
    try {
      const prompts = ['selfie naturel','miroir avant de sortir','soirée élégante','week-end à la plage'];
      const urls = await Promise.all(prompts.map(p => generateImage(g, promptFor(g,p,'image'))));
      grid.innerHTML = urls.map((u,i) =>
        '<div style="margin-bottom:12px"><img src="'+u+'" alt="Photo '+(i+1)+'" style="width:100%;border-radius:14px;display:block"><div style="color:#aaa;font-size:11px;margin-top:5px">Photo '+(i+1)+'</div></div>'
      ).join('');
    } catch(e) {
      grid.innerHTML = '<div style="color:#f88;padding:20px">Erreur : '+String(e.message||e)+'</div>';
    }
  };

  // Tiny IA status button. No modal, no duplicate settings engine.
  function installStatus() {
    let b = document.getElementById('aiKeyButton');
    if (!b) {
      b = document.createElement('button');
      b.id='aiKeyButton';
      b.textContent='🧠 IA';
      b.style.cssText='position:fixed;right:12px;top:calc(12px + env(safe-area-inset-top));z-index:9999;border:1px solid #302b2d;background:#151314;color:#eee;border-radius:12px;padding:8px 10px;font-weight:800;';
      document.body.appendChild(b);
    }
    b.title = 'IA prête — photo et vidéo';
    b.onclick = async () => {
      b.textContent='IA…';
      try {
        const r=await fetch('https://gen.pollinations.ai/image/test?model=kontext&width=64&height=64&nologo=true',{headers:{Authorization:'Bearer '+apiKey()}});
        b.textContent=r.ok?'🧠 IA ✓':'🧠 IA ✕';
      } catch { b.textContent='🧠 IA ✕'; }
      setTimeout(()=>b.textContent='🧠 IA',1600);
    };
  }

  function installSimpleSettings() {
    const settings=document.getElementById('settings');
    if (!settings || document.getElementById('velvet-simple-ai')) return;
    const box=document.createElement('div');
    box.id='velvet-simple-ai';
    box.style.cssText='margin:8px 0;padding:10px 0;border-top:1px solid #302b2d;border-bottom:1px solid #302b2d';
    box.innerHTML =
      '<div style="font-size:11px;color:#aaa;font-weight:800;margin-bottom:7px">IA · Photo & Vidéo</div>'+
      '<select id="vx-model" style="width:100%;margin:4px 0;background:#1b191a;color:#ddd;border:1px solid #383235;border-radius:8px;padding:8px">'+
      '<option value="kontext">Kontext · référence visage</option><option value="flux">Flux · photo</option></select>'+
      '<select id="vx-video" style="width:100%;margin:4px 0;background:#1b191a;color:#ddd;border:1px solid #383235;border-radius:8px;padding:8px">'+
      '<option value="alibaba/wan-2.2-fast">Wan 2.2 Fast · vidéo</option><option value="google/veo-3.1-fast">Veo 3.1 Fast · vidéo</option></select>'+
      '<div style="font-size:10px;color:#777;margin-top:6px">La photo du profil est utilisée automatiquement comme référence.</div>';
    settings.insertBefore(box,settings.firstChild);
    box.querySelector('#vx-model').value=imageModel();
    box.querySelector('#vx-video').value=videoModel();
    box.querySelector('#vx-model').onchange=e=>localStorage.setItem(CFG.model,e.target.value);
    box.querySelector('#vx-video').onchange=e=>localStorage.setItem(CFG.video,e.target.value);
  }

  const oldToggle=window.toggleSettings;
  window.toggleSettings=function(){
    if(typeof oldToggle==='function') oldToggle();
    setTimeout(installSimpleSettings,30);
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>{installStatus();installSimpleSettings();});
  else { installStatus(); installSimpleSettings(); }
})();
/* VELVET_GALLERY_UI_LOADER */
(function(){var s=document.createElement("script");s.src="./gallery.js";s.onload=function(){var u=document.createElement("script");u.src="./gallery-ui.js";document.body.appendChild(u)};document.head.appendChild(s)})();
