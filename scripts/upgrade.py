from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

# Keep the existing progressive enhancements already in the project.
if 'VELVET_UPGRADE_V8' not in s:
    addon = r'''
<!-- VELVET_UPGRADE_V8_POLLINATIONS_FIX -->
<script>
(function(){
 const KEY='velvet-pollinations-key';
 let apiKey=sessionStorage.getItem(KEY)||'';
 const panel=document.getElementById('aiPanel'),overlay=document.getElementById('aiOverlay'),settings=document.getElementById('settings');
 if(panel&&settings&&!document.getElementById('polliKey')){
  const btn=document.createElement('button');btn.textContent='🧠 Connecter une vraie IA';settings.insertBefore(btn,settings.firstChild);
  btn.onclick=()=>{panel.style.display='block';overlay.style.display='block'};
 }
 const oldSend=window.send;
 if(typeof oldSend==='function'){
  window.send=async function(){
   const input=document.getElementById('input');const text=input&&input.value.trim();
   if(!text||typeof current==='undefined'||current===null||!apiKey)return oldSend.apply(this,arguments);
   const g=girls[current];if(!g)return oldSend.apply(this,arguments);
   input.value='';
   history[g.id]=history[g.id]||[];history[g.id].push({role:'me',text});save();renderMessages();addTyping();
   const messages=[{role:'system',content:`Tu es ${g.name}, une femme fictive majeure de ${g.age} ans. Personnalité: ${g.bio}. Traits: ${(g.tags||[]).join(', ')}. Centres d'intérêt: ${(g.likes||[]).join(', ')}. Réponds uniquement en français. Conversation naturelle, spontanée et vivante, comme une discussion instantanée entre adultes. Utilise le contexte, rebondis sur ce que l'utilisateur vient de dire, varie tes formulations et évite les phrases de chatbot du type « dis-moi plutôt ce que tu veux vraiment dire ». Tu peux être romantique, flirtante et sensuelle entre adultes consentants, mais reste conforme aux règles du fournisseur et ne sexualise jamais un mineur. Ne prétends jamais être une personne réelle.`},...history[g.id].filter(m=>m.text).slice(-20).map(m=>({role:m.role==='me'?'user':'assistant',content:m.text}))];
   try{
    const r=await fetch('https://gen.pollinations.ai/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},body:JSON.stringify({model:'openai',messages,temperature:.9,max_tokens:600})});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const d=await r.json(),a=d?.choices?.[0]?.message?.content?.trim();if(!a)throw new Error('empty');
    removeTyping();history[g.id].push({role:'ai',text:a});save();renderMessages();
   }catch(e){removeTyping();history[g.id].push({role:'ai',text:'Le moteur IA n’a pas répondu. Vérifie ta clé Pollinations dans le menu •••.'});save();renderMessages()}
  };
 }
 const oldPhoto=window.generatePhoto;
 window.generatePhoto=async function(prompt){
  if(!apiKey)return oldPhoto.apply(this,arguments);
  if(typeof current==='undefined'||current===null)return;
  const g=girls[current];addTyping();
  const p=prompt||`portrait photo réaliste de ${g.name}, femme adulte de ${g.age} ans, ${g.bio}, style naturel et cinématographique, non explicite`;
  try{
   const r=await fetch('https://gen.pollinations.ai/image/'+encodeURIComponent(p)+'?model=flux',{headers:{Authorization:'Bearer '+apiKey}});if(!r.ok)throw new Error('HTTP '+r.status);
   const blob=await r.blob(),url=URL.createObjectURL(blob);removeTyping();history[g.id].push({role:'ai',image:url});save();renderMessages();
  }catch(e){removeTyping();history[g.id].push({role:'ai',text:'La génération d’image a échoué. Vérifie ta clé Pollinations.'});save();renderMessages()}
 };
})();
</script>
'''
    s=s.replace('</body>',addon+'</body>')
    p.write_text(s,encoding='utf-8')

Path('manifest.webmanifest').write_text('{"name":"Velvet AI","short_name":"Velvet AI","start_url":"./","display":"standalone","background_color":"#080808","theme_color":"#080808","lang":"fr","icons":[]}',encoding='utf-8')
s=p.read_text(encoding='utf-8')
if '<link rel="manifest"' not in s:
    p.write_text(s.replace('</head>','<link rel="manifest" href="manifest.webmanifest"></head>'),encoding='utf-8')
