import type { SceneFrame, SceneId } from './engine';

const ORDER: SceneId[] = ['hero', 'work', 'process', 'about', 'contact'];

/** The scene's `data-state` as the engine last wrote it. */
export const sceneState = (frame: SceneFrame | undefined): string | undefined =>
  frame?.sticky.parentElement?.dataset.state;

/**
 * The scene the reader sees: the active scene covering the middle of the screen, else the last active one.
 * Scenes that flow can be active together. Pure arithmetic on the engine's measured geometry, so nothing reads
 * layout per frame.
 */
export const currentScene = (frames: Map<SceneId, SceneFrame>, y: number): SceneId | undefined => {
  const active = ORDER.flatMap((id) => {
    const frame = frames.get(id);
    return frame && sceneState(frame) === 'active' ? [frame] : [];
  });
  const covering = active.find((frame) => {
    const middle = y + frame.viewport / 2;
    return frame.top <= middle && middle < frame.end + frame.viewport;
  });
  return (covering ?? active.at(-1))?.id;
};
