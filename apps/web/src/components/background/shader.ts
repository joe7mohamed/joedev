import { type Rgb, rgbOf } from './drift';

/**
 * The "liquid gold" background (spec 5.8; prototype app.js `bg`, its first mode only). Domain-warped noise is
 * mixed from the page colour `uA` toward dark gold `uC`, with fine bright ridges in `uLine`, then calmed on the
 * text side (`uSide`, `uCalm`), vignetted toward `uShade` and grained.
 * Under the words, the luminance stays within `uGuard` of the page colour, so text keeps AA (spec 5.8); the cap is
 * applied in linear light, where luminance is exact.
 */
const FRAGMENT = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform float uTime, uScroll, uPress, uSide, uCalm, uGuard;
uniform vec2 uRes;
uniform vec3 uA, uC, uLine, uShade;

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
vec3 toLinear(vec3 c) {
  c = clamp(c, 0., 1.);
  return mix(c / 12.92, pow((c + .055) / 1.055, vec3(2.4)), step(.04045, c));
}
vec3 toSrgb(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1. / 2.4)) - .055, step(.0031308, c)); }

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - .5 * uRes) / min(uRes.x, uRes.y);
  float t = uTime;
  // the side where the words sit stays quiet
  float across = (uv.x - .5) * 2. * uSide;
  float calm = uCalm * mix(1., .22, smoothstep(-.35, .55, across));
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
  col = mix(col, uShade, .6 * dot(uv - .5, uv - .5));
  col += (hash(gl_FragCoord.xy + fract(t) * 91.) - .5) * .028;
  // the words' half (up to the middle) keeps the colour's luminance within uGuard of the page; phones have no side.
  // uGuard is 1 (no cap) in the dark theme: the same for every pixel, so this branch costs nothing there
  if (uGuard < 1.) {
    float guard = smoothstep(-.3, 0., across) * abs(uSide);
    vec3 page = toLinear(uA), lit = toLinear(col);
    float away = abs(dot(lit - page, vec3(.2126, .7152, .0722)));
    float room = mix(1., uGuard, guard);
    col = toSrgb(mix(page, lit, min(1., room / max(away, 1e-5))));
  }
  gl_FragColor = vec4(col, 1.);
}`;

/** One triangle that covers the whole viewport. */
const VERTEX = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const TRIANGLE = new Float32Array([-1, -1, 3, -1, -1, 3]);

/**
 * Page colour, the second colour of the prototype's other modes (unused here), dark gold, ridge colour
 * (prototype app.js `PAL`).
 */
const PALETTE = {
  dark: [0x0f0e0c, 0x17130c, 0x3a2b0c, 0xd4af37],
  light: [0xfaf9f6, 0xf3eee1, 0xe9d9a6, 0x8a6d1f],
} as const;
export type Theme = keyof typeof PALETTE;
/** No cap on how far the background may move from the page colour. */
export const NO_GUARD = 1;

export type Frame = { time: number; scroll: number; press: number; side: number; calm: number };
export type Renderer = {
  /** `guard`: how far the luminance under the words may move from the page colour (see `guardRoom`). */
  paint(theme: Theme, guard: number): void;
  resize(width: number, height: number): void;
  draw(frame: Frame): void;
  release(): void;
};

const UNIFORMS = [
  'uTime',
  'uScroll',
  'uPress',
  'uSide',
  'uCalm',
  'uGuard',
  'uRes',
  'uA',
  'uC',
  'uLine',
  'uShade',
] as const;
const BLACK = 0x000000;
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

/** Binds the linked program with its full-screen triangle. */
const bind = (gl: WebGLRenderingContext, program: WebGLProgram): WebGLProgram => {
  // biome-ignore lint/correctness/useHookAtTopLevel: WebGL's useProgram, not a React hook
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, TRIANGLE, gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'p');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  return program;
};

/** Compiles, links and binds the program; null, with nothing half-built left behind, if any step fails. */
const link = (gl: WebGLRenderingContext): WebGLProgram | null => {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (vertex && fragment && program) {
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) return bind(gl, program);
    if (process.env.NODE_ENV !== 'production') console.warn(gl.getProgramInfoLog(program));
  }
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  gl.deleteProgram(program);
  return null;
};

/** WebGL drawn on the CPU: Chrome's SwiftShader, Mesa's llvmpipe and softpipe, Windows' Basic Render Driver. */
const SOFTWARE = /swiftshader|llvmpipe|softpipe|basic render driver|software rasterizer/i;
export const isSoftwareRenderer = (name: string): boolean => SOFTWARE.test(name);

/**
 * The renderer's name. Firefox reports it as RENDERER; Chrome and Safari mask that as "WebKit WebGL" and give the
 * real one through WEBGL_debug_renderer_info.
 */
const rendererOf = (gl: WebGLRenderingContext): string => {
  const reported = String(gl.getParameter(gl.RENDERER) ?? '');
  const info = /webkit webgl/i.test(reported) ? gl.getExtension('WEBGL_debug_renderer_info') : null;
  return info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL) ?? '') : reported;
};

/** Gives the context back at once, for a canvas that stays hidden. */
const release = (gl: WebGLRenderingContext): void => {
  gl.getExtension('WEBGL_lose_context')?.loseContext();
};

/**
 * Sets up WebGL on the canvas. Returns null, and never throws, when WebGL or the shader is unavailable. WebGL that
 * would run in software (no GPU, a blocklisted one, headless browsers) counts as unavailable: the shader would cost
 * every scroll frame on the CPU, so the page shows its still CSS gradient instead (spec 5.8). The context flag
 * catches a blocklisted GPU; headless Chromium ignores it, so the renderer's name is checked as well.
 * `allowSoftware` lifts both for end-to-end tests only.
 */
export const createRenderer = (canvas: HTMLCanvasElement, allowSoftware = false): Renderer | null => {
  let gl: WebGLRenderingContext | null = null;
  try {
    gl = canvas.getContext('webgl', { antialias: false, failIfMajorPerformanceCaveat: !allowSoftware });
  } catch {
    return null;
  }
  if (!gl) return null;
  const program = allowSoftware || !isSoftwareRenderer(rendererOf(gl)) ? link(gl) : null;
  if (!program) {
    // the canvas is hidden for good: give its context back now
    release(gl);
    return null;
  }
  const context = gl;
  const u = Object.fromEntries(
    UNIFORMS.map((name) => [name, context.getUniformLocation(program, name)]),
  ) as Uniforms;
  const colour = (location: WebGLUniformLocation | null, rgb: Rgb): void => context.uniform3fv(location, rgb);
  return {
    paint(theme, guard) {
      const [page, , gold, line] = PALETTE[theme];
      colour(u.uA, rgbOf(page));
      colour(u.uC, rgbOf(gold));
      colour(u.uLine, rgbOf(line));
      // the vignette darkens the dark theme (prototype) but fades the light one toward its page colour, so it never
      // darkens what sits behind light-theme text
      colour(u.uShade, rgbOf(theme === 'light' ? page : BLACK));
      context.uniform1f(u.uGuard, guard);
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
      release(context);
    },
  };
};
