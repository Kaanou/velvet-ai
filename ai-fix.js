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