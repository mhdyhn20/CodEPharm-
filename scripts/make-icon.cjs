// Clean 256x256 PNG icon: teal rounded-square + white C + green plus.
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const SIZE = 256;
const R = 56;

function lerp(a, b, t) { return a + (b - a) * t; }
function mix(c1, c2, t) {
  return [
    Math.round(lerp(c1[0], c2[0], t)),
    Math.round(lerp(c1[1], c2[1], t)),
    Math.round(lerp(c1[2], c2[2], t)),
    255,
  ];
}
const BG1 = [14,110,115];
const BG2 = [8,74,77];

function inRoundedSquare(x, y) {
  if (x >= R && x < SIZE - R) return y >= 0 && y < SIZE;
  if (y >= R && y < SIZE - R) return x >= 0 && x < SIZE;
  const cx = x < R ? R : SIZE - 1 - R;
  const cy = y < R ? R : SIZE - 1 - R;
  const dx = x - cx, dy = y - cy;
  return dx*dx + dy*dy <= R*R;
}

const pixels = Buffer.alloc(SIZE*SIZE*4);
for (let y=0;y<SIZE;y++){
  for (let x=0;x<SIZE;x++){
    const i=(y*SIZE+x)*4;
    if(!inRoundedSquare(x,y)){ pixels[i+3]=0; continue; }
    const t=(x+y)/(2*(SIZE-1));
    const c=mix(BG1,BG2,t);
    pixels[i]=c[0]; pixels[i+1]=c[1]; pixels[i+2]=c[2]; pixels[i+3]=255;
  }
}

function setPx(x,y,c){
  x=Math.round(x); y=Math.round(y);
  if(x<0||y<0||x>=SIZE||y>=SIZE) return;
  const i=(y*SIZE+x)*4;
  if(pixels[i+3]===0) return;
  pixels[i]=c[0]; pixels[i+1]=c[1]; pixels[i+2]=c[2]; pixels[i+3]=255;
}

// Draw a thick circular ARC between two angles using a ring, opening on the LEFT.
// We'll draw a ring from angle ~= -50deg (lower) to +230deg going the long way (i.e. right side C).
function drawRing(cx, cy, rOuter, rInner, color, startDeg, endDeg) {
  // Convert to screen angle (0 = right, +y is DOWN). We want an opening on the left (~180deg).
  // Arc going clockwise from startDeg to endDeg; degrees measured 0=right, increasing clockwise.
  const s = startDeg * Math.PI/180;
  const e = endDeg * Math.PI/180;
  for (let y=Math.max(0,cy-rOuter); y<=Math.min(SIZE-1,cy+rOuter); y++){
    for (let x=Math.max(0,cx-rOuter); x<=Math.min(SIZE-1,cx+rOuter); x++){
      const dx=x-cx, dy=y-cy;
      const d2=dx*dx+dy*dy;
      if(d2>rOuter*rOuter||d2<rInner*rInner) continue;
      let a = Math.atan2(dy,dx); if(a<0) a+=2*Math.PI;
      let s2=s, e2=e; if(s2<0)s2+=2*Math.PI; if(e2<0)e2+=2*Math.PI;
      let inside=false;
      if (s2 <= e2) { inside = a >= s2 && a <= e2; }
      else { inside = a >= s2 || a <= e2; }
      if(inside) setPx(x,y,color);
    }
  }
}

function fillEllipse(cx, cy, rx, ry, color){
  for(let y=Math.max(0,cy-ry);y<=Math.min(SIZE-1,cy+ry);y++){
    for(let x=Math.max(0,cx-rx);x<=Math.min(SIZE-1,cx+rx);x++){
      const dx=(x-cx)/rx, dy=(y-cy)/ry;
      if(dx*dx+dy*dy<=1) setPx(x,y,color);
    }
  }
}
function fillRect(x,y,w,h,color){
  for(let yy=y;yy<y+h;yy++) for(let xx=x;xx<x+w;xx++) setPx(xx,yy,color);
}

// C centered (offset left a bit so + balances it)
const CX = SIZE/2 - 8;
const CY = SIZE/2 + 6;
drawRing(CX, CY, 68, 38, [255,255,255], -60, 240);
// Round the ends of the C with ellipses
// Compute end positions
function ptAt(cx,cy,rad,deg){
  const a=deg*Math.PI/180;
  return [cx+Math.cos(a)*rad, cy+Math.sin(a)*rad];
}
// End 1 (top-right ~ 240deg? Wait our ring went clockwise from -60 to 240 — opening is on left between 240 and -60 (i.e., -120)
// Ends are at -60deg (lower-left) and 240deg (= -120, upper-left)
{
  const [ex1, ey1] = ptAt(CX,CY,53,-60);
  fillEllipse(ex1,ey1,15,15,[255,255,255]);
  const [ex2, ey2] = ptAt(CX,CY,53,240);
  fillEllipse(ex2,ey2,15,15,[255,255,255]);
  // cover inner part of end-caps using bg color so they look like terminals
  const bg = mix(BG1,BG2,((ex1+ey1)/(2*(SIZE-1))));
  const [ix1, iy1] = ptAt(CX,CY,38,-60);
  fillEllipse(ix1,iy1,12,12,[bg[0],bg[1],bg[2]]);
  const bg2 = mix(BG1,BG2,((ex2+ey2)/(2*(SIZE-1))));
  const [ix2, iy2] = ptAt(CX,CY,38,240);
  fillEllipse(ix2,iy2,12,12,[bg2[0],bg2[1],bg2[2]]);
}

// Green plus at top-right
{
  const gx = SIZE/2 + 46;
  const gy = SIZE/2 - 50;
  const GREEN = [47,191,163];
  fillRect(gx-8, gy-28, 16, 56, GREEN);
  fillRect(gx-28, gy-8, 56, 16, GREEN);
}

// PNG encode
function crc32(buf){
  let c;
  const t = crc32.t || (crc32.t = (()=>{const a=new Uint32Array(256);for(let n=0;n<256;n++){c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;a[n]=c>>>0;}return a;})());
  c=0xffffffff;
  for(let i=0;i<buf.length;i++) c = t[(c^buf[i])&0xff] ^ (c>>>8);
  return (c^0xffffffff)>>>0;
}
function chunk(type,data){
  const len=Buffer.alloc(4); len.writeUInt32BE(data.length,0);
  const tb=Buffer.from(type,'ascii');
  const crc=Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([tb,data])),0);
  return Buffer.concat([len,tb,data,crc]);
}

const sig=Buffer.from([137,80,78,71,13,10,26,10]);
const ihdr=Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE,0); ihdr.writeUInt32BE(SIZE,4); ihdr[8]=8; ihdr[9]=6; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0;

const raw=Buffer.alloc(SIZE*(SIZE*4+1));
for(let y=0;y<SIZE;y++){
  raw[y*(SIZE*4+1)]=0;
  pixels.copy(raw,y*(SIZE*4+1)+1,y*SIZE*4,(y+1)*SIZE*4);
}
const idat=zlib.deflateSync(raw);
const png=Buffer.concat([sig,chunk('IHDR',ihdr),chunk('IDAT',idat),chunk('IEND',Buffer.alloc(0))]);
const out=path.join(__dirname,'..','build','icon.png');
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,png);
console.log('Wrote',out,png.length);
