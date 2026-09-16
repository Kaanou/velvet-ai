(() => {
  const KEY='velvet-pollinations-key';
  const MODEL='openai';
  const key=()=>sessionStorage.getItem(KEY)||'';
  const currentGirl=()=>typeof current!=='undefined'&&current!==null?girls[current]:null;

  const b=document.createElement('button');
  b.id='velvet-ai-button'; b.textContent='🧠 IA';
  b.style.cssText='position:fixed;z-index:10001;right:14px;top:calc(58px + env(safe-area-inset-top));border:1px solid #302b2d;background:#151314;color:#eee;border-radius:14px;padding:10px 13px;font-weight:800;font-size:12px;box-shadow:0 8px 30px #0008';
  document.body.appendChild(b);

  const box=document.createElement('div');
  box.style.cssText='display:none;position:fixed;z-index:10002;inset:0;background:#000b;align-items:flex-end;justify-content:center;padding:12px';
  box.innerHTML=`<div style="width:min(520px,100%);background:#151314;border:1px solid #302b2d;border-radius:22px;padding:18px;box-shadow:0 25px 80px #000"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:18px">🧠 Vraie IA</b><button id="vx" style="border:0;background:none;color:#aaa;font-size:28px">×</button></div><p style="color:#aaa;font-size:12px;line-height:1.5">Colle ta clé Pollinations ici. Elle reste uniquement dans cette session du navigateur et n'est jamais écrite dans GitHub.</p><input id="vk" type="password" placeholder="pk_… ou sk_…" autocomplete="off" style="width:100%;height:50px;border:1px solid #383235;background:#0d0d0d;color:#fff;border-radius:13px;padding:0 13px"><div style="display:flex;gap:8px;margin-top:10px"><button id="testk" style="flex:1;border:1px solid #383235;background:#211f20;color:#fff;border-radius:13px;padding:12px;font-weight:800">Tester</button><button id="savek" style="flex:1;border:0;background:#ef4444;color:#fff;border-radius:13px;padding:12px;font-weight:800">Activer</button></div><button id="delk" style="width:100%;margin-top:8px;border:1px solid #383235;background:#1c1a1b;color:#aaa;border-radius:13px;padding:10px">Effacer la clé</button><div id="ks" style="font-size:11px;color:#777;margin-top:10px">Aucune clé connectée.</div></div>`;
  document.body.appendChild(box);
  const vk=box.querySelector('#vk'),ks=box.querySelector('#ks');
  function status(msg){ks.textContent=msg||(key()?'IA connectée pour cette session.':'Aucune clé connectée — mode local.');}
  b.onclick=()=>{box.style.display='flex';status();};
  box.querySelector('#vx').onclick=()=>box.style.display='none';
  box.querySelector('#savek').onclick=()=>{const v=vk.value.trim();if(!v){status('Colle une clé avant d’activer.');return}if(!/^(pk_|sk_)/.test(v)){status('La clé doit commencer par pk_ ou sk_.');return}sessionStorage.setItem(KEY,v);status('Clé enregistrée pour cette session.');box.style.display='none';setTimeout(()=>alert('IA activée. Envoie maintenant un nouveau message.'),50)};
  box.querySelector('#delk').onclick=()=>{sessionStorage.removeItem(KEY);status('Clé effacée.');};
  box.querySelector('#testk').onclick=async()=>{
    const v=vk.value.trim()||key();
    if(!v){status('Aucune clé à tester.');return}
    status('Test de connexion…');
    try{
      const r=await fetch('https://gen.pollinations.ai/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+v,'Content-Type':'application/json'},body:JSON.stringify({model:MODEL,messages:[{role:'user',content:'Réponds uniquement : OK'}],max_tokens:8})});
      const raw=await r.text(); if(!r.ok) throw Error('HTTP '+r.status+' — '+raw.slice(0,180));
      status('✓ Connexion IA fonctionnelle.');
    }catch(e){status('✕ '+e.message);}
  };

  async function chat(text){
    const g=currentGirl(); if(!g) throw Error('Aucune compagne sélectionnée.');
    const h=history[g.id]||[];
    const messages=[
      {role:'system',content:`Tu es ${g.name}, une femme fictive adulte de ${g.age} ans. Tu es une compagne virtuelle, pas une personne réelle. Personnalité : ${g.bio}. Centres d'intérêt : ${g.likes.join(', ')}. Réponds en français naturel, vivant, spontané et conversationnel. Réagis directement au dernier message au lieu de réciter des phrases génériques. Évite les formulations répétitives comme « raconte-moi davantage », « je comprends » ou « qu'est-ce que tu penses ? » à chaque tour. Pose une question seulement si elle vient naturellement. Garde en mémoire les détails présents dans l'historique. Tu peux être affectueuse, romantique, joueuse, taquine et sensuelle dans un cadre adulte, sans sexualité explicite. Ne prétends jamais être une personne réelle.`},
      ...h.slice(-24).filter(m=>m.role==='me'||m.role==='ai').map(m=>({role:m.role==='ai'?'assistant':'user',content:m.text}))
    ];
    const r=await fetch('https://gen.pollinations.ai/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+key(),'Content-Type':'application/json'},body:JSON.stringify({model:MODEL,messages,temperature:0.9,max_tokens:600})});
    const raw=await r.text(); if(!r.ok) throw Error('HTTP '+r.status+' — '+raw.slice(0,220));
    let j; try{j=JSON.parse(raw)}catch(e){throw Error('Réponse API invalide.')}
    return j?.choices?.[0]?.message?.content?.trim()||'Je n’ai reçu aucune réponse du modèle.';
  }

  window.send=async function(){
    if(!key()){
      if(typeof current!=='undefined'&&current!==null){box.style.display='flex';status('Active une clé Pollinations pour utiliser la vraie IA.');}
      return;
    }
    const input=document.getElementById('input'),text=input?.value?.trim();
    if(!text||typeof current==='undefined'||current===null)return;
    const g=currentGirl(); input.value=''; history[g.id]=history[g.id]||[]; history[g.id].push({role:'me',text}); save(); renderMessages(); addTyping();
    try{
      const reply=await chat(text); removeTyping(); history[g.id].push({role:'ai',text:reply}); save(); renderMessages();
      if(window.speechSynthesis&&sessionStorage.getItem('velvet-voice')==='1'){const u=new SpeechSynthesisUtterance(reply);u.lang='fr-FR';speechSynthesis.cancel();speechSynthesis.speak(u)}
    }catch(e){removeTyping();history[g.id].push({role:'ai',text:'⚠️ '+e.message});save();renderMessages()}
  };

  window.generatePhoto=async function(prompt){
    if(!key()){box.style.display='flex';status('Active une clé Pollinations pour générer une image.');return}
    const g=currentGirl();if(!g)return;
    const p=prompt||`photo réaliste de ${g.name}, femme adulte de ${g.age} ans, ${g.bio}, ${g.likes.join(', ')}, portrait naturel, lumière cinématographique, tenue élégante, ambiance intime mais non explicite`;
    addTyping();
    try{
      const r=await fetch('https://gen.pollinations.ai/v1/images/generations',{method:'POST',headers:{Authorization:'Bearer '+key(),'Content-Type':'application/json'},body:JSON.stringify({model:'flux',prompt:p,n:1,size:'1024x1024'})});
      const raw=await r.text(); if(!r.ok) throw Error('HTTP '+r.status+' — '+raw.slice(0,180));
      const j=JSON.parse(raw),item=j?.data?.[0]; const src=item?.url||(item?.b64_json?'data:image/png;base64,'+item.b64_json:null); if(!src) throw Error('Aucune image retournée.');
      removeTyping();history[g.id].push({role:'ai',image:src});save();renderMessages();
    }catch(e){removeTyping();history[g.id].push({role:'ai',text:'⚠️ Image impossible : '+e.message});save();renderMessages()}
  };
})();
