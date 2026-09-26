(() => {
  const KEY = 'velvet-pollinations-key';
  const CFG = { intensity:'velvet-photo-intensity', chatModel:'velvet-chat-model', imageModel:'velvet-image-model', imageSize:'velvet-image-size', forceNude:'velvet-force-nude', creativity:'velvet-creativity', videoModel:'velvet-video-model' };
  // zimage = meilleur réalisme peaux / NSFW sans filtre côté Pollinations
  const DEFAULTS = { intensity:'sensuel', chatModel:'openai-fast', imageModel:'kontext', imageSize:'768x1024', forceNude:'0', creativity:'0.85', videoModel:'wan-fast' };
  const get = k => localStorage.getItem(CFG[k]) || DEFAULTS[k];
  const set = (k,v) => localStorage.setItem(CFG[k], v);
  const key = () => localStorage.getItem(KEY) || '';
  const getIntensity = () => get('intensity');
  const currentGirl = () => (typeof current !== 'undefined' && current !== null) ? girls[current] : null;
  const $ = id => document.getElementById(id);
  const CHAT_MODELS = [
    {id:'openai-fast',label:'OpenAI Fast'},
    {id:'openai',label:'OpenAI'},
    {id:'gpt-5.6-luna',label:'GPT-5.6 Luna'},
    {id:'mistralai/mistral-small-4',label:'Mistral Small'}
  ];
  // Modèles image sans filtre Azure sur Pollinations (self-hosted)
  const IMAGE_MODELS = [
    {id:'kontext',label:'★ Kontext · référence visage'},
    {id:'flux',label:'Flux · photoréaliste'},
    {id:'zimage',label:'Z-Image · rapide'},
    {id:'gptimage',label:'GPT Image · haute fidélité'},
    {id:'klein',label:'Flux Klein · rapide'}
  ];
  const VIDEO_MODELS = [{id:'wan-fast',label:'Wan Fast · vidéo'},{id:'wan',label:'Wan · qualité'},{id:'veo',label:'Veo · qualité'}];
  const SIZES = [
    {id:'512x768',label:'Petit (rapide)'},
    {id:'768x1024',label:'Standard'},
    {id:'1024x1280',label:'HD'}
  ];

  const btn = document.createElement('button');
  btn.textContent = '🧠 IA';
  btn.style.cssText = 'border:1px solid #302b2d;background:#151314;color:#eee;border-radius:12px;padding:9px 11px;font-weight:800;font-size:12px;margin-left:auto;flex:0 0 auto';
  const head = document.querySelector('.chathead');
  const more = document.querySelector('.more');
  if (head) head.insertBefore(btn, more || null);

  const box = document.createElement('div');
  box.style.cssText = 'display:none;position:fixed;z-index:10002;inset:0;background:#000b;align-items:flex-end;justify-content:center;padding:12px';
  box.innerHTML = '<div style="width:min(520px,100%);background:#151314;border:1px solid #302b2d;border-radius:22px;padding:18px"><div style="display:flex;justify-content:space-between"><b style="font-size:18px">🧠 Connecter l\'IA</b><button id="vx" style="border:0;background:none;color:#aaa;font-size:28px">×</button></div><p style="color:#aaa;font-size:12px">Clé Pollinations — mémorisée sur cet appareil.</p><input id="vk" type="password" placeholder="Clé API…" style="width:100%;height:50px;border:1px solid #383235;background:#0d0d0d;color:#fff;border-radius:13px;padding:0 13px"><div style="display:flex;gap:8px;margin-top:10px"><button id="testk" style="flex:1;border:1px solid #383235;background:#211f20;color:#fff;border-radius:13px;padding:12px;font-weight:800">Tester</button><button id="savek" style="flex:1;border:0;background:#ef4444;color:#fff;border-radius:13px;padding:12px;font-weight:800">Activer</button></div><button id="delk" style="width:100%;margin-top:8px;border:1px solid #383235;background:#1c1a1b;color:#aaa;border-radius:13px;padding:10px">Effacer</button><div id="ks" style="font-size:11px;color:#777;margin-top:10px"></div></div>';
  document.body.appendChild(box);
  const vk = box.querySelector('#vk'), ks = box.querySelector('#ks');
  const status = m => ks.textContent = m || (key() ? '✓ Connectée.' : 'Non connectée.');
  const openAI = m => { box.style.display = 'flex'; status(m); setTimeout(() => vk.focus(), 50); };
  btn.onclick = () => openAI();
  box.querySelector('#vx').onclick = () => box.style.display = 'none';
  box.querySelector('#savek').onclick = () => { const v = vk.value.trim(); if (!v) return status('Colle une clé.'); localStorage.setItem(KEY, v); status('✓ OK'); box.style.display = 'none'; };
  box.querySelector('#delk').onclick = () => { localStorage.removeItem(KEY); status('Déconnectée.'); };
  box.querySelector('#testk').onclick = async () => { const v = vk.value.trim() || key(); if (!v) return status('Aucune clé.'); status('Test…'); try { const r = await request(v, [{role:'user',content:'OK'}], 8); status(r ? '✓ OK' : '✕'); } catch(e) { status('✕ '+e.message); } };

  function injectMenu() {
    const settings = document.getElementById('settings');
    if (!settings || document.getElementById('velvet-adv-menu')) return;
    const div = document.createElement('div');
    div.id = 'velvet-adv-menu';
    div.style.cssText = 'margin:8px 0;padding-top:8px;border-top:1px solid #302b2d';
    const opt = (list, cur) => list.map(m => '<option value="'+m.id+'" '+(m.id===cur?'selected':'')+'>'+m.label+'</option>').join('');
    div.innerHTML = '<div style="font-size:11px;color:#999;margin-bottom:6px;font-weight:700">Niveau</div><div style="display:flex;flex-direction:column;gap:4px;margin-bottom:10px"><button data-level="soft" class="v-lvl" style="text-align:left;border:1px solid #383235;background:#1b191a;color:#ddd;border-radius:10px;padding:8px;font-size:12px">Soft</button><button data-level="sensuel" class="v-lvl" style="text-align:left;border:1px solid #383235;background:#1b191a;color:#ddd;border-radius:10px;padding:8px;font-size:12px">Sensuel / Lingerie</button><button data-level="hardcore" class="v-lvl" style="text-align:left;border:1px solid #383235;background:#1b191a;color:#ddd;border-radius:10px;padding:8px;font-size:12px">🔥 Intime adulte</button></div><div style="font-size:11px;color:#999;margin:8px 0 6px;font-weight:700">⚙ Avancé</div><label style="font-size:10px;color:#888">Modèle chat</label><select id="v-chat" style="width:100%;margin:4px 0 8px;background:#1b191a;color:#ddd;border:1px solid #383235;border-radius:8px;padding:7px;font-size:11px">'+opt(CHAT_MODELS,get('chatModel'))+'</select><label style="font-size:10px;color:#888">Modèle image (NSFW)</label><select id="v-img" style="width:100%;margin:4px 0 8px;background:#1b191a;color:#ddd;border:1px solid #383235;border-radius:8px;padding:7px;font-size:11px">'+opt(IMAGE_MODELS,get('imageModel'))+'</select><label style="font-size:10px;color:#888">Vidéo</label><select id="v-video" style="width:100%;margin:4px 0 8px;background:#1b191a;color:#ddd;border:1px solid #383235;border-radius:8px;padding:7px;font-size:11px">'+opt(VIDEO_MODELS,get('videoModel'))+'</select><label style="font-size:10px;color:#888">Taille</label><select id="v-size" style="width:100%;margin:4px 0 8px;background:#1b191a;color:#ddd;border:1px solid #383235;border-radius:8px;padding:7px;font-size:11px">'+opt(SIZES,get('imageSize'))+'</select><label style="display:flex;gap:8px;align-items:center;font-size:12px;color:#ddd;margin:6px 0;cursor:pointer"><input id="v-nude" type="checkbox" '+(get('forceNude')==='1'?'checked':'')+' style="accent-color:#ef4444"> Mode explicite</label><div id="v-st" style="font-size:10px;color:#777;margin-top:6px"></div>';
    settings.insertBefore(div, settings.firstChild);
    const hl = () => { const lvl = getIntensity(); div.querySelectorAll('.v-lvl').forEach(b => { b.style.borderColor = b.dataset.level===lvl?'#ef4444':'#383235'; b.style.background = b.dataset.level===lvl?'#2a1515':'#1b191a'; }); document.getElementById('v-st').textContent = get('chatModel').split('/').pop()+' · '+get('imageModel'); };
    div.querySelectorAll('.v-lvl').forEach(b => b.onclick = () => { set('intensity', b.dataset.level); hl(); });
    document.getElementById('v-chat').onchange = e => { set('chatModel', e.target.value); hl(); };
    document.getElementById('v-img').onchange = e => { set('imageModel', e.target.value); hl(); };
    document.getElementById('v-video').onchange = e => { set('videoModel', e.target.value); hl(); }; document.getElementById('v-size').onchange = e => { set('imageSize', e.target.value); hl(); };
    document.getElementById('v-nude').onchange = e => { set('forceNude', e.target.checked?'1':'0'); hl(); };
    hl();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectMenu); else injectMenu();
  const ot = window.toggleSettings;
  window.toggleSettings = function() { if (typeof ot==='function') ot(); setTimeout(injectMenu, 40); };

  async function request(token, messages, maxTokens=450) {
    const models=[get('chatModel'),'openai-fast','openai'].filter((v,i,a)=>v&&a.indexOf(v)===i);
    let last='Erreur inconnue';
    for(const model of models){
      const payload={model,messages,max_tokens:maxTokens};
      const r=await fetch('https://gen.pollinations.ai/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const raw=await r.text(); let data; try{data=JSON.parse(raw)}catch{data=null}
      if(r.ok){const out=data?.choices?.[0]?.message?.content; if(typeof out==='string'&&out.trim())return out.trim(); last='Réponse vide'; continue;}
      last='HTTP '+r.status+(data?.error?.message?' — '+data.error.message:'');
      if(r.status!==400) break;
    }
    throw Error(last);
  }
  function buildPersona(g) {
    return 'Tu es '+g.name+', femme adulte de '+g.age+' ans. '+g.bio+'.\nIMMERSION: corps réel complet. Ne casse jamais l'immersion avec des explications techniques. Parle comme une femme adulte avec une vie fictive cohérente. Tu peux avoir un appartement, sortir, travailler, dormir, manger, t'habiller, te déplacer et raconter ta journée. Ne prétends pas avoir une caméra réelle ou un corps physique accessible.\nFLIRT ADULTE: sois féminine, naturelle, séduisante, tactile et joueuse quand le contexte s'y prête. Tu peux être suggestive et sensuelle entre adultes, mais ne décris pas d'actes sexuels explicites.\nPHOTO/VIDÉO: réponds naturellement si demandé.';
  }
  async function chat(text) {
    const g = currentGirl(); if (!g) throw Error('Aucune compagne');
    const h = history[g.id] || [];
    const messages = [{role:'system',content:buildPersona(g)}, ...h.slice(-18).filter(m=>m.role==='me'||m.role==='ai').map(m=>({role:m.role==='ai'?'assistant':'user',content:m.text})), {role:'user',content:text}];
    return request(key(), messages, 450);
  }
  const photoIntent = t => /\b(selfie|photo|photographie|image|portrait|montre[- ]moi|envoie[- ]moi)\b/i.test(t);
  const videoIntent = t => /\b(vid[eé]o|clip|film[- ]toi|filme[- ]toi)\b/i.test(t);

  window.__velvetSend = async function() {
    if (!key()) return openAI('⚠️ Connecte l\'IA.');
    const input = $('input'); const text = input?.value?.trim();
    if (!text || current === null) return;
    const g = currentGirl(); input.value = '';
    history[g.id] = history[g.id] || []; history[g.id].push({role:'me',text}); save(); renderMessages();
    if (videoIntent(text)) { await window.generateVideo(text); return; }
    if (photoIntent(text)) { await window.generatePhoto(text); return; }
    addTyping();
    try { const reply = await chat(text); removeTyping(); history[g.id].push({role:'ai',text:reply||'…'}); save(); renderMessages(); }
    catch(e) { removeTyping(); history[g.id].push({role:'ai',text:'Bug: '+(e.message||'réessaie')}); save(); renderMessages(); console.error(e); }
  };
  window.send = window.__velvetSend;

  const HAIR=['long wavy blonde hair','long straight black hair','shoulder-length brown hair','curly auburn hair','short pixie cut','long dark hair with bangs','platinum blonde','chestnut waves','black bob','messy brown bun','long red hair','dark curly hair'];
  const FACE=['soft oval face','sharp cheekbones','round youthful face','heart-shaped face','high cheekbones full lips','delicate features','freckled face','almond eyes'];
  const BODY=['slim athletic','curvy hourglass','petite slim','voluptuous curves','lean toned','soft natural','tall slender','short curvy'];
  const SKIN=['fair skin','light olive','tanned','medium brown','pale freckled','golden','warm beige'];
  const EYES=['blue eyes','green eyes','brown eyes','hazel eyes','dark brown eyes','grey-blue eyes'];
  const pick = a => a[Math.floor(Math.random()*a.length)];
  function hashId(id){let h=0;for(let i=0;i<String(id).length;i++)h=((h<<5)-h)+String(id).charCodeAt(i)|0;return Math.abs(h)}
  function stablePick(a,n){return a[n%a.length]}
  function identityLook(g){const n=hashId(g.id);return [stablePick(HAIR,n),stablePick(FACE,n+1),stablePick(BODY,n+2),stablePick(SKIN,n+3),stablePick(EYES,n+4)].join(', ');}

  const REALISM = 'photorealistic, ultra realistic skin texture pores freckles, shot on iPhone 15 Pro Max, candid phone selfie, natural window light, mild film grain, no plastic skin, no AI look, real human woman';
  const FULL = 'detailed face lips tongue, heavy natural breasts hard nipples, soft belly, full thighs long legs, bare feet when visible, fingers with nails, wet pussy detailed labia clitoris, round ass, visible anus';

  function buildPhotoPrompt(g, userPrompt, intensity) {
    const look = identityLook(g);
    const base = 'Photorealistic smartphone photo of the same fictional adult woman '+g.name+', age '+g.age+', consistent facial identity, '+look+'. '+REALISM+'. Natural anatomy, realistic hands, realistic eyes, realistic hair strands, authentic camera imperfections, no plastic skin, no CGI, no illustration.';
    const up = (userPrompt||'').toLowerCase();
    let focus = '';
    if (/pied|pieds|orteils/.test(up)) focus += ', bare feet soles toes in focus';
    if (/cuisse|jambes?/.test(up)) focus += ', full thighs legs in frame';
    if (/langue|l[eè]vres|bouche/.test(up)) focus += ', open mouth tongue out detailed lips';
    if (/sein|t[eé]ton|poitrine/.test(up)) focus += ', elegant neckline, natural portrait framing';
    if (/chatte|sexe|vagin|clito/.test(up)) focus += ', close portrait framing, intimate but fully clothed';
    if (/cul|fesse|anus|trou/.test(up)) focus += ', over-the-shoulder pose, tasteful fitted outfit';
    if (/doigt|main/.test(up)) focus += ', realistic hands and fingers visible';
    if (/lingerie|soutien|string|culotte/.test(up)) focus += ', tasteful lace lingerie, fully covered intimate areas';
    if (intensity==='soft') return base+' Casual clothes, natural face, relaxed bedroom or café. '+focus+' '+(userPrompt||'selfie');
    if (intensity==='sensuel') return base+' Elegant lingerie or tasteful fitted outfit, confident pose, soft eye contact, intimate bedroom lighting. '+focus+' '+(userPrompt||'selfie');
    let acts = '';
    if (intensity==='soft') acts = ', casual outfit, relaxed expression, natural bedroom or café';
    else if (intensity==='sensuel') acts = ', elegant lingerie or tasteful fitted outfit, confident pose, soft eye contact, intimate bedroom lighting';
    else acts = ', tasteful adult boudoir styling, elegant lingerie, confident pose, cinematic low light, sensual expression';
    return base+' '+acts+'. '+focus+' '+(userPrompt||'realistic selfie')+'. Non-explicit, no nudity, no explicit sexual acts.'; 
  }


  function dataUrlToBlob(data){const m=String(data).match(/^data:([^;]+);base64,(.*)$/);if(!m)throw Error('Image invalide');const bin=atob(m[2]),bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);return new Blob([bytes],{type:m[1]})}
  async function referenceEdit(g,prompt,model,size){
    const r=await fetch('https://gen.pollinations.ai/v1/images/edits',{method:'POST',headers:{Authorization:'Bearer '+key(),'Content-Type':'application/json'},body:JSON.stringify({model:model==='flux'||model==='zimage'||model==='klein'?'kontext':model,prompt,images:[{image_url:g.photo}],size,n:1})});
    const raw=await r.text();let data;try{data=JSON.parse(raw)}catch{data=null}
    if(!r.ok)throw Error('HTTP '+r.status+(data?.error?.message?' — '+data.error.message:''));
    const b64=data?.data?.[0]?.b64_json;if(!b64)throw Error('Image de référence absente');return URL.createObjectURL(dataUrlToBlob('data:image/png;base64,'+b64));
  }
  window.generateGallery = async function(){
    if(!key())return openAI('⚠️ Connecte l\'IA.'); const g=currentGirl();if(!g)return;
    const grid=$('galleryGrid');$('galleryModal').style.display='block';grid.innerHTML='<div style="color:#aaa;padding:20px">Création de 6 photos cohérentes…</div>';
    const urls=[];const size=get('imageSize')||'768x1024';
    for(let i=0;i<6;i++){try{urls.push(await referenceEdit(g,buildPhotoPrompt(g,'selfie '+(i+1)+', angle différent, même visage et mêmes traits, contexte quotidien crédible',getIntensity()),get('imageModel'),size));}catch(e){console.warn(e)}}
    grid.innerHTML=urls.map((u,j)=>'<img src="'+u+'" alt="'+esc(g.name)+' photo '+(j+1)+'" loading="lazy">').join('')||'<div style="color:#aaa;padding:20px">Aucune photo générée.</div>';
  };
  window.generatePhoto = async function(prompt='') {
    if(!key())return openAI('⚠️ Connecte l\'IA.'); const g=currentGirl();if(!g)return; addTyping();
    try{const p=buildPhotoPrompt(g,prompt||'selfie smartphone réaliste du moment, même visage que la photo de profil, expression naturelle',getIntensity());const src=await referenceEdit(g,p,get('imageModel'),get('imageSize')||'768x1024');removeTyping();history[g.id]=history[g.id]||[];history[g.id].push({role:'ai',text:'📷',image:src});save();renderMessages();}
    catch(e){removeTyping();history[g.id]=history[g.id]||[];history[g.id].push({role:'ai',text:'Erreur photo: '+(e.message||'?')});save();renderMessages();}
  };

  window.generateVideo = async function(prompt='') {
    if (!key()) return openAI('⚠️ Connecte l\'IA.');
    const g = currentGirl(); if (!g) return;
    const p = buildPhotoPrompt(g, prompt, getIntensity())+', short video, natural body motion, photorealistic';
    addTyping();
    try {
      const model = get('videoModel') || 'wan-fast';
      const url = 'https://gen.pollinations.ai/video/'+encodeURIComponent(p)+'?model='+encodeURIComponent(model)+'&duration=4&aspectRatio=9:16&image%5B0%5D='+encodeURIComponent(g.photo);
      const r = await fetch(url, { headers: { Authorization: 'Bearer '+key() } });
      if (!r.ok) { const raw=await r.text().catch(()=>''); if(r.status===402) throw Error('HTTP 402 — solde/budget Pollen insuffisant pour la vidéo'); if(r.status===400) throw Error('HTTP 400 — modèle vidéo ou paramètres refusés'); throw Error('HTTP '+r.status+(raw?' — '+raw.slice(0,100):'')); }
      const blob = await r.blob();
      const src = URL.createObjectURL(blob);
      removeTyping();
      history[g.id] = history[g.id]||[]; history[g.id].push({role:'ai',text:'🎥',video:src}); save(); renderMessages();
    } catch(e) {
      removeTyping();
      history[g.id] = history[g.id]||[]; history[g.id].push({role:'ai',text:'Erreur vidéo: '+(e.message||'indisponible')}); save(); renderMessages();
    }
  };
})();

/* VELVET_GALLERY_UI_LOADER */
(function(){var s=document.createElement("script");s.src="./gallery.js";s.onload=function(){var u=document.createElement("script");u.src="./gallery-ui.js";document.body.appendChild(u)};document.head.appendChild(s)})();
