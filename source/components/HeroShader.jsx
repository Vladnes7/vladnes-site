"use client";

import { useEffect, useRef, useState } from "react";

// Фон первого экрана: дым и светящиеся лучи на WebGL2. Шейдер Матиаса Хуррле (@atzedent), цвета перекрашены
// из янтарных в сине-голубые (акцент сайта #0099FF и бирюзовый). Курсор шейдеру не нужен, поэтому
// от оригинала остались только resolution и time.
// Нет WebGL2 или шейдер не собрался — показываем прежнее мягкое свечение .glow.
// Экономия: рисуем на части разрешения (дым размытый), останавливаемся вне экрана и на скрытой вкладке,
// при слабом железе разрешение само падает. При prefers-reduced-motion рисуется один кадр.

const VERT = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`;

const FRAG = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)
float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}
float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float
  a=rnd(i),
  b=rnd(i+vec2(1,0)),
  c=rnd(i+vec2(0,1)),
  d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
float fbm(vec2 p) {
  float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
  for (int i=0; i<5; i++) {
    t+=a*noise(p);
    p*=2.*m;
    a*=.5;
  }
  return t;
}
float clouds(vec2 p) {
  float d=1., t=.0;
  for (float i=.0; i<3.; i++) {
    float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
    t=mix(t,d,a);
    d=a;
    p*=2./(i+1.);
  }
  return t;
}
void main(void) {
  vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
  vec3 col=vec3(0);
  float bg=clouds(vec2(st.x+T*.5,-st.y));
  uv*=1.-.3*(sin(T*.2)*.5+.5);
  for (float i=1.; i<12.; i++) {
    uv+=.1*cos(i*vec2(.1+.01*i, .8)+i*i+T*.5+.1*uv.x);
    vec2 p=uv;
    float d=length(p);
    // Свечение лучей: от синего #0099FF к бирюзовому, цвет зависит от номера слоя.
    vec3 tint=mix(vec3(.12,.55,1.), vec3(.2,.9,.95), .5+.5*sin(i*1.7));
    col+=.00125/d*tint*(1.+cos(sin(i)*2.));
    float b=noise(i+p+bg*1.731);
    col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)))*vec3(.62,.84,1.);
    // Дым: глубокий синий вместо коричневого.
    col=mix(col,vec3(bg*.05,bg*.19,bg*.42),d);
  }
  O=vec4(col,1);
}`;

const START = 6; // секунд: дым уже сложился к первому кадру
const SLOW_MS = 30; // средний кадр дольше этого — снижаем разрешение

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Шейдер не собрался:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function HeroShader() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, depth: false, stencil: false });
    if (!gl) {
      setFallback(true);
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    if (!vs || !fs) {
      setFallback(true);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      setFallback(true);
      return;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(program);
    const uRes = gl.getUniformLocation(program, "resolution");
    const uTime = gl.getUniformLocation(program, "time");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scale = window.innerWidth < 768 ? 0.45 : 0.65;
    let clock = START;
    let raf = 0;
    let running = false;
    let last = 0;
    let frames = 0;
    let acc = 0;

    const draw = () => {
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, clock);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const resize = () => {
      canvas.width = Math.max(2, Math.round(wrap.clientWidth * scale));
      canvas.height = Math.max(2, Math.round(wrap.clientHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      draw();
    };

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(now - last, 100);
      last = now;
      clock += dt / 1000;
      draw();
      acc += dt;
      if (++frames === 40) {
        if (acc / frames > SLOW_MS && scale > 0.3) {
          scale = Math.max(0.3, scale * 0.8);
          resize();
        }
        frames = 0;
        acc = 0;
      }
    };

    const start = () => {
      if (running || reduced) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    let inView = true;
    const sync = () => (inView && !document.hidden ? start() : stop());

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    observer.observe(wrap);
    const resizer = new ResizeObserver(resize);
    resizer.observe(wrap);
    document.addEventListener("visibilitychange", sync);

    const onLost = (event) => {
      event.preventDefault();
      stop();
      setFallback(true);
    };
    canvas.addEventListener("webglcontextlost", onLost);

    resize();
    sync();

    return () => {
      stop();
      observer.disconnect();
      resizer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  if (fallback) {
    return (
      <div className="glow" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    );
  }

  return (
    <div className="shader" ref={wrapRef} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
