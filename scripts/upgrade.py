from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

# The build step injects a progressive-enhancement layer after the app's own JS.
# It does not replace the existing app logic.
if 'VELVET_UPGRADE_V6' not in s:
    addon = r'''
<!-- VELVET_UPGRADE_V6 -->
<style>
:root{--kb:0px}
.composer{bottom:max(8px,calc(8px + env(safe-area-inset-bottom) + var(--kb,0px)));transition:bottom .12s ease}
.tools{bottom:max(65px,calc(65px + env(safe-area-inset-bottom) + var(--kb,0px)));transition:bottom .12s ease}
.voiceBtn,.speakBtn{width:48px;height:50px;flex:0 0 48px;border:1px solid #302b2d;border-radius:16px;background:#121112;color:#ddd;font-size:17px}
.voiceBtn.live,.speakBtn.live{background:#ef4444;border-color:#ef4444;color:#fff}
.voiceHint{position:fixed;z-index:100;left:50%;bottom:max(90px,calc(90px + env(safe-area-inset-bottom) + var(--kb,0px)));transform:translateX(-50%);background:#181617;color:#eee;border:1px solid #302b2d;border-radius:99px;padding:9px 14px;font-size:11px;display:none;box-shadow:0 10px 40px #000}
.voicePanel{position:fixed;z-index:90;left:50%;bottom:max(125px,calc(125px + env(safe-area-inset-bottom) + var(--kb,0px)));transform:translateX(-50%);width:min(420px,calc(100% - 24px));background:#141214;border:1px solid #302b2d;border-radius:18px;padding:12px;display:none;box-shadow:0 20px 60px #000}
.voicePanel b{font-size:13px}.voicePanel small{display:block;color:#888;line-height:1.4;margin-top:4px}.voicePanel button{margin-top:9px;border:1px solid #383235;background:#1b191a;color:#ddd;border-radius:12px;padding:9px 12px}
@media(max-width:560px){.voiceBtn,.speakBtn{width:46px;height:50px;flex-basis:46px}.send{min-width:76px}.composer{width:calc(100% - 20px)}.tools{width:calc(100% - 20px)}}
</style>
<div class="voiceHint" id="voiceHint">Je t'écoute…</div>
<div class="voicePanel" id="voicePanel"><b>Conversation vocale</b><small>Parle avec ta voix. Velvet lit les réponses à voix haute quand le mode vocal est actif.</small><button type="button" id="voiceClose">Fermer</button></div>
<script>
(function(){
 const input=document.getElementById('input'),send=document.getElementById('sendBtn'),composer=send&&send.parentElement;
 if(!input||!send||!composer)return;
 const root=document.documentElement;
 let voiceMode=false;
 let lastSpoken='';
 function sync(){
  if(!window.visualViewport)return;
  const v=window.visualViewport;
  const k=Math.max(0,window.innerHeight-v.height-v.offsetTop);
  root.style.setProperty('--kb',Math.min(k,420)+'px');
  const m=document.getElementById('messages');
  if(m)setTimeout(()=>m.scrollTop=m.scrollHeight,30);
 }
 if(window.visualViewport){visualViewport.addEventListener('resize',sync);visualViewport.addEventListener('scroll',sync)}
 window.addEventListener('orientationchange',()=>setTimeout(sync,300));
 sync();

 // Voice input
 if(!document.getElementById('voiceBtn')){
  const b=document.createElement('button');b.id='voiceBtn';b.className='voiceBtn';b.type='button';b.textContent='🎙️';b.title='Parler';composer.insertBefore(b,send);
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(SR){
   const r=new SR();r.lang='fr-FR';r.interimResults=true;r.continuous=false;
   r.onstart=()=>{b.classList.add('live');document.getElementById('voiceHint').style.display='block'};
   r.onend=()=>{b.classList.remove('live');document.getElementById('voiceHint').style.display='none'};
   r.onerror=()=>{b.classList.remove('live');document.getElementById('voiceHint').style.display='none'};
   r.onresult=e=>{let t='';for(let j=e.resultIndex;j<e.results.length;j++)t+=e.results[j][0].transcript;if(t)input.value=t;if(e.results[e.results.length-1].isFinal)setTimeout(()=>{if(input.value.trim())send.click()},120)};
   b.onclick=()=>{try{r.start()}catch(e){}};
  }else{b.disabled=true;b.style.opacity='.35';b.title='Dictée vocale non disponible dans ce navigateur'}
 }

 // Real spoken replies using the phone's native speech engine.
 const head=document.querySelector('.chathead');
 if(head&&!document.getElementById('speakBtn')){
  const b=document.createElement('button');b.id='speakBtn';b.className='speakBtn';b.type='button';b.textContent='🔊';b.title='Faire parler Velvet';head.insertBefore(b,head.querySelector('.more'));
  b.onclick=()=>{voiceMode=!voiceMode;b.classList.toggle('live',voiceMode);b.textContent=voiceMode?'🔊':'🔇';if(voiceMode){document.getElementById('voicePanel').style.display='block';speakLast()}else{speechSynthesis.cancel()}};
 }
 const close=document.getElementById('voiceClose');if(close)close.onclick=()=>document.getElementById('voicePanel').style.display='none';
 function clean(t){return t.replace(/[*_`#]/g,'').replace(/https?:\/\/\S+/g,'').trim()}
 function speak(text){if(!('speechSynthesis' in window)||!text)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(clean(text));u.lang='fr-FR';u.rate=.98;u.pitch=1.02;const voices=speechSynthesis.getVoices();const fr=voices.find(v=>/^fr(-|_)/i.test(v.lang));if(fr)u.voice=fr;speechSynthesis.speak(u)}
 function speakLast(){const box=document.getElementById('messages');if(!box)return;const rows=box.querySelectorAll('.row.ai .bubble');if(!rows.length)return;const text=rows[rows.length-1].innerText||'';if(text&&text!==lastSpoken){lastSpoken=text;speak(text)}}
 const mo=new MutationObserver(()=>{if(voiceMode)setTimeout(speakLast,120)});const messages=document.getElementById('messages');if(messages)mo.observe(messages,{childList:true,subtree:true});

 // Enter sends; iPhone Return key is no longer a dead key.
 input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send.click()}});

 // If the app exposes generatePhoto(), natural image requests can call it directly.
 const oldSend=window.send;
 if(typeof oldSend==='function'){
  window.send=function(){
   const text=input.value.trim();
   const asksImage=/\b(photo|image|selfie|portrait|montre[- ]moi|fais[- ]moi|génère|genere|à quoi tu ressembles|a quoi tu ressembles)\b/i.test(text);
   if(asksImage && typeof window.generatePhoto==='function' && /\b(photo|image|selfie|portrait|montre|ressemble)\b/i.test(text)){
    oldSend.apply(this,arguments);
    setTimeout(()=>{try{window.generatePhoto(text)}catch(e){}},500);
    return;
   }
   oldSend.apply(this,arguments);
  };
 }
})();
</script>
'''
    s = s.replace('</body>', addon + '</body>')
    p.write_text(s, encoding='utf-8')

Path('manifest.webmanifest').write_text('{"name":"Velvet AI","short_name":"Velvet AI","start_url":"./","display":"standalone","background_color":"#080808","theme_color":"#080808","lang":"fr","icons":[]}', encoding='utf-8')
s = p.read_text(encoding='utf-8')
if '<link rel="manifest"' not in s:
    p.write_text(s.replace('</head>', '<link rel="manifest" href="manifest.webmanifest"></head>'), encoding='utf-8')
