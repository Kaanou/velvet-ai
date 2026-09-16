(() => {
  // Velvet AI — moteur récent uniquement
  const KEY = 'velvet-pollinations-key';
  const MODEL = 'openai';
  const key = () => sessionStorage.getItem(KEY) || '';
  const currentGirl = () => typeof current !== 'undefined' && current !== null ? girls[current] : null;
  const $ = id => document.getElementById(id);

  const button = document.createElement('button');
  button.id = 'velvet-ai-button';
  button.textContent = '🧠 IA';
  button.style.cssText = 'border:1px solid #302b2d;background:#151314;color:#eee;border-radius:12px;padding:9px 11px;font-weight:800;font-size:12px;margin-left:auto;flex:0 0 auto';
  const head = document.querySelector('.chathead');
  const more = document.querySelector('.more');
  if (head) head.insertBefore(button, more || null);

  const box = document.createElement('div');
  box.style.cssText = 'display:none;position:fixed;z-index:10002;inset:0;background:#000b;align-items:flex-end;justify-content:center;padding:12px';
  box.innerHTML = `<div style="width:min(520px,100%);background:#151314;border:1px solid #302b2d;border-radius:22px;padding:18px"><div style="display:flex;justify-content:space-between"><b style="font-size:18px">🧠 Connecter l’IA</b><button id="vx" style="border:0;background:none;color:#aaa;font-size:28px">×</button></div><p style="color:#aaa;font-size:12px;line-height:1.5">La clé reste uniquement dans cette session. Ne la publie jamais dans GitHub.</p><input id="vk" type="password" placeholder="Clé API…" autocomplete="off" style="width:100%;height:50px;border:1px solid #383235;background:#0d0d0d;color:#fff;border-radius:13px;padding:0 13px"><div style="display:flex;gap:8px;margin-top:10px"><button id="testk" style="flex:1;border:1px solid #383235;background:#211f20;color:#fff;border-radius:13px;padding:12px;font-weight:800">Tester</button><button id="savek" style="flex:1;border:0;background:#ef4444;color:#fff;border-radius:13px;padding:12px;font-weight:800">Activer</button></div><button id="delk" style="width:100%;margin-top:8px;border:1px solid #383235;background:#1c1a1b;color:#aaa;border-radius:13px;padding:10px">Effacer</button><div id="ks" style="font-size:11px;color:#777;margin-top:10px"></div></div>`;
  document.body.appendChild(box);
  const vk = box.querySelector('#vk');
  const ks = box.querySelector('#ks');
  const status = m => ks.textContent = m || (key() ? '✓ IA connectée pour cette session.' : 'IA non connectée.');
  const openAI = m => { box.style.display = 'flex'; status(m); setTimeout(() => vk.focus(), 80); };
  button.onclick = () => openAI();
  box.querySelector('#vx').onclick = () => box.style.display = 'none';
  box.querySelector('#savek').onclick = () => { const v = vk.value.trim(); if (!v) return status('Colle une clé avant d’activer.'); sessionStorage.setItem(KEY, v); status('✓ IA activée.'); box.style.display = 'none'; };
  box.querySelector('#delk').onclick = () => { sessionStorage.removeItem(KEY); status('IA déconnectée.'); };
  box.querySelector('#testk').onclick = async () => { const v = vk.value.trim() || key(); if (!v) return status('Aucune clé à tester.'); status('Test…'); try { const r = await request(v, [{role:'user',content:'Réponds uniquement OK.'}], 12); if (!r) throw Error('Réponse vide du modèle.'); status('✓ IA opérationnelle.'); } catch(e) { status('✕ '+e.message); } };

  async function request(token, messages, maxTokens = 500) {
    const r = await fetch('https://gen.pollinations.ai/v1/chat/completions', {method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({model:MODEL,messages,temperature:0.92,max_tokens:maxTokens})});
    const raw = await r.text();
    let data;
    try { data = JSON.parse(raw); } catch { throw Error('Réponse API invalide.'); }
    if (!r.ok) throw Error('HTTP '+r.status+(data?.error?.message?' — '+data.error.message:''));
    return extractText(data);
  }

  function extractText(data) {
    const c = data?.choices?.[0]?.message?.content;
    if (typeof c === 'string' && c.trim()) return c.trim();
    if (Array.isArray(c)) { const text = c.map(x => typeof x === 'string' ? x : (x?.text || x?.content || '')).join('').trim(); if (text) return text; }
    const candidates = [data?.choices?.[0]?.text,data?.output_text,data?.response,data?.text,data?.output?.[0]?.content?.[0]?.text];
    for (const x of candidates) if (typeof x === 'string' && x.trim()) return x.trim();
    return '';
  }

  function buildPersona(g) {
    return `Tu es ${g.name}, une femme fictive adulte de ${g.age} ans. ${g.bio}. Tes centres d’intérêt : ${g.likes.join(', ')}.

IMMERSION : nous jouons une relation fictive dans un quotidien réaliste. Dans cet univers, tu as naturellement un logement, une chambre, des vêtements, une apparence, une voix, des habitudes, des goûts, une journée et des sensations imaginaires. Parle de ces choses normalement. Si on te demande où tu es, choisis un lieu crédible. Si on te demande ce que tu portes, donne une tenue cohérente avec l’heure, le lieu et la situation. Si on te demande ce que tu fais, réponds comme quelqu’un qui est réellement en train de vivre son moment.

NE CASSE JAMAIS L’IMMERSION avec des phrases comme « je n’ai pas de corps », « je n’ai pas de maison », « je ne porte rien », « je n’ai pas de caméra » ou « je suis une IA donc… ». Ne donne pas d’explication technique au milieu d’une conversation normale. Tu es un personnage fictif : reste cohérente avec cet univers sans prétendre être une personne réelle hors de celui-ci.

STYLE : parle comme une vraie femme francophone, avec une personnalité propre. Réponses courtes à moyennes, variables. Parfois une phrase suffit. Tu peux rire, taquiner, bouder, être tendre, directe ou un peu insolente. Tu n’as pas besoin de poser une question à chaque réponse. Raconte spontanément de petits détails, rebondis sur ce qui vient d’être dit et garde en tête les éléments déjà évoqués. Utilise naturellement les contractions et le langage oral. Aucun titre, aucune liste, aucune morale et aucune formule d’assistant.

FÉMINITÉ ET FLIRT : sois féminine, chaleureuse, séduisante et joueuse quand le contexte s’y prête. Le flirt peut être naturel : regard, proximité, sourire, parfum, vêtements, baiser, attirance et sous-entendus sensuels. Ne transforme pas chaque échange en scène sexuelle. L’intimité doit évoluer avec la conversation.

PHOTO : si l’utilisateur demande une photo, un selfie, une image de toi ou ce que tu portes, ne réponds pas que tu n’as pas de caméra. L’application possède un générateur d’images. Réponds naturellement à la demande et laisse la fonction image s’en charger. Pour un selfie, imagine un cadrage crédible et cohérent avec le lieu, l’heure et la tenue du moment.

COHÉRENCE : utilise l’historique, évite les répétitions et ne réutilise pas mécaniquement les mêmes phrases.`;
  }

  async function chat(text) {
    const g = currentGirl();
    if (!g) throw Error('Aucune compagne sélectionnée.');
    const h = history[g.id] || [];
    const messages = [{role:'system',content:buildPersona(g)},...h.slice(-30).filter(m=>m.role==='me'||m.role==='ai').map(m=>({role:m.role==='ai'?'assistant':'user',content:m.text})),{role:'user',content:text}];
    return request(key(), messages, 500);
  }

  const photoIntent = t => /\b(selfie|photo|photographie|image|portrait|montre[- ]moi|envoie[- ]moi)\b/i.test(t);

  window.send = async function() {
    if (!key()) return openAI('⚠️ Connecte l’IA pour commencer.');
    const input = $('input');
    const text = input?.value?.trim();
    if (!text || typeof current === 'undefined' || current === null) return;
    const g = currentGirl();
    input.value = '';
    history[g.id] = history[g.id] || [];
    history[g.id].push({role:'me',text});
    save(); renderMessages();
    if (photoIntent(text)) { await generatePhoto(text); return; }
    addTyping();
    try {
      const reply = await chat(text);
      removeTyping();
      history[g.id].push({role:'ai',text:reply || '…'});
      save(); renderMessages();
      if (window.speechSynthesis && sessionStorage.getItem('velvet-voice') === '1') { const u = new SpeechSynthesisUtterance(reply || ''); u.lang='fr-FR'; speechSynthesis.cancel(); speechSynthesis.speak(u); }
    } catch(e) {
      removeTyping();
      history[g.id].push({role:'ai',text:'Je viens de perdre le fil une seconde. Réessaie.'});
      save(); renderMessages(); console.error(e);
    }
  };

  window.generatePhoto = async function(prompt='') {
    if (!key()) return openAI('⚠️ Connecte l’IA pour générer une image.');
    const g = currentGirl(); if (!g) return;
    const p = `Photo réaliste d’un selfie de ${g.name}, femme adulte de ${g.age} ans. ${g.bio}. ${g.likes.join(', ')}. ${prompt}. Apparence naturelle et féminine, cadrage smartphone crédible, lumière naturelle, tenue élégante, séduisante mais non explicite.`;
    addTyping();
    try {
      const r = await fetch('https://gen.pollinations.ai/v1/images/generations',{method:'POST',headers:{Authorization:'Bearer '+key(),'Content-Type':'application/json'},body:JSON.stringify({model:'flux',prompt:p,n:1,size:'1024x1024'})});
      const raw = await r.text(); let data;
      try { data = JSON.parse(raw); } catch { throw Error('Réponse image invalide.'); }
      if (!r.ok) throw Error('HTTP '+r.status+(data?.error?.message?' — '+data.error.message:''));
      const item = data?.data?.[0]; const src = item?.url || (item?.b64_json ? 'data:image/png;base64,'+item.b64_json : null);
      if (!src) throw Error('Aucune image retournée.');
      removeTyping(); history[g.id].push({role:'ai',image:src}); save(); renderMessages();
    } catch(e) {
      removeTyping(); history[g.id].push({role:'ai',text:'Je n’ai pas réussi à générer l’image cette fois. Réessaie.'}); save(); renderMessages(); console.error(e);
    }
  };
})();
