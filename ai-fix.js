(() => {
  const KEY='velvet-pollinations-key';
  const API='https://gen.pollinations.ai/v1/chat/completions';
  const getKey=()=>String(localStorage.getItem(KEY)||'').trim();
  const $=id=>document.getElementById(id);

  async function ask(token,messages){
    const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
      body:JSON.stringify({model:'openai/gpt-5.4-nano',messages,max_tokens:450})});
    const raw=await r.text(); let d=null; try{d=JSON.parse(raw)}catch{}
    if(!r.ok) throw new Error('HTTP '+r.status+(d?.error?.message?' — '+d.error.message:''));
    const out=d?.choices?.[0]?.message?.content;
    if(!out) throw new Error('Réponse vide');
    return String(out).trim();
  }

  function setStatus(text){
    const b=$('aiKeyButton'); if(b){b.textContent=getKey()?'🧠 IA ✓':'🧠 IA';b.style.borderColor=getKey()?'#ef4444':'#302b2d';}
    const s=document.getElementById('velvet-ai-status'); if(s)s.textContent=text||'';
  }

  function openPanel(){
    let box=document.getElementById('velvet-ai-fix');
    if(!box){
      box=document.createElement('div'); box.id='velvet-ai-fix';
      box.style.cssText='position:fixed;z-index:30000;inset:0;background:#000b;display:flex;align-items:flex-end;justify-content:center;padding:12px';
      box.innerHTML='<div style="width:min(520px,100%);background:#151314;border:1px solid #302b2d;border-radius:22px;padding:18px;color:#fff"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:18px">🧠 IA</b><button id="vaf-close" style="border:0;background:none;color:#aaa;font-size:28px">×</button></div><p style="color:#aaa;font-size:12px">Clé Pollinations. Elle reste uniquement sur cet appareil.</p><input id="vaf-key" type="password" placeholder="sk_…" style="width:100%;height:50px;border:1px solid #383235;background:#0d0d0d;color:#fff;border-radius:13px;padding:0 13px"><div style="display:flex;gap:8px;margin-top:10px"><button id="vaf-test" style="flex:1;border:1px solid #383235;background:#211f20;color:#fff;border-radius:13px;padding:12px;font-weight:800">Tester</button><button id="vaf-save" style="flex:1;border:0;background:#ef4444;color:#fff;border-radius:13px;padding:12px;font-weight:800">Activer</button></div><div id="velvet-ai-status" style="font-size:11px;color:#aaa;margin-top:10px"></div></div>';
      document.body.appendChild(box);
      const input=$('vaf-key');
      input.value=getKey();
      $('vaf-close').onclick=()=>box.remove();
      $('vaf-save').onclick=()=>{const v=input.value.trim();if(!v)return setStatus('Clé absente.');localStorage.setItem(KEY,v);setStatus('✓ Clé enregistrée.');setTimeout(()=>box.remove(),400);};
      $('vaf-test').onclick=async()=>{const v=input.value.trim()||getKey();if(!v)return setStatus('Clé absente.');setStatus('Test en cours…');try{await ask(v,[{role:'user',content:'Réponds uniquement OK'}]);localStorage.setItem(KEY,v);setStatus('✓ Clé valide — moteur opérationnel.');}catch(e){setStatus('✕ '+e.message);}};
    }
    box.style.display='flex';
    setStatus(getKey()?'✓ Clé déjà enregistrée.':'Entre ta clé une fois.');
  }



  async function safeReferenceEdit(g, context){
    const src=await fetch(g.photo);
    if(!src.ok) throw new Error('Image de référence inaccessible');
    const blob=await src.blob();
    const form=new FormData();
    form.append('image',blob,'reference.jpg');
    form.append('prompt',`Photographie smartphone photoréaliste d'une femme adulte fictive nommée ${g.name}, ${g.age} ans. Même identité visuelle que la photo de référence, visage cohérent, peau naturelle, cheveux réalistes, lumière naturelle, pose quotidienne, tenue adulte élégante, contenu non explicite. ${context}`);
    form.append('model','kontext');
    form.append('size','768x1024');
    form.append('n','1');
    const r=await fetch('https://gen.pollinations.ai/v1/images/edits',{method:'POST',headers:{Authorization:'Bearer '+getKey()},body:form});
    const raw=await r.text();let d=null;try{d=JSON.parse(raw)}catch{}
    if(!r.ok) throw new Error('HTTP '+r.status+(d?.error?.message?' — '+d.error.message:''));
    const b64=d?.data?.[0]?.b64_json;
    if(!b64) throw new Error('Image générée absente');
    const bin=atob(b64),bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes],{type:'image/png'}));
  }

  window.generatePhoto=async function(prompt=''){
    const g=typeof current!=='undefined'&&current!==null?girls[current]:null;
    if(!g)return;
    const token=getKey();
    if(!token){openPanel();return;}
    addTyping();
    try{
      const src=await safeReferenceEdit(g,prompt||'selfie spontané du moment, cadrage naturel, expression détendue');
      removeTyping();
      history[g.id]=history[g.id]||[];
      history[g.id].push({role:'ai',text:'📷',image:src});
      save();renderMessages();
    }catch(e){
      removeTyping();
      history[g.id]=history[g.id]||[];
      history[g.id].push({role:'ai',text:'Erreur photo : '+(e.message||'génération refusée')});
      save();renderMessages();
    }
  };

  window.generateGalleryUrls=async function(){
    const g=typeof current!=='undefined'&&current!==null?girls[current]:null;
    const token=getKey();
    if(!g)throw new Error('Aucune compagne');
    if(!token){openPanel();throw new Error('IA non connectée');}
    const contexts=[
      'selfie de face dans une lumière matinale douce',
      'selfie de trois-quarts dans un café',
      'portrait smartphone en extérieur en fin de journée',
      'photo miroir dans un intérieur quotidien',
      'selfie assise avec un arrière-plan naturel',
      'portrait spontané près d’une fenêtre'
    ];
    const out=[];
    for(const context of contexts){
      try{out.push(await safeReferenceEdit(g,context));}catch(e){console.warn(e);}
    }
    return out;
  };

  window.openAI=openPanel;
  window.__velvetSend=async function(){
    const input=$('input'); const text=input?.value?.trim();
    if(!text||typeof current==='undefined'||current===null)return;
    const token=getKey();
    if(!token){openPanel();return;}
    const g=girls[current]; input.value='';
    history[g.id]=history[g.id]||[]; history[g.id].push({role:'me',text}); save(); renderMessages(); addTyping();
    try{
      const h=history[g.id]||[];
      const messages=[{role:'system',content:'Tu es '+g.name+', une compagne virtuelle fictive adulte. Réponds naturellement, avec une personnalité cohérente et dans le contexte de la conversation.'},...h.slice(-18).filter(m=>m.role==='me'||m.role==='ai').map(m=>({role:m.role==='ai'?'assistant':'user',content:m.text}))];
      const reply=await ask(token,messages); removeTyping(); history[g.id].push({role:'ai',text:reply}); save(); renderMessages();
    }catch(e){removeTyping();history[g.id].push({role:'ai',text:'Erreur IA : '+e.message});save();renderMessages();}
  };
  window.send=window.__velvetSend;
  const b=$('aiKeyButton'); if(b)b.onclick=openPanel;
  setStatus();
})();