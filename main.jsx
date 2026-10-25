import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Upload, Images, Info, X, Trash2, Maximize2, Minimize2, Video, Image as ImageIcon, MousePointer2, Gamepad2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { readMedia, saveMedia, removeMedia } from './storage';
import './style.css';

const FRAMES = [
  { pos: [-4.1, 2.1, -5.36], rot: [0, 0, 0], width: 1.65, height: 2.05 },
  { pos: [-1.35, 2.1, -5.36], rot: [0, 0, 0], width: 1.65, height: 2.05 },
  { pos: [1.35, 2.1, -5.36], rot: [0, 0, 0], width: 1.65, height: 2.05 },
  { pos: [4.1, 2.1, -5.36], rot: [0, 0, 0], width: 1.65, height: 2.05 },
  { pos: [-5.36, 2.1, -2.7], rot: [0, Math.PI / 2, 0], width: 1.65, height: 2.05 },
  { pos: [-5.36, 2.1, 1.1], rot: [0, Math.PI / 2, 0], width: 1.65, height: 2.05 },
  { pos: [5.36, 2.1, -2.7], rot: [0, -Math.PI / 2, 0], width: 1.65, height: 2.05 },
  { pos: [5.36, 2.1, 1.1], rot: [0, -Math.PI / 2, 0], width: 1.65, height: 2.05 }
];
const initialMedia = [
  { id: 'demo1', name: 'Tun va yulduzlar', type: 'demo', slot: 0, palette: ['#16294b', '#cfaa67'] },
  { id: 'demo2', name: 'Oltin ufq', type: 'demo', slot: 1, palette: ['#493a37', '#d6a482'] },
  { id: 'demo3', name: 'Sirli tog‘lar', type: 'demo', slot: 2, palette: ['#253e41', '#a3b2aa'] },
  { id: 'demo4', name: 'Moviy orzu', type: 'demo', slot: 3, palette: ['#273b72', '#ad8b9b'] },
];

function artTexture(item) {
  const canvas = document.createElement('canvas'); canvas.width = 400; canvas.height = 520;
  const ctx = canvas.getContext('2d');
  const colors = item.palette || ['#232b36', '#947b57'];
  const grad = ctx.createLinearGradient(0, 0, 400, 520);
  grad.addColorStop(0, colors[0]); grad.addColorStop(1, colors[1]);
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 400, 520);
  ctx.fillStyle = '#f4cb96'; ctx.globalAlpha = .75; ctx.beginPath(); ctx.arc(270, 150, 55, 0, 2*Math.PI); ctx.fill(); ctx.globalAlpha = 1;
  ctx.fillStyle = '#142332'; ctx.beginPath(); ctx.moveTo(-30, 400); ctx.lineTo(100, 270); ctx.lineTo(230, 450); ctx.lineTo(300, 320); ctx.lineTo(460, 530); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#141922'; ctx.beginPath(); ctx.moveTo(-30, 520); ctx.lineTo(175, 325); ctx.lineTo(410, 520); ctx.closePath(); ctx.fill();
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}
function Artwork({ item, onOpen }) {
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    let active = true; let tex;
    if (item.type === 'image' && item.url) {
      new THREE.TextureLoader().load(item.url, loaded => {
        loaded.colorSpace = THREE.SRGBColorSpace;
        if (active) setTexture(loaded); else loaded.dispose();
      });
    } else { tex = artTexture(item); setTexture(tex); }
    return () => { active = false; if (tex) tex.dispose(); };
  }, [item]);
  return <group onClick={(e) => {e.stopPropagation(); onOpen(item);}}>
    <mesh position={[0,0,0.035]}><planeGeometry args={[1.43,1.79]} /><meshBasicMaterial color="#0d111a" /></mesh>
    {texture && <mesh position={[0,0,0.044]}><planeGeometry args={[1.38,1.73]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>}
    {item.type === 'video' && <group position={[0,0,0.067]}><mesh><circleGeometry args={[.25,32]} /><meshBasicMaterial color="#090c13" transparent opacity={0.86} /></mesh><mesh position={[0.035,0,.01]} rotation={[0,0,-Math.PI/2]}><coneGeometry args={[.115,.19,3]} /><meshBasicMaterial color="white" /></mesh></group>}
  </group>;
}
function GalleryFrame({item, frame, onOpen}) {
  return <group position={frame.pos} rotation={frame.rot}>
    <mesh castShadow><boxGeometry args={[frame.width+.18, frame.height+.18, .13]}/><meshStandardMaterial color="#95744a" metalness={.85} roughness={.27} /></mesh>
    <mesh position={[0,0,.073]}><boxGeometry args={[frame.width+.045,frame.height+.045,.018]}/><meshStandardMaterial color="#111217" /></mesh>
    {item && <Artwork item={item} onOpen={onOpen} />}
    {!item && <mesh position={[0,0,.088]}><planeGeometry args={[1.47,1.84]}/><meshStandardMaterial color="#171a20" /></mesh>}
    <mesh position={[0, -1.24, .01]}><boxGeometry args={[1.1,.14,.04]}/><meshStandardMaterial color="#a89a81" metalness={.6} /></mesh>
    {item && <pointLight position={[0,1.5,1]} intensity={.95} distance={4} color="#ffe9c8"/>}
  </group>;
}
function Room({media, onOpen}) {
  return <>
    <color attach="background" args={['#07090c']}/>
    <fog attach="fog" args={['#080a0e', 12, 26]}/>
    <ambientLight intensity={.57} color="#b4bfd5"/>
    <hemisphereLight args={['#e3d8c8','#20242e',.7]}/>
    <directionalLight position={[1,7,3]} intensity={1.3} color="#f9dfb9" castShadow shadow-mapSize={[1024,1024]}/>
    <mesh receiveShadow position={[0,-.08,0]}><boxGeometry args={[12,.16,12]}/><meshStandardMaterial color="#252831" roughness={.42} metalness={.25}/></mesh>
    <gridHelper args={[12,24,'#30333b','#30333b']} position={[0,.002,0]}/>
    <mesh receiveShadow position={[0,2.35,-5.52]}><boxGeometry args={[12,4.7,.22]}/><meshStandardMaterial color="#1b1c23" roughness={.94}/></mesh>
    <mesh receiveShadow position={[-5.52,2.35,0]}><boxGeometry args={[.22,4.7,12]}/><meshStandardMaterial color="#202128" roughness={.95}/></mesh>
    <mesh receiveShadow position={[5.52,2.35,0]}><boxGeometry args={[.22,4.7,12]}/><meshStandardMaterial color="#202128" roughness={.95}/></mesh>
    <mesh position={[0,4.72,0]}><boxGeometry args={[12,.16,12]}/><meshStandardMaterial color="#111318"/></mesh>
    <mesh position={[0,.12,-5.34]}><boxGeometry args={[11.8,.21,.13]}/><meshStandardMaterial color="#777061" metalness={.5}/></mesh>
    <mesh position={[-5.34,.12,0]}><boxGeometry args={[.13,.21,11.8]}/><meshStandardMaterial color="#777061" metalness={.5}/></mesh>
    <mesh position={[5.34,.12,0]}><boxGeometry args={[.13,.21,11.8]}/><meshStandardMaterial color="#777061" metalness={.5}/></mesh>
    {FRAMES.map((frame,i)=><GalleryFrame key={i} frame={frame} item={media.find(m=>m.slot===i)} onOpen={onOpen}/>) }
    {[-4.1,-1.35,1.35,4.1].map((x,i)=><group key={i} position={[x,4.54,-4.9]}><mesh><cylinderGeometry args={[.18,.26,.25,16]}/><meshStandardMaterial color="#8f897a" metalness={.85}/></mesh><spotLight position={[0,-.1,0]} target-position={[0,-2.3,-.5]} angle={.45} intensity={12} distance={5} penumbra={.8} color="#ffddaf"/></group>)}
    <group position={[0,0,-.1]}>
      <mesh position={[0,.47,0]} castShadow><boxGeometry args={[2.5,.17,.68]}/><meshStandardMaterial color="#654633" roughness={.67}/></mesh>
      {[-.99,.99].map(x=><mesh key={x} position={[x,.23,0]} castShadow><boxGeometry args={[.12,.46,.5]}/><meshStandardMaterial color="#292e35" metalness={.6}/></mesh>)}
    </group>
    {[-4.3,4.3].map((x,i)=><group key={i} position={[x,0,3.5]}><mesh position={[0,.45,0]}><cylinderGeometry args={[.28,.36,.9,16]}/><meshStandardMaterial color="#292a2e"/></mesh><mesh position={[0,1.13,0]}><sphereGeometry args={[.5,16,12]}/><meshStandardMaterial color={i ? '#465a4b':'#596055'} roughness={1}/></mesh></group>)}
  </>;
}
function Avatar({ keys, joy, angle }) {
  const group = useRef(); const velocity = useRef(new THREE.Vector3()); const facing = useRef(0); const walking = useRef(0);
  const {camera} = useThree();
  useFrame((_, delta) => {
    if (!group.current) return;
    const d = Math.min(delta,.05);
    const dx = (keys.current.has('d') || keys.current.has('arrowright') ? 1:0) - (keys.current.has('a') || keys.current.has('arrowleft') ? 1:0) + joy.current.x;
    const dz = (keys.current.has('s') || keys.current.has('arrowdown') ? 1:0) - (keys.current.has('w') || keys.current.has('arrowup') ? 1:0) + joy.current.z;
    let dir = new THREE.Vector3(dx,0,dz);
    if(dir.lengthSq()>1) dir.normalize();
    dir.applyAxisAngle(new THREE.Vector3(0,1,0),angle.current);
    velocity.current.lerp(dir.multiplyScalar(3), Math.min(1,d*10));
    const old = group.current.position;
    let nextX = THREE.MathUtils.clamp(old.x+velocity.current.x*d,-4.85,4.85);
    let nextZ = THREE.MathUtils.clamp(old.z+velocity.current.z*d,-4.75,4.75);
    if (Math.abs(nextX)<1.55 && Math.abs(nextZ+.1)<.85) {nextX = old.x; nextZ=old.z;}
    old.x=nextX; old.z=nextZ;
    if(velocity.current.lengthSq()>.04){ facing.current=Math.atan2(velocity.current.x,velocity.current.z); walking.current += d*10; }
    group.current.rotation.y=THREE.MathUtils.lerp(group.current.rotation.y,facing.current,Math.min(1,d*12));
    const target = new THREE.Vector3(old.x+Math.sin(angle.current)*4.8,3.05,old.z+Math.cos(angle.current)*4.8);
    camera.position.lerp(target,Math.min(1,d*4.5));
    camera.lookAt(old.x,1.35,old.z);
  });
  return <group ref={group} position={[0,0,3]}>
    <group>
      <mesh castShadow position={[0,1.22,0]}><capsuleGeometry args={[.33,.72,6,12]}/><meshStandardMaterial color="#cf9b6a"/></mesh>
      <mesh castShadow position={[0,1.53,0]}><boxGeometry args={[.72,.81,.4]}/><meshStandardMaterial color="#273b6b" roughness={.9}/></mesh>
      <mesh castShadow position={[0,2.12,0]}><sphereGeometry args={[.31,18,12]}/><meshStandardMaterial color="#d7a57d"/></mesh>
      <mesh castShadow position={[0,2.33,-.035]}><sphereGeometry args={[.315,18,10,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color="#262021"/></mesh>
      {[-.22,.22].map((x,i)=><group key={i}><mesh castShadow position={[x,.46,0]}><capsuleGeometry args={[.12,.69,4,8]}/><meshStandardMaterial color="#1a202c"/></mesh><mesh castShadow position={[x,.12,.09]}><boxGeometry args={[.24,.16,.43]}/><meshStandardMaterial color="#e5e6e9"/></mesh></group>)}
      {[-.48,.48].map((x,i)=><mesh key={i} castShadow position={[x,1.46,0]} rotation={[0,0, x>0?-.18:.18]}><capsuleGeometry args={[.13,.52,4,8]}/><meshStandardMaterial color="#273b6b"/></mesh>)}
    </group>
  </group>;
}
function Gallery({media,onOpen,keys,joy,angle}) {return <Canvas shadows camera={{position:[0,3,8],fov:60,near:.1,far:70}} gl={{antialias:true}} dpr={[1,1.8]}><Room media={media} onOpen={onOpen}/><Avatar keys={keys} joy={joy} angle={angle}/></Canvas>}

function App(){
  const [media,setMedia]=useState(initialMedia), [active,setActive]=useState(null), [uploading,setUploading]=useState(false), [panel,setPanel]=useState(false), [title,setTitle]=useState(localStorage.getItem('muzeycha-title')||'Mening muzeyim'), [full,setFull]=useState(false), [message,setMessage]=useState('');
  const keys=useRef(new Set()), joy=useRef({x:0,z:0}), angle=useRef(0), fileInput=useRef(), stage=useRef(), drag=useRef(null), objectUrls=useRef([]);
  function updateList(rows){objectUrls.current.forEach(url=>URL.revokeObjectURL(url));objectUrls.current=[]; const list=rows.map(item=>{if(!item.file) return item;const url=URL.createObjectURL(item.file);objectUrls.current.push(url);return {...item,url};});setMedia(list);}
  useEffect(()=>{readMedia().then(rows=>{if(rows.length)updateList([...initialMedia.filter(d=>!rows.some(r=>r.slot===d.slot)),...rows]);}).catch(()=>setMessage('Brauzer xotirasini ochib bo‘lmadi.'));return ()=>objectUrls.current.forEach(URL.revokeObjectURL);},[]);
  useEffect(()=>{const down=e=>{if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){e.preventDefault();keys.current.add(k);}};const up=e=>keys.current.delete(e.key.toLowerCase());const blur=()=>keys.current.clear();window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur)}},[]);
  useEffect(()=>{localStorage.setItem('muzeycha-title',title)},[title]);
  async function upload(files){setUploading(true);let rows=[...media];let success=0;
    for(const file of Array.from(files||[])){if(!['image/jpeg','image/png','image/webp','video/mp4','video/webm'].includes(file.type)){setMessage('Faqat JPG, PNG, WebP, MP4 yoki WebM formatlari mumkin.');continue;} if(file.size>70*1024*1024){setMessage('Fayl hajmi 70 MB dan oshmasligi kerak.');continue;}
      const slot=FRAMES.findIndex((_,i)=>!rows.some(m=>m.slot===i&&!m.id.startsWith('demo')));
      if(slot<0){setMessage('8 ta ramka to‘ldi. Avval mavjud faylni o‘chiring.');break;}
      const item={id:crypto.randomUUID(),name:file.name,slot,type:file.type.startsWith('video')?'video':'image',file};
      try{await saveMedia(item);rows=rows.filter(m=>m.slot!==slot);rows.push(item);success++;}catch(err){setMessage('Saqlanmadi: brauzer xotirasi to‘lgan bo‘lishi mumkin.');}
    }
    updateList(rows);setUploading(false);if(success)setMessage(`${success} ta fayl muzeyga qo‘shildi`);if(fileInput.current)fileInput.current.value='';
  }
  async function remove(item){if(!item)return; if(item.id.startsWith('demo')){updateList(media.filter(m=>m.id!==item.id));return;}await removeMedia(item.id);updateList(media.filter(m=>m.id!==item.id));setActive(null);setMessage('Fayl o‘chirildi');}
  async function toggleFull(){if(!document.fullscreenElement){await stage.current?.requestFullscreen?.();setFull(true);}else{await document.exitFullscreen();setFull(false)}}
  const actual=media.filter(m=>!m.id.startsWith('demo')).length;
  function touch(k,down){if(down)keys.current.add(k);else keys.current.delete(k)}
  return <div className="app" ref={stage}>
    <div className="viewport" onPointerDown={e=>{if(e.pointerType==='mouse' && e.button===0 && !e.target.closest('button'))drag.current={x:e.clientX,angle:angle.current}}} onPointerMove={e=>{if(drag.current)angle.current=drag.current.angle+(drag.current.x-e.clientX)*.005}} onPointerUp={()=>drag.current=null} onPointerCancel={()=>drag.current=null}>
      <Gallery media={media} onOpen={setActive} keys={keys} joy={joy} angle={angle}/>
    </div>
    <header className="topbar"><div className="brand"><span className="brand-icon">◆</span> MUZEYCHA <span className="small">3D</span></div><div className="topactions"><span className="desktop-hint"><Gamepad2 size={16}/> WASD — yurish · Sichqoncha — kamera</span><button className="icon-btn" onClick={toggleFull} title="To‘liq ekran">{full?<Minimize2 size={19}/>:<Maximize2 size={19}/>}</button><button className="primary" onClick={()=>setPanel(true)}><Upload size={16}/> Muzeyni tahrirlash</button></div></header>
    <div className="lowerleft"><span className="eyebrow">SIZNING VIRTUAL GALEREYANGIZ</span><h1>{title}</h1><p>{actual} ta shaxsiy media · {FRAMES.length} ta portret joyi</p></div>
    <div className="lowercenter"><MousePointer2 size={16}/> Portretni bosing — kattalashtirib ko‘ring</div>
    <div className="touch-controls"><div className="touch-row"><button onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);touch('w',true)}} onPointerUp={()=>touch('w',false)} onPointerCancel={()=>touch('w',false)}><ArrowUp/></button></div><div className="touch-row">{[['a',ArrowLeft],['s',ArrowDown],['d',ArrowRight]].map(([key,Icon])=><button key={key} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);touch(key,true)}} onPointerUp={()=>touch(key,false)} onPointerCancel={()=>touch(key,false)}><Icon/></button>)}</div></div>
    <div className="camera-controls"><button onClick={()=>angle.current-=.28}>↶</button><span>Kamera</span><button onClick={()=>angle.current+=.28}>↷</button></div>
    {message&&<div className="toast" onClick={()=>setMessage('')}>{message} <X size={14}/></div>}
    {panel&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setPanel(false)}}><aside className="editor"><div className="panelhead"><div><span className="eyebrow">MUZEY SOZLAMALARI</span><h2>Muzeyni tahrirlash</h2></div><button className="icon-btn" onClick={()=>setPanel(false)}><X/></button></div><label className="label">Muzey nomi</label><input value={title} maxLength={48} onChange={e=>setTitle(e.target.value)} placeholder="Mening muzeyim"/><label className="label">Rasm va videolar</label><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" multiple hidden onChange={e=>upload(e.target.files)}/><button className="drop" disabled={uploading} onClick={()=>fileInput.current?.click()}><Upload size={24}/><strong>{uploading?'Yuklanmoqda...':'Rasm yoki video yuklash'}</strong><span>JPG, PNG, WebP, MP4, WebM · 70 MB gacha</span></button><div className="counter">{actual}/8 ta shaxsiy fayl</div><div className="filelist">{media.filter(m=>!m.id.startsWith('demo')).map(m=><div className="file" key={m.id}><span>{m.type==='video'?<Video size={17}/>:<ImageIcon size={17}/>}</span><div><strong>{m.name}</strong><small>Ramka {m.slot+1}</small></div><button className="icon-btn danger" onClick={()=>remove(m)} title="O‘chirish"><Trash2 size={17}/></button></div>)}{actual===0&&<p className="empty">Hozir namuna portretlar ko‘rsatilmoqda. O‘z fayllaringizni yuklang.</p>}</div><div className="note"><Info size={17}/> Fayllar shu brauzerning IndexedDB xotirasida saqlanadi. Bu MVP’da akkaunt, server va ommaviy ulashish mavjud emas.</div><button className="primary done" onClick={()=>setPanel(false)}>Muzeyga qaytish</button></aside></div>}
    {active&&<div className="overlay viewer" onMouseDown={e=>{if(e.target===e.currentTarget)setActive(null)}}><div className="viewer-inner"><div className="viewer-head"><strong>{active.name}</strong><button className="icon-btn" onClick={()=>setActive(null)}><X/></button></div>{active.type==='image'?<img src={active.url} alt={active.name}/>:active.type==='video'?<video key={active.id} src={active.url} controls autoPlay playsInline/>:<div className="demo-view"><span>Namuna san’at asari</span><p>{active.name}</p></div>}</div></div>}
  </div>
}

createRoot(document.getElementById('root')).render(<App/>);
