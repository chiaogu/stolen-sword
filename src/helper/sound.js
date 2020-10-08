let zzfxV=.3    // volume
let zzfx=       // play sound
(q=1,k=.05,c=220,e=0,t=0,u=.1,r=0,F=1,v=0,z=0,w=0,A=0,l=0,B=0,x=0,G=0,d=0,y=1,m=0,C=0)=>{let b=2*Math.PI,H=v*=500*b/zzfxR**2,I=(0<x?1:-1)*b/4,D=c*=(1+2*k*Math.random()-k)*b/zzfxR,Z=[],g=0,E=0,a=0,n=1,J=0,K=0,f=0,p,h;e=99+zzfxR*e;m*=zzfxR;t*=zzfxR;u*=zzfxR;d*=zzfxR;z*=500*b/zzfxR**3;x*=b/zzfxR;w*=b/zzfxR;A*=zzfxR;l=zzfxR*l|0;for(h=e+m+t+u+d|0;a<h;Z[a++]=f)++K%(100*G|0)||(f=r?1<r?2<r?3<r?Math.sin((g%b)**3):Math.max(Math.min(Math.tan(g),1),-1):1-(2*g/b%2+2)%2:1-4*Math.abs(Math.round(g/b)-g/b):Math.sin(g),f=(l?1-C+C*Math.sin(2*Math.PI*a/l):1)*(0<f?1:-1)*Math.abs(f)**F*q*zzfxV*(a<e?a/e:a<e+m?1-(a-e)/m*(1-y):a<e+m+t?y:a<h-d?(h-a-d)/u*y:0),f=d?f/2+(d>a?0:(a<h-d?1:(h-a)/d)*Z[a-d|0]/2):f),p=(c+=v+=z)*Math.sin(E*x-I),g+=p-p*B*(1-1E9*(Math.sin(a)+1)%2),E+=p-p*B*(1-1E9*(Math.sin(a)**2+1)%2),n&&++n>A&&(c+=w,D+=w,n=0),!l||++J%l||(c=D,v=H,n=n||1);q=zzfxX.createBuffer(1,h,zzfxR);q.getChannelData(0).set(Z);c=zzfxX.createBufferSource();c.buffer=q;c.connect(zzfxX.destination);c.start();return c}
let zzfxX=new(window.AudioContext||webkitAudioContext) // audio context
let zzfxR=22050 // sample rate

const sounds = [
  [,0,1e3,.01,.08,.09,4,,-20.1,8.4,,,,1,,,,.51,.02], //slash
  [1.5,.5,90,,,1,1,1.91,,,,,,5,50,3], //damage
  [,,1313,,.08,.16,3,.04,,,-23,.09,,.4,,.05,,.21,.13,.05], // bounce
  [,,1774,.03,,.06,4,.01,,,-697,.03,,5,6,,.13,.18,.01,.5], // jump
  [,0,260,,,1,,.6], //harmony
];

const soundtime = [];

export const playHarmony = () => {
  const now = Date.now();
  if(!soundtime[4] || (now - soundtime[4] > 200)) {
    soundtime[4] = now;
    [130.8, 164.8, 220, 261.6, 329.6, 440].forEach(p => {
      sounds[4][2] = p;
      zzfx(...sounds[4]);
    })
  }
}

export const playSound = (index, interval = 200) => {
  const now = Date.now();
  if(!soundtime[index] || now - soundtime[index] > interval) {
    zzfx(...sounds[index]);
    soundtime[index] = now;
  }
}

export function resumeAudio() {
  zzfxX.resume();
}