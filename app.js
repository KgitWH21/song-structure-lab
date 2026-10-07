'use strict';
const $=s=>document.querySelector(s);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const draw=(a,n)=>{const b=[...a],out=[];while(out.length<n&&b.length)out.push(b.splice(Math.floor(Math.random()*b.length),1)[0]);return out;};
const fields=[['genres','Genres','Genre fusion'],['mood','Moods','Mood'],['instruments','Instruments','Instrument palette'],['groove','Grooves','Groove'],['harmony','Harmony','Harmony & melody'],['texture','Textures','Production texture'],['tempo','Tempos','Tempo'],['meter','Meters','Meter'],['vocal','Vocals','Vocal character']];
const detailFields=[['highs','High instruments','High layer'],['mids','Mid instruments','Mid layer'],['lows','Low instruments','Low layer'],['earCandy','Ear candy','Ear candy'],['vocalEffects','Vocal effects','Vocal effects'],['chords','Chord progressions','Chord progression'],['melody','Melody ideas','Melody idea'],['ambience','Ambience','Ambience']];
const allFields=[...fields,...detailFields];
const includedDetails=new Set(detailFields.map(([key])=>key));
const isVocalKey=key=>key==='vocal'||key==='vocalEffects';
let sound={},lockedSound=new Set(),sections=[],nextId=1,toastTimer;
const MINIMAL={
 instruments:['Nylon-string guitar','Steel-string acoustic guitar','Grand piano','Felt piano','Ukulele','Banjo','Mandolin','Harp','Kalimba','Violin','Cello','Flute','Clarinet','Saxophone','Harmonica','Accordion','Upright bass','Cajon','Shaker','Bongos','Djembe'],
 gestures:['Play a simple melodic phrase','Leave space between phrases','Repeat the motif with a small variation','Play softly with deliberate pauses','Use a stronger attack without adding parts','Move the melody to a different register','Simplify the rhythm','Answer one phrase with another','Hold a single note before continuing','Return to the opening motif'],
 transitions:['Brief pause before the next section','Continue the pulse into the next section','Carry the motif forward','Slow down slightly before the next phrase','Make a clean stop, then restart','Move directly into the next section'],
 endings:['Abrupt hard stop','End on an unresolved chord','Cut off mid-phrase','Return to the opening motif, then stop','Slow down into a final chord','Finish at full energy with no fade','Final melodic question with no answer','Loop seamlessly back to the opening','Let one sustained note ring out']
};
let minimal=false,lineup=['Nylon-string guitar'],fullSound=null;
const minimalKeys=new Set(['genres','mood','tempo','meter']);
function minimalRules(){return 'Only the listed instruments'+($('#voice').value==='vocal'?' and one natural, unlayered lead voice':'; no vocals')+'. Dry, close recording. No overdubs, backing tracks, pads, orchestral layers, added percussion, ambience, or production effects. Change intensity through playing, pauses, and phrasing; keep the same lineup in every section.';}
function renderMinimal(){
 $('#minimalToggle').setAttribute('aria-pressed',String(minimal));$('#minimalToggle').classList.toggle('locked',minimal);$('#minimalPanel').hidden=!minimal;
 $('.layer-panel').hidden=minimal;$('.fusion-control').hidden=minimal;
 if(!minimal)return;
 $('#playerFields').innerHTML=lineup.map((v,i)=>`<label>Player ${i+1}${i===0&&$('#voice').value==='vocal'?' · also sings':''}<select data-player="${i}">${options(MINIMAL.instruments,v)}</select></label>`).join('');
 $('#minimalRules').textContent=minimalRules();
}
function stripSection(s){
 if(!lineup.includes(s.instrument))s.instrument=pick(lineup);
 if(!MINIMAL.gestures.includes(s.gesture))s.gesture=pick(MINIMAL.gestures);
 if(!MINIMAL.transitions.includes(s.transition))s.transition=pick(MINIMAL.transitions);
 if(s.ending&&!MINIMAL.endings.includes(s.ending))s.ending=pick(MINIMAL.endings);
}
function setMinimal(value){
 if(value===minimal)return;
 minimal=value;
 if(minimal){lineup=draw(MINIMAL.instruments,Number($('#playerCount').value));fullSound={...sound};sound.genres=sound.genres.split(' + ')[0];sections.forEach(stripSection);say('Minimal is on. Every section uses your small lineup.');}
 else if(fullSound){for(const [key]of allFields)if(!minimalKeys.has(key))sound[key]=fullSound[key];say('Full sound palette restored.');}
 refreshMode();
}
function refreshMode(){
 renderMinimal();renderSound();renderSections();updateOutput();
 $('#gestures').innerHTML=(minimal?MINIMAL.gestures:CATALOG.Gestures).map(v=>`<option value="${escapeHTML(v)}">`).join('');
 $('#ending-options').innerHTML=(minimal?MINIMAL.endings:CATALOG.Endings).map(v=>`<option value="${escapeHTML(v)}">`).join('');
}
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const say=s=>{clearTimeout(toastTimer);$('#toast').textContent=s;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2600);};
const adv=()=>Number($('#adventure').value);
function rollField(key,cat){
 const amount=minimal?1:key==='genres'?($('#genreCount').value==='auto'?(adv()===0?1:adv()===1?2:3):Number($('#genreCount').value)):key==='instruments'?(adv()===2?3:2):1;
 sound[key]=draw(CATALOG[cat],amount).join(' + ');
}
function rollSound(){
 for(const [key,cat] of allFields){if(minimal&&!minimalKeys.has(key))continue;if(!lockedSound.has(key))rollField(key,cat);}
 renderSound();renderSections();updateOutput();
}
function renderSound(){
 $('#soundFields').innerHTML='';$('#detailFields').innerHTML='';
 for(const [key,cat,label] of allFields){
  if(minimal&&!minimalKeys.has(key))continue;
  if(isVocalKey(key)&&$('#voice').value==='instrumental')continue;
  const detail=detailFields.some(([k])=>k===key),included=!detail||includedDetails.has(key),locked=lockedSound.has(key);
  const div=document.createElement('div');div.className='sound-cell'+(!included?' excluded':'');
  div.innerHTML=`<div class="sound-heading"><label for="sound-${key}">${label}</label><div class="field-actions"><button class="lock-sound ${locked?'locked':''}" aria-pressed="${locked}" data-lock="${key}" aria-label="${locked?'Unlock':'Lock'} ${label}">${locked?'Locked':'Lock'}</button><button class="reroll-field" data-reroll="${key}" aria-label="Reroll ${label}" ${locked?'disabled':''}>↻</button></div></div><input id="sound-${key}" data-key="${key}" value="${escapeHTML(sound[key]||'')}" list="list-${key}" maxlength="600"><datalist id="list-${key}">${CATALOG[cat].map(v=>`<option value="${escapeHTML(v)}">`).join('')}</datalist>${detail?`<label class="include-control"><input type="checkbox" data-include="${key}" ${included?'checked':''}> Include in prompt</label>`:''}`;
  $(detail?'#detailFields':'#soundFields').append(div);
 }
}
const shapes={song:['Intro','Verse','Pre-chorus','Chorus','Verse','Bridge','Final chorus','Outro'],club:['Intro','Build-up','Drop','Breakdown','Build-up','Second drop','De-escalation','Outro'],journey:['Ambient opening','Theme A','Theme variation','Theme B','Climax','De-escalation','Reprise','Dissolve'],cinema:['Ambient opening','Theme A','Build-up','Interlude','Theme B','Climax','Reprise','Coda']};
const low=['Intro','Ambient opening','De-escalation','Outro','Dissolve','Silence','Breakdown','Interlude','Fade-out'];
const high=['Drop','Second drop','Chorus','Final chorus','Climax'];
function defaultEnding(type){if(minimal)return type==='Hard stop'?'Abrupt hard stop':pick(MINIMAL.endings);return type==='Hard stop'?'Abrupt hard stop':type==='Fade-out'?'Fade gradually to silence':type==='Silence'?'Final unison hit, then silence':pick(CATALOG.Endings);}
function createSection(type){let energy=low.includes(type)?2:high.includes(type)?5:3;const palette=[...(sound.instruments?.split(' + ').filter(Boolean)||[]),...['highs','mids','lows'].filter(k=>includedDetails.has(k)&&sound[k]).map(k=>sound[k])];return{id:nextId++,type,energy,locked:false,instrument:pick(minimal?lineup:adv()===2?CATALOG.Instruments:palette),gesture:pick(minimal?MINIMAL.gestures:CATALOG.Gestures),transition:pick(minimal?MINIMAL.transitions:CATALOG.Transitions),ending:defaultEnding(type),bars:pick(['4 bars','8 bars','16 bars'])};}
function shapeFor(n,preset){if(preset==='wild'||!preset&&adv()===2)return Array.from({length:n},()=>pick(CATALOG.Sections));const base=shapes[preset]||shapes[pick(['song','club','journey','cinema'])];const types=base.slice(1,-1);let result=[base[0]];for(let i=0;i<n-2;i++)result.push(types[Math.floor(i*types.length/(n-2))]);result.push(base.at(-1));if(adv()===1&&!preset){const i=1+Math.floor(Math.random()*(n-2));result[i]=pick(['Beat switch','Half-time section','Solo','False ending','Drum break','Call and response']);}return result;}
function generate(preset){const n=Number($('#count').value);let target=shapeFor(n,preset);const locked=sections.map((s,i)=>s.locked?i:-1).filter(i=>i>=0);const length=Math.max(n,...locked.map(i=>i+1));if(length>n)say('Kept locked sections beyond your chosen length.');const old=sections;rollSound();sections=Array.from({length},(_,i)=>old[i]?.locked?old[i]:createSection(target[i]||pick(CATALOG.Sections)));renderSections();updateOutput();}
function options(values,selected){return values.map(v=>`<option ${v===selected?'selected':''}>${escapeHTML(v)}</option>`).join('');}
function renderSections(){const root=$('#sections');root.innerHTML='';sections.forEach((s,i)=>{const el=document.createElement('article');el.className='section-card'+(s.locked?' is-locked':'');el.dataset.id=s.id;el.innerHTML=`<div class="section-head"><span class="number">${String(i+1).padStart(2,'0')}</span><select class="section-name" data-field="type" aria-label="Section ${i+1} type">${options(CATALOG.Sections,s.type)}</select><div class="section-buttons"><button data-action="lock" class="${s.locked?'locked':''}" aria-pressed="${s.locked}" aria-label="${s.locked?'Unlock':'Lock'} section ${i+1}">${s.locked?'Locked':'Lock'}</button><button data-action="reroll" aria-label="Reroll section ${i+1}" ${s.locked?'disabled':''}>↻</button></div></div><div class="section-body"><label>Lead element${minimal?`<select data-field="instrument">${options(lineup,s.instrument)}</select>`:`<input data-field="instrument" value="${escapeHTML(s.instrument)}" list="list-instruments" maxlength="200">`}</label><label>Length<select data-field="bars">${options(['2 bars','4 bars','8 bars','16 bars','32 bars','Free length'],s.bars)}</select></label><label class="wide">Musical gesture<input data-field="gesture" value="${escapeHTML(s.gesture)}" list="gestures" maxlength="300"></label>${i===sections.length-1?`<div class="wide"><div class="sound-heading"><label for="ending-${s.id}">Ending</label><button data-action="ending" class="subtle" ${s.locked?'disabled':''}>↻ Reroll ending</button></div><input id="ending-${s.id}" data-field="ending" value="${escapeHTML(s.ending||'')}" list="ending-options" maxlength="300" placeholder="Leave blank for no ending direction"><p class="small">This exact ending goes into your prompt. Choose one, write your own, or clear it.</p></div>`:`<label class="wide">Transition<select data-field="transition">${options(minimal?MINIMAL.transitions:CATALOG.Transitions,s.transition)}</select></label>`}<label>Energy<div class="energy-control"><input type="range" min="1" max="5" value="${s.energy}" data-field="energy" aria-label="Section ${i+1} energy"><output>${s.energy}/5</output></div></label></div><div class="section-foot"><div class="order-buttons"><button data-action="up" aria-label="Move section ${i+1} earlier" ${i===0?'disabled':''}>↑</button><button data-action="down" aria-label="Move section ${i+1} later" ${i===sections.length-1?'disabled':''}>↓</button></div><button data-action="remove" class="remove" ${s.locked||sections.length===1?'disabled':''}>Remove</button></div>`;root.append(el);});$('#sectionCount').textContent=sections.length;updateEnergy();}
function updateEnergy(){$('#energy').innerHTML=sections.map((s,i)=>`<div class="energy-bar" style="height:${s.energy*9}px" title="${i+1}. ${escapeHTML(s.type)}: energy ${s.energy}/5" aria-label="${escapeHTML(s.type)} energy ${s.energy} out of 5"></div>`).join('');}
function updateOutput(){const vocal=$('#voice').value==='vocal';const details=(minimal?[]:detailFields).filter(([key])=>includedDetails.has(key)&&sound[key]&&(!isVocalKey(key)||vocal)).map(([key,,label])=>label+': '+sound[key]);$('#styleOutput').value=(minimal?[lineup.length===1?'Solo performance':lineup.length===2?'Duo performance':'Trio performance',lineup.map((v,i)=>'Player '+(i+1)+': '+v+(i===0&&vocal?' and lead vocal':'')).join('; '),sound.genres?'Style influence: '+sound.genres:'',sound.mood,sound.tempo,sound.meter,minimalRules()]:[sound.genres,sound.mood,sound.tempo,sound.meter,sound.groove,sound.harmony,sound.instruments,sound.texture,vocal?sound.vocal:'Instrumental, no vocals',...details]).filter(Boolean).join('. ')+'.'+($('#vision').value.trim()?'\n'+$('#vision').value.trim():'');const seen={};$('#arrangementOutput').value=sections.map((s,i)=>{seen[s.type]=(seen[s.type]||0)+1;const multi=sections.filter(x=>x.type===s.type).length>1;const name=s.type+(multi?' '+seen[s.type]:'');const direction=i===sections.length-1?(s.ending?.trim()?'Ending: '+s.ending.trim():''):s.transition;return `[${[name+': '+s.bars,(minimal?'playing intensity ':'energy ')+s.energy+'/5',s.instrument,s.gesture,direction].filter(Boolean).join('; ')}]`;}).join('\n\n');}
async function copy(text,field){try{if(!navigator.clipboard)throw Error();await navigator.clipboard.writeText(text);say('Copied. Take it into Suno.');}catch{if(field){field.focus();field.select();say('Select and hold the highlighted text to copy.');}else{const t=$('#arrangementOutput'),before=t.value;t.value=text;t.focus();t.select();say('Select and hold the full brief to copy.');t.addEventListener('blur',()=>{t.value=before;},{once:true});}}}
function renderCatalog(){const query=$('#search').value.trim().toLowerCase();$('#catalogList').innerHTML=Object.entries(CATALOG).map(([cat,items])=>{if($('#catalogCategory').value!=='all'&&$('#catalogCategory').value!==cat)return '';const filtered=items.filter(v=>v.toLowerCase().includes(query)||cat.toLowerCase().includes(query));return filtered.length?`<div class="catalog-group"><h3>${cat} <span class="badge">${filtered.length}</span></h3><div class="chips">${filtered.map(v=>`<button data-category="${cat}" data-value="${escapeHTML(v)}">${escapeHTML(v)}</button>`).join('')}</div>`:'';}).join('')||'<p class="muted">No matches. You can type your own ideas into the sound and section fields.</p>';}
$('#generate').onclick=()=>generate();$('#rollSound').onclick=()=>rollSound();$('#voice').onchange=()=>{renderMinimal();renderSound();updateOutput();};$('#vision').oninput=updateOutput;
for(const selector of ['#soundFields','#detailFields']){
 $(selector).addEventListener('input',e=>{const key=e.target.dataset.key;if(key){sound[key]=e.target.value;updateOutput();}});
 $(selector).addEventListener('change',e=>{const key=e.target.dataset.include;if(key){e.target.checked?includedDetails.add(key):includedDetails.delete(key);e.target.closest('.sound-cell').classList.toggle('excluded',!e.target.checked);updateOutput();}});
 $(selector).addEventListener('click',e=>{
  const key=e.target.closest('[data-lock]')?.dataset.lock;
  if(key){lockedSound.has(key)?lockedSound.delete(key):lockedSound.add(key);renderSound();return;}
  const roll=e.target.closest('[data-reroll]');if(roll&&!roll.disabled){const field=allFields.find(([k])=>k===roll.dataset.reroll);rollField(field[0],field[1]);renderSound();updateOutput();}
 });
}
$('.presets').onclick=e=>{const preset=e.target.dataset.preset;if(preset)generate(preset);};
function addSection(type='Interlude'){if(sections.length>=24){say('24 sections is the limit for one brief.');return;}sections.push(createSection(type));renderSections();updateOutput();say('Section added at the end.');}
$('#addSection').onclick=()=>addSection();
$('#sections').addEventListener('input',e=>{const field=e.target.dataset.field;if(!field)return;const s=sections.find(x=>x.id===Number(e.target.closest('article').dataset.id));s[field]=field==='energy'?Number(e.target.value):e.target.value;if(field==='energy'){e.target.nextElementSibling.textContent=s.energy+'/5';updateEnergy();}updateOutput();});
$('#sections').addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b||b.disabled)return;const i=sections.findIndex(s=>s.id===Number(b.closest('article').dataset.id)),s=sections[i];switch(b.dataset.action){case'ending':s.ending=pick((minimal?MINIMAL.endings:CATALOG.Endings).filter(v=>v!==s.ending));break;case'lock':s.locked=!s.locked;break;case'reroll':sections[i]={...createSection(pick(CATALOG.Sections)),id:s.id};break;case'up':[sections[i-1],sections[i]]=[sections[i],sections[i-1]];break;case'down':[sections[i+1],sections[i]]=[sections[i],sections[i+1]];break;case'remove':sections.splice(i,1);break;}renderSections();updateOutput();});
document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>copy($('#'+b.dataset.copy).value,$('#'+b.dataset.copy)));$('#copyAll').onclick=()=>copy('STYLE DIRECTION\n'+$('#styleOutput').value+'\n\nARRANGEMENT\n'+$('#arrangementOutput').value);
$('#search').oninput=renderCatalog;$('#catalogCategory').innerHTML+=[...Object.keys(CATALOG)].map(cat=>`<option value="${escapeHTML(cat)}">${escapeHTML(cat)}</option>`).join('');$('#catalogCategory').onchange=renderCatalog;
$('#catalogList').onclick=e=>{const b=e.target.closest('[data-value]');if(!b)return;const {category,value}=b.dataset;if(minimal){const allowed=category==='Sections'||category==='Genres'||category==='Moods'||category==='Tempos'||category==='Meters'||category==='Endings'&&MINIMAL.endings.includes(value)||category==='Gestures'&&MINIMAL.gestures.includes(value)||category==='Transitions'&&MINIMAL.transitions.includes(value);if(!allowed){say('Turn off Minimal to add this element. Set your instruments in the player lineup.');return;}}if(category==='Endings'){sections.at(-1).ending=value;renderSections();updateOutput();say('Ending applied to the final section.');return;}if(category==='Sections'){addSection(value);return;}if(category==='Gestures'||category==='Transitions'){if(sections.length>=24){say('24 sections is the limit for one brief.');return;}const s=createSection('Interlude');s[category==='Gestures'?'gesture':'transition']=value;sections.push(s);renderSections();updateOutput();say('Added an interlude with this '+(category==='Gestures'?'gesture.':'transition.'));return;}const field=allFields.find(x=>x[1]===category)?.[0];if(field){if(isVocalKey(field))$('#voice').value='vocal';if(detailFields.some(([k])=>k===field))includedDetails.add(field);if(!minimal&&(field==='genres'||field==='instruments')&&sound[field]){const values=sound[field].split(' + ');if(!values.includes(value))values.push(value);sound[field]=values.join(' + ');}else sound[field]=value;lockedSound.add(field);renderSound();updateOutput();say('Added to the sound and locked.');}};
$('#genreTotal').textContent=CATALOG.Genres.length+' GENRES & STYLES';
$('#total').textContent=Object.values(CATALOG).reduce((n,a)=>n+a.length,0)+' ELEMENTS';
const endings=document.createElement('datalist');endings.id='ending-options';endings.innerHTML=CATALOG.Endings.map(v=>`<option value="${escapeHTML(v)}">`).join('');document.body.append(endings);
const dl=document.createElement('datalist');dl.id='gestures';dl.innerHTML=CATALOG.Gestures.map(v=>`<option value="${escapeHTML(v)}">`).join('');document.body.append(dl);
// A useful starting sketch; subsequent rolls explore the complete catalog.
sound={genres:'Video game soundtrack + Jazz fusion',mood:'Wonder-filled',instruments:'Felt piano + Marimba',groove:'Driving ostinato',harmony:'Lydian brightness',texture:'Wide cinematic space',tempo:'110 BPM',meter:'4/4',vocal:'Airy falsetto'};
for(const [key,cat] of detailFields)rollField(key,cat);
sections=['Ambient opening','Theme A','Build-up','Drop','De-escalation','Reprise'].map(createSection);renderSound();renderSections();updateOutput();renderCatalog();

$('#minimalToggle').onclick=()=>setMinimal(!minimal);
$('#exitMinimal').onclick=()=>setMinimal(false);
$('#playerCount').onchange=()=>{
 lineup=draw(MINIMAL.instruments,Number($('#playerCount').value));
 sections.forEach(stripSection);refreshMode();
};
$('#playerFields').onchange=e=>{
 if(e.target.dataset.player===undefined)return;
 lineup[Number(e.target.dataset.player)]=e.target.value;sections.forEach(stripSection);refreshMode();
};

$('#rerollLineup').onclick=()=>{
 const previous=lineup.join('|');
 lineup=draw(MINIMAL.instruments,Number($('#playerCount').value));
 if(lineup.join('|')===previous)lineup[0]=pick(MINIMAL.instruments.filter(v=>!lineup.includes(v)));
 sections.forEach(stripSection);refreshMode();say('New lineup. Same song structure.');
};
