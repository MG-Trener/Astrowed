// Lazy-loaded, dependency-free WebGL renderer. Time is supplied by the owner so
// pause, tab visibility and context restoration never jump the simulation.
const vertex = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragment = `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform float still;
uniform sampler2D galaxy;

mat2 turn(float a) { float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
float hash(vec3 p) {
  p=fract(p*.3183099+vec3(.13,.27,.41)); p*=17.0;
  return fract(p.x*p.y*p.z*(p.x+p.y+p.z));
}
float noise(vec3 p) {
  vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),
                 mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
                 mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float fbm(vec3 p) {
  float f=0.0, a=.55;
  for(int i=0;i<4;i++) { f+=a*noise(p); p=p*2.03+vec3(3.1,7.4,1.7); a*=.49; }
  return f;
}

vec3 galaxyLight(vec2 p, float inclination, float angle, float seed) {
  p=turn(angle)*p; p.y/=inclination;
  float r=length(p);
  if(r>1.08) return vec3(0);
  // Differential rotation: inner stars orbit faster than the outer arms.
  vec2 orbit=turn(time*.009+sin(time*.018)*.13/(.4+sqrt(r+.01))+seed)*p;
  vec2 drift=vec2(noise(vec3(orbit*9.0,time*.035)),noise(vec3(orbit*9.0+4.0,time*.025)))-.5;
  vec2 uv=.5+orbit*.48+drift*.006*smoothstep(.12,.65,r);
  vec3 light=texture2D(galaxy,clamp(uv,.001,.999)).rgb;
  float grain=fbm(vec3(orbit*35.0,time*.03+seed));
  light*=.85+.3*grain;
  // A thin moving ionised-dust veil, with a separate warm central bulge.
  light+=vec3(.2,.29,.42)*pow(grain,5.0)*exp(-r*3.0)*.2;
  light+=vec3(1.0,.74,.43)*exp(-r*r*190.0)*.06;
  return light*(1.0-smoothstep(.72,1.05,r));
}

vec3 supernova(vec2 p, float age, float seed) {
  if(still>.5 || age>36.0 || length(p)>1.65) return vec3(0);
  float onset=smoothstep(1.2,3.2,age);
  float expansion=1.0-exp(-max(age-1.7,0.0)*.095);
  float radius=.025+expansion*.89;
  float flash=exp(-pow((age-2.1)/.68,2.0));
  float fade=(1.0-smoothstep(21.0,36.0,age))*onset;
  float d=length(p);
  vec3 light=vec3(1.0,.87,.68)*(.045+flash*.8)*exp(-d*d/(.0008+flash*.018));
  light+=vec3(.4,.62,1.0)*flash*.15*exp(-d*d/.12);
  if(d>radius*1.65 || fade<.001) return light;
  // Integrate emissive gas through a turbulent 3D shell, not a flat ring.
  // The field moves with the ejecta; smaller eddies continue to evolve.
  float stepSize=3.2/32.0;
  float transmission=1.0;
  for(int i=0;i<32;i++) {
    float z=-1.6+(float(i)+.5)*stepSize;
    vec3 v=vec3(p,z*radius)/radius;
    v.xy=turn(seed*.7)*v.xy;
    v.x*=1.06; v.y*=.93;
    float rr=length(v);
    if(rr>1.65 || rr<.3) continue;
    vec3 field=v*3.8+vec3(seed,seed*.7,age*.024);
    float cloud=fbm(field);
    float angular=fbm(normalize(v)*3.2+seed);
    float crumple=.42+angular*1.24+noise(field*2.4)*.12;
    float shell=exp(-pow((rr-crumple)/.095,2.0));
    float knots=fbm(field*2.1+cloud*2.0);
    float filament=pow(max(0.0,1.0-abs(knots-.51)*6.5),3.0);
    float density=shell*(.025+filament*2.8)*smoothstep(.32,.72,cloud);
    float plumes=pow(smoothstep(.48,.72,angular),2.0)*exp(-pow((rr-1.23)/.2,2.0));
    density+=plumes*filament*.55;
    float inner=exp(-pow((rr-.66)/.23,2.0))*pow(cloud,4.0)*.22;
    density+=inner;
    vec3 hot=vec3(1.0,.36,.075);
    vec3 cool=vec3(.16,.48,.9);
    vec3 gas=mix(hot,cool,smoothstep(.88,1.3,rr)*.72+smoothstep(12.0,32.0,age)*.18);
    gas=mix(gas,vec3(1.0,.84,.53),filament*.38*(1.0-smoothstep(5.0,17.0,age)));
    float opacity=1.0-exp(-density*.34);
    light+=transmission*gas*opacity*fade*(1.1+flash*.8);
    transmission*=1.0-opacity*.48;
  }
  return light;
}

void main() {
  vec2 uv=gl_FragCoord.xy/resolution;
  uv.y=1.0-uv.y;
  float unit=min(resolution.x,resolution.y);
  vec2 ratio=resolution/unit;
  bool mobile=resolution.x/resolution.y<.8;
  vec3 col=galaxyLight((uv-vec2(.12,.15))*ratio/.72,.66,-.42,0.0)*.4;
  col+=galaxyLight((uv-vec2(.93,.88))*ratio/.64,.36,.58,2.8)*.32;
  vec2 novaCenter=mobile ? vec2(.85,.33) : vec2(.84,.34);
  col+=supernova((uv-novaCenter)*ratio/.11,mod(time+1.3,180.0),4.2)*.7;
  // Reduce luminance behind the main reading column; retain detail at the edges.
  col*=1.0-.3*exp(-pow((uv.x-.5)*3.2,2.0));
  col=1.0-exp(-col*1.25);
  gl_FragColor=vec4(col,1.0);
}
`;

export type SkyRenderer = {
  draw: (time: number, still: boolean) => void;
  resize: (width: number, height: number) => void;
  dispose: () => void;
};

export function createSkyRenderer(canvas: HTMLCanvasElement, image: HTMLImageElement): SkyRenderer {
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
  if (!gl) throw new Error("WebGL is unavailable");
  const shaders: WebGLShader[] = [];
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  let texture: WebGLTexture | null = null;
  const dispose = () => {
    if (texture) gl.deleteTexture(texture);
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    shaders.forEach((shader) => gl.deleteShader(shader));
  };
  try {
    for (const [kind, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]] as const) {
      const shader = gl.createShader(kind);
      if (!shader) throw new Error("Cannot allocate sky shader");
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || "Sky shader compilation failed");
    }
    program = gl.createProgram();
    if (!program) throw new Error("Cannot allocate sky program");
    shaders.forEach((shader) => gl.attachShader(program!, shader));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "Sky shader link failed");
    gl.useProgram(program);
    buffer = gl.createBuffer();
    texture = gl.createTexture();
    if (!buffer || !texture) throw new Error("Cannot allocate sky resources");
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(gl.getUniformLocation(program, "galaxy"), 0);
    const clock = gl.getUniformLocation(program, "time");
    const motion = gl.getUniformLocation(program, "still");
    const resolution = gl.getUniformLocation(program, "resolution");
    return {
      resize(width, height) {
        // Bound fill rate independently of devicePixelRatio (including 4K screens).
        const cap = width < 600 ? 640 : 1100;
        const scale = Math.min(1, cap / Math.max(width, height));
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(resolution, canvas.width, canvas.height);
      },
      draw(seconds, reduced) {
        gl.uniform1f(clock, seconds);
        gl.uniform1f(motion, reduced ? 1 : 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
