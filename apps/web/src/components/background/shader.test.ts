import { describe, expect, it } from 'vitest';
import { isSoftwareRenderer } from './shader';

describe('software WebGL', () => {
  it('recognises renderers that draw on the CPU', () => {
    expect(
      isSoftwareRenderer(
        'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)',
      ),
    ).toBe(true);
    expect(isSoftwareRenderer('llvmpipe (LLVM 17.0.6, 256 bits)')).toBe(true);
    expect(isSoftwareRenderer('softpipe')).toBe(true);
    expect(
      isSoftwareRenderer('ANGLE (Microsoft, Microsoft Basic Render Driver Direct3D11 vs_5_0 ps_5_0)'),
    ).toBe(true);
  });

  it('leaves real GPUs alone', () => {
    expect(
      isSoftwareRenderer('ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)'),
    ).toBe(false);
    expect(isSoftwareRenderer('Apple GPU')).toBe(false);
    expect(isSoftwareRenderer('Mali-G78')).toBe(false);
    expect(isSoftwareRenderer('Adreno (TM) 730')).toBe(false);
    expect(isSoftwareRenderer('')).toBe(false);
  });
});
