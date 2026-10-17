import { type Rgb, rgbOf } from './drift';

/**
 * The "liquid gold" background (spec 5.8; prototype app.js `bg`, its first mode only). Domain-warped noise is
 * mixed from the page colour `uA` toward dark gold `uC`, with fine bright ridges in `uLine`, then calmed on the
 * text side (`uSide`, `uCalm`), vignetted and grained.
 */
export const FRAGMENT = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform float uTime, uScroll, uPress, uSide, uCalm;
uniform vec2 uRes;
uniform vec3 uA, uC, uLine;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0., a = .5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 7.1; a *= .5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - .5 * uRes) / min(uRes.x, uRes.y);
  float t = uTime;
  // the side where the words sit stays quiet
  float calm = uCalm * mix(1., .22, smoothstep(-.35, .55, (uv.x - .5) * 2. * uSide));
  vec2 q = p * 1.25 + vec2(0., -uScroll * 2.6);
  float w1 = fbm(q + vec2(t * .05, -t * .03));
  float w2 = fbm(q * 1.7 + w1 * 2.2 - t * .04);
  float h = fbm(q + vec2(w1, w2) * 1.7);
  vec3 col = mix(uA, uC, smoothstep(.32, .82, h));
  float ridge = pow(abs(sin(h * 10. + w2 * 5.)), 10.);
  float g = ridge * smoothstep(.38, .8, h) * (.85 + uPress);
  col = mix(col, uLine, smoothstep(.6, .95, h) * .35);
  g *= calm;
  col = mix(uA, col, .14 + .86 * calm);
  col = mix(col, uLine, clamp(g, 0., 1.));
  col *= 1. - .3 * dot(uv - .5, uv - .5) * 2.;
  col += (hash(gl_FragCoord.xy + fract(t) * 91.) - .5) * .028;
  gl_FragColor = vec4(col, 1.);
}`;

/** One triangle that covers the whole viewport. */
const VERTEX = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const TRIANGLE = new Float32Array([-1, -1, 3, -1, -1, 3]);

/**
 * Page colour, the second colour of the prototype's other modes (unused here), dark gold, ridge colour
 * (prototype app.js `PAL`).
 */
export const PALETTE = {
  dark: [0x0f0e0c, 0x17130c, 0x3a2b0c, 0xd4af37],
  light: [0xfaf9f6, 0xf3eee1, 0xe9d9a6, 0x8a6d1f],
} as const;
export type Theme = keyof typeof PALETTE;

export type Frame = { time: number; scroll: number; press: number; side: number; calm: number };
export type Renderer = {
  paint(theme: Theme): void;
  resize(width: number, height: number): void;
  draw(frame: Frame): void;
  release(): void;
};

const UNIFORMS = ['uTime', 'uScroll', 'uPress', 'uSide', 'uCalm', 'uRes', 'uA', 'uC', 'uLine'] as const;
type Uniforms = Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>;

const compile = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  if (process.env.NODE_ENV !== 'production') console.warn(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
};

/** Compiles, links and binds the program with its full-screen triangle; null if any step fails. */
const link = (gl: WebGLRenderingContext): WebGLProgram | null => {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (process.env.NODE_ENV !== 'production') console.warn(gl.getProgramInfoLog(program));
    return null;
  }
  // biome-ignore lint/correctness/useHookAtTopLevel: WebGL's useProgram, not a React hook
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, TRIANGLE, gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'p');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  return program;
};

/** Sets up WebGL on the canvas. Returns null, and never throws, when WebGL or the shader is unavailable. */
export const createRenderer = (canvas: HTMLCanvasElement): Renderer | null => {
  let gl: WebGLRenderingContext | null = null;
  try {
    gl = canvas.getContext('webgl', { antialias: false });
  } catch {
    return null;
  }
  const program = gl ? link(gl) : null;
  if (!gl || !program) return null;
  const context = gl;
  const u = Object.fromEntries(
    UNIFORMS.map((name) => [name, context.getUniformLocation(program, name)]),
  ) as Uniforms;
  const colour = (location: WebGLUniformLocation | null, rgb: Rgb): void => context.uniform3fv(location, rgb);
  return {
    paint(theme) {
      const [page, , gold, line] = PALETTE[theme];
      colour(u.uA, rgbOf(page));
      colour(u.uC, rgbOf(gold));
      colour(u.uLine, rgbOf(line));
    },
    resize(width, height) {
      context.viewport(0, 0, width, height);
      context.uniform2f(u.uRes, width, height);
    },
    draw({ time, scroll, press, side, calm }) {
      context.uniform1f(u.uTime, time);
      context.uniform1f(u.uScroll, scroll);
      context.uniform1f(u.uPress, press);
      context.uniform1f(u.uSide, side);
      context.uniform1f(u.uCalm, calm);
      context.drawArrays(context.TRIANGLES, 0, 3);
    },
    release() {
      context.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
};
