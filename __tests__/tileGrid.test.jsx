import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TileGrid } from '../Components/Studio/cast/CastArt';

const OPTIONS = ['a', 'b', 'c', 'd', 'e', 'f'].map((value) => ({
  value,
  name: `Tile ${value}`,
}));

const renderGrid = (onChange = vi.fn()) => {
  render(
    <TileGrid
      label="Tiles"
      options={OPTIONS}
      value="b"
      onChange={onChange}
      columns={3}
    />
  );
  return {
    onChange,
    tiles: within(screen.getByRole('group', { name: 'Tiles' })).getAllByRole(
      'button'
    ),
  };
};

describe('TileGrid keyboard', () => {
  it('is one Tab stop, on the picked tile', () => {
    const { tiles } = renderGrid();
    expect(tiles.map((t) => t.tabIndex)).toEqual([-1, 0, -1, -1, -1, -1]);
  });

  it('moves focus with the arrows without picking', () => {
    const { tiles, onChange } = renderGrid();
    tiles[1].focus();

    fireEvent.keyDown(tiles[1], { key: 'ArrowRight' });
    expect(tiles[2]).toHaveFocus();
    fireEvent.keyDown(tiles[2], { key: 'ArrowDown' });
    expect(tiles[5]).toHaveFocus();
    fireEvent.keyDown(tiles[5], { key: 'Home' });
    expect(tiles[0]).toHaveFocus();

    expect(onChange).not.toHaveBeenCalled();
    expect(tiles[0].tabIndex).toBe(0);
  });
});
