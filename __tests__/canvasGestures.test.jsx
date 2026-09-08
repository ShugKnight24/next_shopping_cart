import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useRef } from 'react';
import { useCanvasGestures } from '../hooks/useCanvasGestures';

function TestCanvasComponent({
  stickers = [],
  selectedSticker = null,
  onUpdateStickers = vi.fn(),
  onCanvasClick = vi.fn(),
}) {
  const canvasRef = useRef(null);
  const { activeStickerId, hoveredStickerId, handlers } = useCanvasGestures({
    canvasRef,
    stickers,
    selectedSticker,
    onUpdateStickers,
    onCanvasClick,
  });

  return (
    <div>
      <span data-testid="active-sticker">{activeStickerId || 'none'}</span>
      <span data-testid="hovered-sticker">{hoveredStickerId || 'none'}</span>
      <canvas
        ref={canvasRef}
        data-testid="test-canvas"
        style={{ width: '400px', height: '400px' }}
        {...handlers}
      />
    </div>
  );
}

describe('useCanvasGestures Hook', () => {
  it('stamps new sticker on click when selectedSticker is active', () => {
    const onUpdateStickers = vi.fn();
    const { getByTestId } = render(
      <TestCanvasComponent
        selectedSticker="star"
        onUpdateStickers={onUpdateStickers}
      />
    );

    const canvas = getByTestId('test-canvas');
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });

    expect(onUpdateStickers).toHaveBeenCalledTimes(1);
    const [updatedStickers, options] = onUpdateStickers.mock.calls[0];
    expect(updatedStickers).toHaveLength(1);
    expect(updatedStickers[0].type).toBe('star');
    expect(options).toEqual({ commit: true });
  });

  it('buffers drag movements with commit=false and commits on mouseUp', () => {
    const onUpdateStickers = vi.fn();
    const initialStickers = [{ id: 'stk-1', type: 'star', x: 50, y: 50, scale: 1 }];

    const { getByTestId } = render(
      <TestCanvasComponent
        stickers={initialStickers}
        onUpdateStickers={onUpdateStickers}
      />
    );

    const canvas = getByTestId('test-canvas');

    // Mouse down on sticker (distance from 50,50 is 0)
    fireEvent.mouseDown(canvas, { clientX: 50, clientY: 50 });
    expect(getByTestId('active-sticker').textContent).toBe('stk-1');

    // Drag move 1
    fireEvent.mouseMove(canvas, { clientX: 60, clientY: 60 });
    expect(onUpdateStickers).toHaveBeenLastCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 'stk-1', x: 60, y: 60 })]),
      { commit: false }
    );

    // Drag move 2
    fireEvent.mouseMove(canvas, { clientX: 70, clientY: 70 });
    expect(onUpdateStickers).toHaveBeenLastCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 'stk-1', x: 70, y: 70 })]),
      { commit: false }
    );

    // Mouse up - commits to history exactly once
    fireEvent.mouseUp(canvas);
    expect(onUpdateStickers).toHaveBeenLastCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 'stk-1', x: 70, y: 70 })]),
      { commit: true }
    );
  });

  it('supports touch drag movements and commits on touchEnd', () => {
    const onUpdateStickers = vi.fn();
    const initialStickers = [{ id: 'stk-touch', type: 'luna', x: 80, y: 80, scale: 1 }];

    const { getByTestId } = render(
      <TestCanvasComponent
        stickers={initialStickers}
        onUpdateStickers={onUpdateStickers}
      />
    );

    const canvas = getByTestId('test-canvas');

    // Touch start on sticker
    fireEvent.touchStart(canvas, {
      touches: [{ clientX: 80, clientY: 80 }],
    });
    expect(getByTestId('active-sticker').textContent).toBe('stk-touch');

    // Touch move
    fireEvent.touchMove(canvas, {
      touches: [{ clientX: 120, clientY: 120 }],
    });
    expect(onUpdateStickers).toHaveBeenLastCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 'stk-touch', x: 120, y: 120 })]),
      { commit: false }
    );

    // Touch end
    fireEvent.touchEnd(canvas);
    expect(onUpdateStickers).toHaveBeenLastCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 'stk-touch', x: 120, y: 120 })]),
      { commit: true }
    );
  });

  it('triggers onCanvasClick when clicking empty canvas space', () => {
    const onCanvasClick = vi.fn();
    const { getByTestId } = render(
      <TestCanvasComponent onCanvasClick={onCanvasClick} />
    );

    const canvas = getByTestId('test-canvas');
    fireEvent.mouseDown(canvas, { clientX: 200, clientY: 200 });

    expect(onCanvasClick).toHaveBeenCalledTimes(1);
    expect(getByTestId('active-sticker').textContent).toBe('none');
  });
});
