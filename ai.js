(() => {
  const KEY='velvet-pollinations-key';
  const MODEL='openai-fast';
  const key=()=>sessionStorage.getItem(KEY)||'';
  const currentGirl=()=>typeof current!=='undefined'&&current!==null?girls[current]:null;

  const b=document.createElement('button');
  b.id='velvet-ai-button'; b.textContent='🧠 IA';
  b.style.cssText='border:1px solid #302b2d;background:#151314;color:#eee;border-radius:12px;padding:9px 11px;font-weight:800;font-size:12px;margin-left:auto;flex:0 0 auto';
  const head=document.querySelector('.chathead');
  const more=document.querySelector('.more');
  if(head) head.insertBefore(b,more||null); else document.body.appendChild(b);

  const box=document.createElement('div');
  box.style.cssText='display:none;position:fixed;z-index:10002;inset:0;background:#000b;align-items:flex-end;justify-content:center;padding:12px';
  box.innerHTML=`<div style="width:min(520px,100%);background:#151314;border:1px solid #302b2d;border-radius:22px;padding:18px;box-shadow:0 25px 80px #000"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:18px">🧠 Connecter la vraie IA</b><button id="vx" style="border:0;background:none;color:#aaa;font-size:28px">×</button></div><p style="color:#aaa;font-size:12px;line-height:1.5">Colle ta clé Pollinations ici. Elle reste uniquement dans cette session. Pour une clé <b>sk_</b>, ne la partage jamais et ne la mets jamais dans GitHub.</p><input id="vk" type="password" placeholder="pk_… ou sk_…" autocomplete="off" style="width:100%;height:50px;border:1px solid #383235;background:#0d0d0d;color:#fff;border-radius:13px;padding:0 13px"><div style="display:flex;gap:8px;margin-top:10px"><button id="testk" style="flex:1;border:1px solid #383235;background:#211f20;color:#fff;border-radius:13px;padding:12px;font-weight:800">Tester</button><button id="savek" style="flex:1;border:0;background:#ef4444;color:#fff;border-radius:13px;padding:12px;font-weight:800">Activer</button></div><button id="delk" style="width:100%;margin-top:8px;border:1px solid #383235;background:#1c1a1b;color:#aaa;border-radius:13px;padding:10px">Effacer</button><div id="ks" style="font-size:11px;color:#777;margin-top:10px">IA non connectée.</div></div>`;
  document.body.appendChild(box);
  const vk=box.querySelector('#vk'),ks=box.querySelector('#ks');
  function status(msg){ks.textContent=msg||(key()?'✓ IA connectée pour cette session.':'IA non connectée.');}
  function openAI(msg){box.style.display='flex';status(msg);setTimeout(()=>vk.focus(),80)}
  b.onclick=()=>openAI();
  box.querySelector('#vx').onclick=()=>box.style.display='none';
  box.querySelector('#savek').onclick=()=>{const v=vk.value.trim();if(!v){status('Colle une clé avant d’activer.');return}if(!/^(pk_|sk_)/.test(v)){status('Clé invalide : elle doit commencer par pk_ ou sk_.');return}sessionStorage.setItem(KEY,v);status('✓ Clé activée.');box.style.display='none';setTimeout(()=>alert('IA activée. Envoie un nouveau message.'),50)};
  box.querySelector('#delk').onclick=()=>{sessionStorage.removeItem(KEY);status('IA déconnectée.')};
  box.querySelector('#testk').onclick=async()=>{
    const v=vk.value.trim()||key();
    if(!v){status('Aucune clé à tester.');return}
    status('Test de connexion…');
    try{
      const r=await fetch('https://gen.pollinations.ai/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+v,'Content-Type':'application/json'},body:JSON.stringify({model:MODEL,messages:[{role:'user',content:'Réponds uniquement OK.'}],max_tokens:8})});
      const raw=await r.text(); if(!r.ok) throw Error('HTTP '+r.status+' — '+raw.slice(0,180));
      status('✓ Connexion IA fonctionnelle.');
    }catch(e){status('✕ '+e.message)}
  };

  async function chat(text){
    const g=currentGirl(); if(!g) throw Error('Aucune compagne sélectionnée.');
    const h=history[g.id]||[];
    const messages=[
      {role:'system',content:`Tu es ${g.name}, une femme fictive adulte de ${g.age} ans. Tu es une compagne virtuelle. Personnalité : ${g.bio}. Centres d'intérêt : ${g.likes.join(', ')}. Réponds en français naturel, spontané, vivant et conversationnel. Réagis précisément à ce que l'utilisateur dit. Ne récite jamais des phrases de chatbot comme « je comprends », « raconte-moi davantage » ou « qu'est-ce que tu penses ? » à répétition. Ne pose pas forcément une question : une vraie conversation peut simplement rebondir, plaisanter, raconter, taquiner ou répondre directement. Utilise naturellement les détails déjà présents dans l'historique. Tu peux être affectueuse, romantique, joueuse, taquine et sensuelle entre adultes, sans sexualité explicite. Ne prétends pas être une personne réelle.`},
      ...h.slice(-24).filter(m=>m.role==='me'||m.role==='ai').map(m=>({role:m.role==='ai'?'assistant':'user',content:m.text}))
    ];
    const r=await fetch('https://gen.pollinations.ai/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+key(),'Content-Type':'application/json'},body:JSON.stringify({model:MODEL,messages,temperature:0.95,max_tokens:600})});
    const raw=await r.text(); if(!r.ok) throw Error('HTTP '+r.status+' — '+raw.slice(0,220));
    let j; try{j=JSON.parse(raw)}catch(e){throw Error('Réponse API invalide.')}
    return j?.choices?.[0]?.message?.content?.trim()||'Le modèle n’a renvoyé aucun texte.';
  }

  window.send=async function(){
    if(!key()){openAI('⚠️ La vraie IA n’est pas connectée. Active ta clé pour utiliser une IA réelle.');return}
    const input=document.getElementById('input'),text=input?.value?.trim();
    if(!text||typeof current==='undefined'||current===null)return;
    const g=currentGirl(); input.value=''; history[g.id]=history[g.id]||[]; history[g.id].push({role:'me',text}); save(); renderMessages(); addTyping();
    try{
      const reply=await chat(text); removeTyping(); history[g.id].push({role:'ai',text:reply}); save(); renderMessages();
      if(window.speechSynthesis&&sessionStorage.getItem('velvet-voice')==='1'){const u=new SpeechSynthesisUtterance(reply);u.lang='fr-FR';speechSynthesis.cancel();speechSynthesis.speak(u)}
    }catch(e){removeTyping();history[g.id].push({role:'ai',text:'⚠️ '+e.message});save();renderMessages()}
  };

  window.generatePhoto=async function(prompt){
    if(!key()){openAI('⚠️ Connecte d’abord la vraie IA pour générer une image.');return}
    const g=currentGirl();if(!g)return;
    const p=prompt||`photo réaliste de ${g.name}, femme adulte de ${g.age} ans, ${g.bio}, ${g.likes.join(', ')}, selfie naturel, lumière cinématographique, tenue élégante, ambiance intime mais non explicite`;
    addTyping();
    try{
      const r=await fetch('https://gen.pollinations.ai/v1/images/generations',{method:'POST',headers:{Authorization:'Bearer '+key(),'Content-Type':'application/json'},body:JSON.stringify({model:'flux',prompt:p,n:1,size:'1024x1024'})});
      const raw=await r.text(); if(!r.ok) throw Error('HTTP '+r.status+' — '+raw.slice(0,180));
      const j=JSON.parse(raw),item=j?.data?.[0]; const src=item?.url||(item?.b64_json?'data:image/png;base64,'+item.b64_json:null); if(!src) throw Error('Aucune image retournée.');
      removeTyping();history[g.id].push({role:'ai',image:src});save();renderMessages();
    }catch(e){removeTyping();history[g.id].push({role:'ai',text:'⚠️ Image impossible : '+e.message});save();renderMessages()}
  };
})();
