(() => {
  const boot = () => {
    if (window.__velvetGalleryUI) return;
    window.__velvetGalleryUI = true;
    const getGirl = () => typeof current !== 'undefined' && current !== null ? girls[current] : null;
    const esc = s => String(s ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const style = document.createElement('style');
    style.textContent = `.vgallery{position:fixed;inset:0;z-index:10000;background:#050505f5;display:none;flex-direction:column;padding:env(safe-area-inset-top) 14px env(safe-area-inset-bottom)}.vghead{height:58px;display:flex;align-items:center;justify-content:space-between;flex:0 0 auto}.vgtitle{font-weight:800}.vgclose{border:1px solid #302b2d;background:#151314;color:#fff;border-radius:12px;padding:9px 13px}.vgmain{flex:1;min-height:0;display:flex;align-items:center;justify-content:center}.vgimg{width:min(92vw,620px);height:min(72vh,760px);object-fit:cover;border-radius:22px;box-shadow:0 20px 70px #000}.vgstrip{display:flex;gap:8px;overflow-x:auto;padding:12px 0}.vgthumb{width:62px;height:76px;object-fit:cover;border-radius:11px;border:2px solid transparent;opacity:.72;flex:0 0 auto}.vgthumb.active{border-color:#ef4444;opacity:1}.vglevels{display:flex;gap:6px;overflow-x:auto;padding:0 0 10px}.vglevel{flex:1 0 auto;border:1px solid #302b2d;background:#151314;color:#ddd;border-radius:10px;padding:7px 9px;font-size:11px;font-weight:800}.vglevel.active{border-color:#ef4444;background:#2a1515}.vgactions{display:flex;gap:8px;padding-bottom:10px}.vgactions button{flex:1;border:1px solid #302b2d;background:#151314;color:#fff;border-radius:13px;padding:11px;font-weight:800}.vgactions button.primary{border:0;background:#ef4444}.vgbadge{position:absolute;top:14px;right:14px;z-index:3;border:1px solid #fff3;background:#0009;color:#fff;border-radius:99px;padding:6px 9px;font-size:10px;backdrop-filter:blur(8px)}.card .vggallerybtn{position:absolute;top:14px;left:14px;z-index:4;border:1px solid #fff3;background:#0009;color:#fff;border-radius:99px;padding:7px 10px;font-size:11px;backdrop-filter:blur(8px)}`;
    document.head.appendChild(style);
    const modal = document.createElement('div'); modal.className='vgallery'; modal.innerHTML=`<div class="vghead"><div class="vgtitle" id="vgt"></div><button class="vgclose" id="vgx">Fermer</button></div><div class="vglevels" id="vgl"></div><div class="vgmain"><img class="vgimg" id="vgi" alt="Photo de la compagne"></div><div class="vgstrip" id="vgs"></div><div class="vgactions"><button id="vgr">Photo suivante</button><button class="primary" id="vgn">🤳 Nouveau selfie</button></div>`; document.body.appendChild(modal);
    let idx=0, photos=[];
    const show = n => { if(!photos.length)return; idx=(n+photos.length)%photos.length; document.getElementById('vgi').src=photos[idx]; [...document.querySelectorAll('.vgthumb')].forEach((x,i)=>x.classList.toggle('active',i===idx)); };
    window.openVelvetGallery = async (g) => {
      const levels=[['soft','1 · Doux'],['flirt','2 · Flirt'],['sensuel','3 · Sensuel'],['seducteur','4 · Très séduisant'],['adulte','5 · Très adulte']];
      const levelBox=document.getElementById('vgl');
      levelBox.innerHTML=levels.map(x=>'<button class="vglevel" data-level="'+x[0]+'">'+x[1]+'</button>').join('');
      const currentLevel=localStorage.getItem('velvet-level-'+g.id)||'adulte';
      levelBox.querySelectorAll('.vglevel').forEach(b=>{b.classList.toggle('active',b.dataset.level===currentLevel);b.onclick=()=>{localStorage.setItem('velvet-level-'+g.id,b.dataset.level);levelBox.querySelectorAll('.vglevel').forEach(x=>x.classList.toggle('active',x===b));};});
      photos=[g.photo]; idx=0;
      document.getElementById('vgt').textContent=g.name+' · galerie';
      document.getElementById('vgs').innerHTML='<img class="vgthumb active" src="'+esc(g.photo)+'" data-i="0" alt="">';
      modal.style.display='flex'; show(0);
      if(typeof window.generateGalleryUrls==='function'){
        document.getElementById('vgs').insertAdjacentHTML('beforeend','<span style="color:#888;font-size:11px;padding:12px">Génération de nouvelles photos…</span>');
        try{
          const generated=await window.generateGalleryUrls();
          if(generated.length){
            photos=[...generated]; idx=0;
            document.getElementById('vgs').innerHTML=photos.map((p,i)=>'<img class="vgthumb '+(i?'':'active')+'" src="'+esc(p)+'" data-i="'+i+'" alt="">').join('');
            document.querySelectorAll('.vgthumb').forEach(x=>x.onclick=()=>show(Number(x.dataset.i)));
            show(0);
          }
        }catch(e){console.warn(e);}
      }
    };
    document.getElementById('vgx').onclick=()=>modal.style.display='none'; document.getElementById('vgr').onclick=()=>show(idx+1); document.getElementById('vgn').onclick=()=>{modal.style.display='none'; if(typeof generatePhoto==='function')generatePhoto('selfie smartphone photoréaliste du moment, lumière naturelle, cadrage spontané, visage cohérent, tenue séduisante adulte mais non explicite');};
    let sx=0; modal.addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true}); modal.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>50)show(idx+(dx<0?1:-1));},{passive:true});
    const decorate = () => document.querySelectorAll('#girls .card').forEach((card,i)=>{if(card.querySelector('.vggallerybtn'))return;const g=girls[i];const b=document.createElement('button');b.className='vggallerybtn';b.textContent='📷 6 photos';b.onclick=e=>{e.stopPropagation();openVelvetGallery(g)};card.appendChild(b);});
    decorate(); new MutationObserver(decorate).observe(document.getElementById('girls')||document.body,{childList:true});
    const headBtn=document.createElement('button');headBtn.className='tool';headBtn.textContent='📷 Galerie';headBtn.onclick=()=>{const g=getGirl();if(g)openVelvetGallery(g)};const tools=document.querySelector('.tools');if(tools)tools.insertBefore(headBtn,tools.firstChild);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();