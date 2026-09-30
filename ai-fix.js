/* Velvet AI compatibility / UI patch. Do not override the core photo generator. */
(() => {
  function installLevelPicker(){
    const settings=document.getElementById('settings');
    if(!settings || document.getElementById('velvet-level-picker')) return;
    const g=(typeof current!=='undefined'&&current!==null&&typeof girls!=='undefined')?girls[current]:null;
    if(!g) return;
    const wrap=document.createElement('div');
    wrap.id='velvet-level-picker';
    wrap.style.cssText='margin:8px 0;padding:10px 0;border-top:1px solid #302b2d;border-bottom:1px solid #302b2d';
    const levels=[['soft','1 · Doux'],['flirt','2 · Flirt'],['sensuel','3 · Sensuel'],['seducteur','4 · Très séduisant'],['adulte','5 · Très adulte']];
    const key='velvet-level-'+g.id;
    const refresh=()=>{
      const cur=localStorage.getItem(key)||'adulte';
      wrap.querySelectorAll('button').forEach(b=>{const on=b.dataset.level===cur;b.style.borderColor=on?'#ef4444':'#383235';b.style.background=on?'#2a1515':'#1b191a';});
    };
    wrap.innerHTML='<div style="font-size:11px;color:#aaa;font-weight:800;margin-bottom:7px">Niveau photo</div>'+
      levels.map(x=>'<button data-level="'+x[0]+'" style="display:block;width:100%;margin:4px 0;border:1px solid #383235;background:#1b191a;color:#ddd;border-radius:10px;padding:8px;font-size:12px;text-align:left">'+x[1]+'</button>').join('');
    wrap.querySelectorAll('button').forEach(b=>b.onclick=()=>{localStorage.setItem(key,b.dataset.level);refresh();});
    settings.insertBefore(wrap,settings.firstChild);
    refresh();
  }
  const oldToggle=window.toggleSettings;
  window.toggleSettings=function(){
    if(typeof oldToggle==='function') oldToggle();
    setTimeout(installLevelPicker,30);
  };
  setTimeout(installLevelPicker,250);
})();
