(() => {
  const KEY='velvet-pollinations-key';
  const MODEL='openai-fast';
  const key=()=>sessionStorage.getItem(KEY)||'';
  const currentGirl=()=>typeof current!=='undefined'&&current!==null?girls[current]:null;
  const esc2=s=>String(s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const style=`position:fixed;z-index:9999;right:14px;top:58px;border:1px solid #302b2d;background:#151314;color:#eee;border-radius:12px;padding:8px 11px;font-weight:800;font-size:12px`;
  const b=document.createElement('button'); b.textContent='🧠 IA'; b.style.cssText=style; document.body.appendChild(b);
  const box=document.createElement('div'); box.style.cssText='display:none;position:fixed;z-index:10000;inset:0;background:#0009;align-items:flex-end;justify-content:center;padding:12px';
  box.innerHTML=`<div style="width:min(520px,100%);background:#151314;border:1px solid #302b2d;border-radius:22px;padding:18px;box-shadow:0 25px 80px #000"><div style="display:flex;justify-content:space-between;align-items:center"><b>Vraie IA</b><button id="vx" style="border:0;background:none;color:#aaa;font-size:22px">×</button></div><p style="color:#999;font-size:12px;line-height:1.45">Ta clé reste uniquement dans cette session du navigateur. Ne mets jamais une clé secrète dans GitHub. Pour un usage public, utilise plutôt le système BYOP de Pollinations.</p><input id="vk" type="password" placeholder="Clé Pollinations (pk_… ou sk_…)" style="width:100%;height:48px;border:1px solid #383235;background:#0d0d0d;color:#fff;border-radius:13px;padding:0 13px"><div style="display:flex;gap:8px;margin-top:10px"><button id="savek" style="flex:1;border:0;background:#ef4444;color:#fff;border-radius:13px;padding:12px;font-weight:800">Activer</button><button id="delk" style="border:1px solid #383235;background:#1c1a1b;color:#ddd;border-radius:13px;padding:12px">Effacer</button></div><div id="ks" style="font-size:11px;color:#777;margin-top:10px"></div></div>`;
  document.body.appendChild(box);
  const vk=box.querySelector('#vk'), ks=box.querySelector('#ks');
  function status(){ks.textContent=key()?'IA connectée pour cette session.':'Aucune clé connectée — mode conversation local.';vk.value=''}
  b.onclick=()=>{box.style.display='flex';status()}; box.querySelector('#vx').onclick=()=>box.style.display='none';
  box.querySelector('#savek').onclick=()=>{const v=vk.value.trim();if(!v)return;sessionStorage.setItem(KEY,v);box.style.display='none';status();alert('IA activée pour cette session.')};
  box.querySelector('#delk').onclick=()=>{sessionStorage.removeItem(KEY);status()};

  async function chat(text){
    const g=currentGirl(); if(!g) throw Error('Aucune compagne sélectionnée.');
    const h=history[g.id]||[];
    const messages=[{role:'system',content:`Tu es ${g.name}, une femme fictive adulte de ${g.age} ans. Tu es une compagne virtuelle, pas une personne réelle. Personnalité: ${g.bio}. Centres d'intérêt: ${g.likes.join(', ')}. Réponds en français naturel, vivant et spontané. Évite les réponses génériques du type « raconte-moi davantage », « je comprends » ou les questions automatiques. Réagis précisément à ce que l'utilisateur vient de dire, rappelle naturellement les détails déjà évoqués et garde une voix cohérente. Tu peux être affectueuse, romantique, joueuse, taquine et sensuelle dans un cadre adulte, sans sexualité explicite. Ne prétends jamais avoir une vie réelle ou des sentiments réels hors du rôleplay.`},...h.slice(-18).filter(m=>m.role==='me'||m.role==='ai').map(m=>({role:m.role==='ai'?'assistant':'user',content:m.text}))];
    const r=await fetch('https://gen.pollinations.ai/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+key(),'Content-Type':'application/json'},body:JSON.stringify({model:MODEL,messages,temperature:0.9,max_tokens:500})});
    if(!r.ok) throw Error('IA indisponible ('+r.status+'). Vérifie ta clé ou son solde.');
    const j=await r.json(); return j?.choices?.[0]?.message?.content?.trim()||'Je sèche un peu. Réessaie.';
  }
  const oldSend=window.send;
  window.send=async function(){
    if(!key()){return oldSend.apply(this,arguments)}
    const input=document.getElementById('input'), text=input?.value?.trim(); if(!text||typeof current==='undefined'||current===null)return;
    const g=currentGirl(); input.value=''; history[g.id]=history[g.id]||[]; history[g.id].push({role:'me',text}); if(typeof save==='function')save(); if(typeof renderMessages==='function')renderMessages(); if(typeof addTyping==='function')addTyping();
    try{const reply=await chat(text); if(typeof removeTyping==='function')removeTyping(); history[g.id].push({role:'ai',text:reply}); if(typeof save==='function')save(); if(typeof renderMessages==='function')renderMessages(); if(window.speechSynthesis&&sessionStorage.getItem('velvet-voice')==='1'){const u=new SpeechSynthesisUtterance(reply);u.lang='fr-FR';speechSynthesis.cancel();speechSynthesis.speak(u)}}
    catch(e){if(typeof removeTyping==='function')removeTyping();history[g.id].push({role:'ai',text:'Je n’arrive pas à joindre l’IA pour le moment. '+e.message});if(typeof save==='function')save();if(typeof renderMessages==='function')renderMessages()}
  };
  window.generatePhoto=async function(prompt){
    if(!key()){alert('Active d’abord l’IA avec le bouton 🧠 IA.');return}
    const g=currentGirl(); if(!g)return;
    const p=prompt||`photo réaliste de ${g.name}, femme adulte de ${g.age} ans, ${g.bio}, ${g.likes.join(', ')}, portrait naturel, lumière cinématographique, tenue élégante, ambiance intime mais non explicite`;
    if(typeof addTyping==='function')addTyping();
    try{
      const r=await fetch('https://gen.pollinations.ai/v1/images/generations',{method:'POST',headers:{Authorization:'Bearer '+key(),'Content-Type':'application/json'},body:JSON.stringify({model:'flux',prompt:p,n:1,size:'1024x1024'})});
      if(!r.ok)throw Error('Génération image indisponible ('+r.status+').');
      const j=await r.json();const item=j?.data?.[0];const src=item?.url||(item?.b64_json?'data:image/png;base64,'+item.b64_json:null);if(!src)throw Error('Aucune image retournée.');
      removeTyping();history[g.id].push({role:'ai',image:src});save();renderMessages();
    }catch(e){removeTyping();history[g.id].push({role:'ai',text:'Je n’ai pas réussi à générer la photo. '+e.message});save();renderMessages()}
  };
})();
