from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

if 'VELVET_UPGRADE_V7' not in s:
    addon = r'''
<!-- VELVET_UPGRADE_V7_POLLINATIONS -->
<style>
.aiPanel{position:fixed;z-index:120;left:50%;top:50%;transform:translate(-50%,-50%);width:min(440px,calc(100% - 28px));background:#151315;border:1px solid #302b2d;border-radius:22px;padding:18px;box-shadow:0 30px 90px #000;display:none}
.aiPanel h3{margin:0 0 6px;font-size:18px}.aiPanel p{margin:0 0 12px;color:#999;font-size:12px;line-height:1.45}.aiPanel input{width:100%;height:46px;background:#0e0d0e;color:#fff;border:1px solid #383235;border-radius:12px;padding:0 12px;outline:none}.aiPanel .aiBtns{display:flex;gap:8px;margin-top:10px}.aiPanel button{flex:1;border:1px solid #383235;background:#211f20;color:#ddd;border-radius:12px;padding:10px}.aiPanel .primary{background:#ef4444;border-color:#ef4444;color:#fff;font-weight:700}.aiStatus{font-size:11px;color:#888;margin-top:9px;min-height:16px}.aiBadge{font-size:10px;color:#777;margin-top:3px}.aiOverlay{position:fixed;inset:0;background:#0009;z-index:119;display:none}
</style>
<div class="aiOverlay" id="aiOverlay"></div>
<div class="aiPanel" id="aiPanel">
<h3>🧠 Vrai moteur IA</h3>
<p>Connecte ton propre accès Pollinations. La clé reste dans la session de ce navigateur et n'est jamais envoyée à GitHub.</p>
<input id="polliKey" type="password" placeholder="Clé Pollinations (pk_… ou sk_…)" autocomplete="off" spellcheck="false">
<div class="aiBtns"><button id="aiCancel">Annuler</button><button id="aiSave" class="primary">Activer</button></div>
<div class="aiStatus" id="aiStatus"></div>
<div class="aiBadge">Le site garde un mode local de secours si aucune clé n'est configurée.</div>
</div>
<script>
(function(){
 const panel=document.getElementById('aiPanel'),overlay=document.getElementById('aiOverlay'),settings=document.getElementById('settings');
 if(!panel||!settings)return;
 const KEY='velvet-pollinations-key';
 let apiKey=sessionStorage.getItem(KEY)||'';
 const btn=document.createElement('button');btn.id='realAiBtn';btn.textContent=apiKey?'🧠 IA connectée':'🧠 Connecter une vraie IA';
 settings.insertBefore(btn,settings.firstChild);
 function open(){document.getElementById('polliKey').value=apiKey;panel.style.display='block';overlay.style.display='block';setTimeout(()=>document.getElementById('polliKey').focus(),50)}
 function close(){panel.style.display='none';overlay.style.display='none'}
 btn.onclick=open;document.getElementById('aiCancel').onclick=close;overlay.onclick=close;
 document.getElementById('aiSave').onclick=()=>{const k=document.getElementById('polliKey').value.trim();if(!k){apiKey='';sessionStorage.removeItem(KEY);btn.textContent='🧠 Connecter une vraie IA';document.getElementById('aiStatus').textContent='Mode local activé.';return}apiKey=k;sessionStorage.setItem(KEY,k);btn.textContent='🧠 IA connectée';document.getElementById('aiStatus').textContent='Clé enregistrée dans cette session.';setTimeout(close,500)};
 const originalSend=window.send;
 if(typeof originalSend!=='function')return;
 window.send=async function(){
   const input=document.getElementById('input');const text=input&&input.value.trim();
   if(!text||window.current===null||!apiKey){return originalSend.apply(this,arguments)}
   const girls=window.girls||[];const g=girls[window.current];
   if(!g)return originalSend.apply(this,arguments);
   input.value='';
   if(typeof window.history==='object' && window.history[g.id]){window.history[g.id].push({role:'me',text});if(typeof window.save==='function')window.save();if(typeof window.renderMessages==='function')window.renderMessages();if(typeof window.addTyping==='function')window.addTyping()}
   const localHistory=(window.history&&window.history[g.id])||[];
   const messages=[
    {role:'system',content:`Tu es ${g.name}, une femme fictive majeure de ${g.age} ans. Personnalité: ${g.bio}. Traits: ${(g.tags||[]).join(', ')}. Centres d'intérêt: ${(g.likes||[]).join(', ')}. Tu es une compagne virtuelle clairement fictive. Réponds exclusivement en français. Parle comme une personne dans une vraie conversation: naturelle, spontanée, parfois imparfaite, avec humour et réactions émotionnelles simulées. Évite les phrases génériques de chatbot, les listes, les introductions artificielles et les répétitions. Pose une question seulement quand elle est naturelle. Tu peux être romantique, flirtante et sensuelle entre adultes consentants, mais ne prétends jamais être une personne réelle et ne sexualise jamais un mineur. Si une demande dépasse les règles du fournisseur, refuse brièvement sans sermon.`},
    ...localHistory.filter(m=>m.text).slice(-18).map(m=>({role:m.role==='me'?'user':'assistant',content:m.text}))
   ];
   try{
    const r=await fetch('https://gen.pollinations.ai/v1/chat/completions',{method:'POST',headers:{'Authorization':'Bearer '+apiKey,'Content-Type':'application/json'},body:JSON.stringify({model:'openai',messages,temperature:.9,max_tokens:500})});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const data=await r.json();const answer=data?.choices?.[0]?.message?.content?.trim();
    if(!answer)throw new Error('Réponse vide');
    if(typeof window.removeTyping==='function')window.removeTyping();
    window.history[g.id].push({role:'ai',text:answer});if(typeof window.save==='function')window.save();if(typeof window.renderMessages==='function')window.renderMessages();
   }catch(e){
    if(typeof window.removeTyping==='function')window.removeTyping();
    window.history[g.id].push({role:'ai',text:'Je n’arrive pas à joindre le moteur IA pour le moment. Vérifie ta clé Pollinations dans « ••• ».'});if(typeof window.save==='function')window.save();if(typeof window.renderMessages==='function')window.renderMessages();
   }
 };
 window.generatePhotoWithPollinations=async function(prompt){
   if(!apiKey){if(typeof window.generatePhoto==='function')return window.generatePhoto(prompt);open();return}
   const g=(window.girls||[])[window.current];if(!g)return;
   const p=prompt||`photo réaliste de ${g.name}, femme adulte de ${g.age} ans, ${g.bio}, ${g.likes.join(', ')}, portrait naturel, élégant, cinématographique, non explicite`;
   if(typeof window.addTyping==='function')window.addTyping();
   try{
    const url='https://gen.pollinations.ai/image/'+encodeURIComponent(p)+'?model=flux';
    const r=await fetch(url,{headers:{'Authorization':'Bearer '+apiKey}});if(!r.ok)throw new Error('HTTP '+r.status);const blob=await r.blob();const image=URL.createObjectURL(blob);
    if(typeof window.removeTyping==='function')window.removeTyping();window.history[g.id].push({role:'ai',image});if(typeof window.save==='function')window.save();if(typeof window.renderMessages==='function')window.renderMessages();
   }catch(e){if(typeof window.removeTyping==='function')window.removeTyping();window.history[g.id].push({role:'ai',text:'Je n’ai pas réussi à générer l’image. Vérifie la clé Pollinations et réessaie.'});if(typeof window.save==='function')window.save();if(typeof window.renderMessages==='function')window.renderMessages()}
 };
 const oldPhoto=window.generatePhoto;
 if(typeof oldPhoto==='function')window.generatePhoto=function(prompt){if(apiKey)return window.generatePhotoWithPollinations(prompt);return oldPhoto(prompt)};
})();
</script>
'''
    s=s.replace('</body>',addon+'</body>')
    p.write_text(s,encoding='utf-8')

Path('manifest.webmanifest').write_text('{"name":"Velvet AI","short_name":"Velvet AI","start_url":"./","display":"standalone","background_color":"#080808","theme_color":"#080808","lang":"fr","icons":[]}',encoding='utf-8')
s=p.read_text(encoding='utf-8')
if '<link rel="manifest"' not in s:
    p.write_text(s.replace('</head>','<link rel="manifest" href="manifest.webmanifest"></head>'),encoding='utf-8')
