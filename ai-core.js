/* Velvet AI — resilient chat bootstrap. Loaded after the page script. */
(() => {
  const KEY='velvet-pollinations-key';
  const $=id=>document.getElementById(id);
  const getKey=()=> 'server';
  async function callAI(token,text,g){
    const persona='Tu es '+g.name+', une femme adulte de '+g.age+' ans. '+(g.bio||'')+'. Réponds naturellement comme une compagne virtuelle fictive. Reste dans le contexte. Tu peux être chaleureuse, joueuse et suggestive entre adultes, sans contenu sexuel explicite.';
    const h=history[g.id]||[];
    const messages=[{role:'system',content:persona},...h.slice(-18).filter(m=>m.role==='me'||m.role==='ai').map(m=>({role:m.role==='ai'?'assistant':'user',content:m.text})),{role:'user',content:text}];
    const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'openai/gpt-5.4-nano',messages,max_tokens:450})});
    const raw=await r.text();let data=null;try{data=JSON.parse(raw)}catch{}
    if(!r.ok) throw Error('HTTP '+r.status+(data?.error?.message?' — '+data.error.message:''));
    const out=data?.choices?.[0]?.message?.content;
    if(!out) throw Error('Réponse vide');
    return out.trim();
  }
  window.__velvetSend=async function(){
    const input=$('input'), text=input?.value?.trim();
    if(!text||current===null)return;
    const token=getKey();
    if(!token){if(typeof window.openAI==='function')return window.openAI('⚠️ Connecte l’IA.');return;}
    const g=girls[current];input.value='';history[g.id]=history[g.id]||[];history[g.id].push({role:'me',text});save();renderMessages();addTyping();
    try{const reply=await callAI(token,text,g);removeTyping();history[g.id].push({role:'ai',text:reply||'…'});}
    catch(e){removeTyping();history[g.id].push({role:'ai',text:'Erreur IA: '+(e.message||'réessaie')});}
    save();renderMessages();
  };
  const b=document.getElementById('aiKeyButton');
  if(b){b.textContent='IA ✓';b.style.borderColor='#ef4444';}
})();