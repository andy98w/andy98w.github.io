import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// One coordinate system: courtyard z=0..20, workshop z=-12..0,
// connected terrace x=8..24. Camera crosses the front and east door openings.
export function buildVilla(materialSets = {}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#b8d8e8');
  scene.fog = new THREE.FogExp2('#c5dce0', .009);
  const mats = {
    stone: new THREE.MeshStandardMaterial({ color: '#d9c5a0', roughness: .92 }),
    trim: new THREE.MeshStandardMaterial({ color: '#ece0c2', roughness: .8 }),
    clay: new THREE.MeshStandardMaterial({ color: '#a95635', roughness: .88 }),
    wood: new THREE.MeshStandardMaterial({ color: '#654329', roughness: .85 }),
    darkwood: new THREE.MeshStandardMaterial({ color: '#352f22', roughness: .88 }),
    brass: new THREE.MeshStandardMaterial({ color: '#c6a35c', metalness: .75, roughness: .3 }),
    leaf: new THREE.MeshStandardMaterial({ color: '#65754b', roughness: .95 }),
    water: new THREE.MeshStandardMaterial({ color: '#609db2', roughness: .36, metalness: .1 }),
    paper: new THREE.MeshStandardMaterial({ color: '#eee2bc', roughness: 1 }),
    light: new THREE.MeshStandardMaterial({ color:'#ffda85', emissive:'#ffc068',emissiveIntensity:.8 }),
  };
  for(const [name, key] of [['stone','stone'],['trim','plaster'],['wood','wood'],['darkwood','wood']]){
    const maps=materialSets[key];if(!maps)continue;
    mats[name].map=maps.color;mats[name].normalMap=maps.normal;mats[name].roughnessMap=maps.rough;
    mats[name].normalScale.set(.55,.55);mats[name].color.set(name==='darkwood'?'#88745f':'#f5e4c8');
  }
  const boxGeo=new THREE.BoxGeometry(1,1,1);
  function box(x,y,z,w,h,d,mat=mats.stone,parent=scene){const geo=boxGeo.clone();geo.scale(w,h,d);
    const uv=geo.attributes.uv;const dimensions=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
    for(let face=0;face<6;face++)for(let j=0;j<4;j++){const i=face*4+j;uv.setXY(i,uv.getX(i)*dimensions[face][0]/2.5,uv.getY(i)*dimensions[face][1]/2.5);}
    const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function cyl(x,y,z,r,h,mat=mats.stone,parent=scene){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,12),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function arch(x,y,z,r,t,depth,rotation=0){
    const shape=new THREE.Shape();shape.absarc(0,0,r+t,0,Math.PI,false);shape.absarc(0,0,r,Math.PI,0,true);shape.closePath();
    const m=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.04,bevelThickness:.03,curveSegments:24}),mats.trim);
    m.position.set(x,y,z);m.rotation.y=rotation;m.castShadow=true;m.receiveShadow=true;scene.add(m);
    // Radial stone joints make the curve read as masonry.
    for(let i=0;i<=11;i++){const a=i*Math.PI/11;const line=box(0,0,0,.025,t+.04,depth+.06,mats.stone);line.position.set(x+Math.cos(a)*(r+t/2)*Math.cos(rotation),y+Math.sin(a)*(r+t/2),z-Math.cos(a)*(r+t/2)*Math.sin(rotation)+depth/2);line.rotation.z=a-Math.PI/2;}
  }
  scene.add(new THREE.HemisphereLight('#e6f3ff','#a3976d',1.3));
  const sun=new THREE.DirectionalLight('#fff0cf',2.8);sun.position.set(-18,28,12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-30,right:30,top:25,bottom:-25,near:1,far:90});sun.shadow.normalBias=.025;sun.shadow.radius=3;scene.add(sun);
  const bounce=new THREE.PointLight('#ffe1ad',35,20,2);bounce.position.set(0,4,-6);scene.add(bounce);
  box(3,-.4,3,43,.8,40,mats.stone);
  // Stone paving, individually colored but rendered in one draw call.
  const paving=new THREE.InstancedMesh(new THREE.BoxGeometry(.96,.09,.96),mats.trim,40*32);let n=0;const dummy=new THREE.Object3D();
  for(let x=-16;x<24;x++)for(let z=-12;z<20;z++){dummy.position.set(x+.5,.04,z+.5);dummy.updateMatrix();paving.setMatrixAt(n,dummy.matrix);paving.setColorAt(n++,new THREE.Color().setHSL(.105,.22,.68+((x*17+z*13+3000)%9)*.012));}paving.receiveShadow=true;scene.add(paving);
  // Main room, generous front arched entrance and open side passage to terrace.
  box(-5.2,2.65,0,5.6,5.3,.65);box(5.2,2.65,0,5.6,5.3,.65);
  box(-8,2.65,-6,.65,5.3,12);box(0,2.65,-12,16,5.3,.65);
  box(8,2.65,-1.5,.65,5.3,3);box(8,2.65,-10.5,.65,5.3,3);
  box(8,4.9,-6,.65,.8,6);
  arch(0,2.6,-.34,2.4,.35,.72);box(-2.58,1.3,0,.36,2.6,.78,mats.trim);box(2.58,1.3,0,.36,2.6,.78,mats.trim);
  // Window recesses and timber shutters on the exterior walls.
  for(const x of [-5.3,5.3]){box(x,3, .35,1.5,2.2,.08,mats.darkwood);arch(x,3.4,.35,.75,.18,.18);for(const dx of [-.48,0,.48])box(x+dx,2.85,.45,.08,1.8,.1,mats.wood);}
  // Gabled roof with modeled terracotta channels.
  const roofShape=new THREE.Shape();roofShape.moveTo(-8.7,5.3);roofShape.lineTo(0,7.8);roofShape.lineTo(8.7,5.3);roofShape.closePath();
  const roof=new THREE.Mesh(new THREE.ExtrudeGeometry(roofShape,{depth:13,bevelEnabled:false}),mats.clay);roof.position.z=-12.5;roof.castShadow=true;scene.add(roof);
  const tileGeo=new THREE.CylinderGeometry(.18,.18,.69,8,1,true,0,Math.PI);
  const tiles=new THREE.InstancedMesh(tileGeo,mats.clay,51*19);n=0;
  for(let ix=0;ix<51;ix++)for(let iz=0;iz<19;iz++){const x=-8.5+ix*.34;dummy.position.set(x,7.84-Math.abs(x)*2.5/8.7,-12.2+iz*.68);dummy.rotation.set(Math.PI/2,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();tiles.setMatrixAt(n,dummy.matrix);tiles.setColorAt(n++,new THREE.Color().setHSL(.04,.43,.38+(ix+iz)%5*.023));}tiles.castShadow=true;scene.add(tiles);dummy.rotation.set(0,0,0);
  for(let z=-11;z<=0;z+=2.5)box(0,5.1,z,16,.24,.24,mats.darkwood);
  // Courtyard arcade on the west side, joined to the room.
  for(let z=3;z<=18;z+=5){cyl(-12,1.8,z,.22,3.6,mats.trim);box(-12,.2,z,.7,.35,.7,mats.trim);arch(-12,3.4,z+2.5,2.2,.28,.5,Math.PI/2);}
  box(-12,6,9,1,1,20,mats.stone);
  // Terrace balustrade, leaving the east-room doorway unobstructed.
  for(let x=9;x<=24;x+=1.1){cyl(x,.72,-12,.095,1.35,mats.trim);box(x,1.48,-12,.35,.12,.35,mats.trim);}
  box(16.5,1.6,-12,16,.18,.45,mats.trim);box(16.5,.15,-12,16,.25,.5,mats.trim);
  for(let z=-11;z<=1;z+=1.1)cyl(24,.72,z,.095,1.35,mats.trim);box(24,1.6,-5.5,.45,.18,14,mats.trim);
  // Connected tower beside the workshop.
  box(-10,5,-9,4,10,5);box(-10,10,-9,4.5,.4,5.5,mats.trim);
  for(let x=-11.7;x<-8;x+=1.1)box(x,10.5,-6.5,.55,.9,.6,mats.trim);
  // Workbench, shelves, books, and an animated brass armillary.
  box(0,1.4,-9,7,.25,1.7,mats.wood);for(const x of [-3,3])for(const z of [-9.6,-8.4])box(x,.7,z,.15,1.4,.15,mats.darkwood);
  for(let y=1;y<4.5;y+=1.1){box(-7.45,y,-7, .7,.12,5,mats.wood);for(let i=0;i<10;i++){const mat=new THREE.MeshStandardMaterial({color:['#526557','#ad6942','#c3a464','#475666'][i%4],roughness:.95});box(-7.43,y+.3,-9.1+i*.42,.5,.45+(i%3)*.08,.25,mat);}}
  const instrument=new THREE.Group();instrument.position.set(1.8,2.6,-9);scene.add(instrument);cyl(1.8,1.75,-9,.2,.5,mats.brass);
  for(let i=0;i<4;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.7+i*.06,.023,8,80),mats.brass);ring.rotation.set(i*.7,i*.8,.3);instrument.add(ring);}
  instrument.add(new THREE.Mesh(new THREE.SphereGeometry(.18,24,16),mats.brass));
  box(-1,1.55,-8.9,1.5,.025,.8,mats.paper);
  // Pots and trees are actual meshes, shared in both exterior views.
  const leafGeo=new THREE.SphereGeometry(1,6,4);
  const leafMat=new THREE.MeshStandardMaterial({color:'#70804c',roughness:.85});
  const leafInstances=new THREE.InstancedMesh(leafGeo,leafMat,6*360);let leafIndex=0;
  const seed=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
  function tree(x,z,index){
    const profile=[[.3,0],[.4,.05],[.53,.3],[.58,.65],[.52,.87],[.6,.9],[.6,.96],[.5,.98]].map(p=>new THREE.Vector2(...p));
    const pot=new THREE.Mesh(new THREE.LatheGeometry(profile,32),mats.clay);pot.position.set(x,.06,z);pot.castShadow=true;pot.receiveShadow=true;scene.add(pot);
    cyl(x,1.7,z,.065,2.4,mats.wood);
    for(let j=0;j<5;j++){const branch=cyl(x+Math.cos(j*2.4)*.3,2.1+j*.13,z+Math.sin(j*2.4)*.3,.026,1.15,mats.wood);branch.rotation.z=Math.cos(j*2.4)*.7;branch.rotation.x=Math.sin(j*2.4)*.7;}
    for(let i=0;i<360;i++){const k=i+index*360;const a=seed(k)*Math.PI*2,r=Math.sqrt(seed(k+1234))*.92;
      dummy.position.set(x+Math.cos(a)*r,2.2+seed(k+2345)*1.3,z+Math.sin(a)*r);
      dummy.rotation.set(seed(k+42)*3,seed(k+77)*6,seed(k+22)*3);dummy.scale.set(.11,.025,.035);dummy.updateMatrix();
      leafInstances.setMatrixAt(leafIndex,dummy.matrix);leafInstances.setColorAt(leafIndex++,new THREE.Color().setHSL(.22+seed(k)*.04,.25,.32+seed(k+8)*.16));
    }
  }
  [[-10,1],[10,2],[-10,15],[20,-10],[21,-1],[-6,5]].forEach(([x,z],i)=>tree(x,z,i));
  leafInstances.castShadow=true;leafInstances.receiveShadow=true;scene.add(leafInstances);
  // Courtyard basin and rippling water.
  cyl(-5,.4,11,1.8,.65,mats.trim);const pool=new THREE.Mesh(new THREE.CircleGeometry(1.5,64),mats.water);pool.rotation.x=-Math.PI/2;pool.position.set(-5,.74,11);scene.add(pool);cyl(-5,1.25,11,.2,1.2,mats.trim);
  const lake=new THREE.Mesh(new THREE.PlaneGeometry(300,240),mats.water);lake.rotation.x=-Math.PI/2;lake.position.set(20,-3,-100);scene.add(lake);
  for(let i=0;i<14;i++){const hill=new THREE.Mesh(new THREE.IcosahedronGeometry(1,2),new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(.25,.13,.43+i*.013),roughness:1}));hill.position.set(-100+i*17,-3,-95-(i%3)*12);hill.scale.set(17,12+(i%4)*7,24);scene.add(hill);}
  return {scene,instrument};
}

export class VillaWorld {
 constructor(host){
  this.host=host;this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.shadowMap.autoUpdate=false;this.renderer.shadowMap.needsUpdate=true;
  this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.05;
  host.appendChild(this.renderer.domElement);
  this.textures=[];const loader=new THREE.TextureLoader();const sets={};
  for(const name of ['stone','wood','plaster']){sets[name]={};for(const kind of ['color','normal','rough']){
    const t=loader.load(`/assets/materials/${name}-${kind}.webp`,()=>{this.renderer.shadowMap.needsUpdate=true;this.draw();});
    t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,this.renderer.capabilities.getMaxAnisotropy());
    if(kind==='color')t.colorSpace=THREE.SRGBColorSpace;sets[name][kind]=t;this.textures.push(t);
  }}
  const built=buildVilla(sets);this.scene=built.scene;this.instrument=built.instrument;
  const pmrem=new THREE.PMREMGenerator(this.renderer);const room=new RoomEnvironment();
  this.envTarget=pmrem.fromScene(room,.04);this.scene.environment=this.envTarget.texture;this.scene.environmentIntensity=.35;room.dispose();pmrem.dispose();
  this.camera=new THREE.PerspectiveCamera(48,1,.1,300);this.progress=0;this.targetProgress=0;this.paused=false;
  this.path=new THREE.CatmullRomCurve3([[11,7.5,23],[3,4,14],[0,2.9,7],[0,2.8,-4],[5,2.7,-6],[10,2.9,-6],[18,4,-5]].map(p=>new THREE.Vector3(...p)),false,'centripetal');
  this.targets=[[0,2,0],[0,2,-4],[0,2,-7],[4,2,-9],[13,2,-6],[22,2,-10],[27,1,-30]].map(p=>new THREE.Vector3(...p));
  this.look=new THREE.Vector3();this.resize=()=>{this.renderer.setSize(innerWidth,innerHeight);this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();this.draw();};
  this.art=[];
  const referenceCamera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,300);
  referenceCamera.position.copy(this.path.getPoint(0));referenceCamera.lookAt(this.targets[0]);referenceCamera.updateMatrixWorld();
  for(const [file,distance] of [['villa-rear.webp',24],['villa-foreground.webp',18]]){
    const t=loader.load('/assets/'+file,()=>this.draw());t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,this.renderer.capabilities.getMaxAnisotropy());this.textures.push(t);
    const material=new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,depthTest:false,toneMapped:false});
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),material);mesh.position.set(0,0,-distance).applyMatrix4(referenceCamera.matrixWorld);mesh.quaternion.copy(referenceCamera.quaternion);mesh.renderOrder=distance===24?10:11;
    mesh.userData.distance=distance;this.scene.add(mesh);this.art.push(mesh);
  }
  const resizeBase=this.resize;this.resize=()=>{for(const mesh of this.art){const h=2*mesh.userData.distance*Math.tan(THREE.MathUtils.degToRad(24));const aspect=1586/992;const height=Math.max(h,h*(innerWidth/innerHeight)/aspect);mesh.scale.set(height*aspect,height,1);}resizeBase();};
  this.resize();window.addEventListener('resize',this.resize);this.last=performance.now();
  this.tick=now=>{this.frame=requestAnimationFrame(this.tick);if(document.hidden||this.paused)return;const dt=Math.min((now-this.last)/1000,.05);this.last=now;if(!this.paused){this.progress=THREE.MathUtils.damp(this.progress,this.targetProgress,6,dt);this.instrument.rotation.y+=dt*.07;}this.draw();};this.frame=requestAnimationFrame(this.tick);
 }
 setProgress(value,immediate=false){this.targetProgress=THREE.MathUtils.clamp(value,0,1);if(immediate||this.paused){this.progress=this.targetProgress;this.draw();}}
 draw(){if(!this.camera)return;
  const artBlend=1-THREE.MathUtils.smoothstep(this.progress,.045,.19);
  for(const mesh of this.art||[]){mesh.material.opacity=artBlend;mesh.visible=artBlend>.001;}
  document.body.classList.toggle('art-opening',artBlend>.5);
  // Keep the artwork camera move small enough to preserve projection quality.
  const cameraProgress=this.progress<.19?THREE.MathUtils.lerp(this.progress*.18,this.progress,THREE.MathUtils.smoothstep(this.progress,.045,.19)):this.progress;
  this.camera.position.copy(this.path.getPoint(cameraProgress));const t=cameraProgress*6,i=Math.min(5,Math.floor(t));this.look.copy(this.targets[i]).lerp(this.targets[i+1],t-i);this.camera.lookAt(this.look);this.renderer.render(this.scene,this.camera);}
 dispose(){cancelAnimationFrame(this.frame);window.removeEventListener('resize',this.resize);this.scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of [o.material].flat())m.dispose();}});this.textures?.forEach(t=>t.dispose());this.envTarget?.dispose();this.renderer.dispose();this.renderer.domElement.remove();document.body.classList.remove("art-opening");}
}
