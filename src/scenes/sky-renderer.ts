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

void main() {
  vec2 uv=gl_FragCoord.xy/resolution;
  uv.y=1.0-uv.y;
  float unit=min(resolution.x,resolution.y);
  vec2 ratio=resolution/unit;
  vec3 col=galaxyLight((uv-vec2(.12,.15))*ratio/.72,.66,-.42,0.0)*.4;
  col+=galaxyLight((uv-vec2(.93,.88))*ratio/.64,.36,.58,2.8)*.32;
  // Reduce luminance behind the main reading column; retain detail at the edges.
  col*=1.0-.3*exp(-pow((uv.x-.5)*3.2,2.0));
  col=1.0-exp(-col*1.25);
  gl_FragColor=vec4(col,1.0);
}
`;

export type SkyRenderer = {
  draw: (time: number) => void;
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
      draw(seconds) {
        gl.uniform1f(clock, seconds);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
