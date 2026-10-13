import PropTypes from 'prop-types';
import { reframeLayer } from '../workbench/layerModel';
import { ColorField, ToggleRow } from '../workbench/WorkbenchFields';
import { InspectorSection, WorkbenchButton } from '../workbench/WorkbenchShell';
import { MemberImage, PersonImage, PieceImage, TileGrid } from './CastArt';
import { artForLayer, memberById, memberName } from './castModel';
import styles from './CastPanel.module.css';
import { MOODS, POSES, PROPS, normalizePerson } from './castRig';
import { PIECES, PIECE_CATEGORIES, pieceArt, pieceById } from './scenePieces';

/**
 * Inspector bodies for the cast and scenery layers.
 *
 * A character layer is a placement: pose, mood and prop are per page, and the
 * tiles show *this* person doing each one. Who they are (hair, outfit) is one
 * click away in the cast panel. `context` comes from the route:
 *   { cast, onEditMember(id) }
 */

export const CharacterProperties = ({ layer, set, context }) => {
  const cast = context?.cast ?? [];
  const member = memberById(cast, layer.castId);

  // Changing pose or prop changes the art's shape; keep the scale and feet.
  const place = (patch) => {
    if (!member) return set(patch);
    const prev = artForLayer(layer, member);
    const next = artForLayer({ ...layer, ...patch }, member);
    return set({ ...patch, ...pick(reframeLayer(layer, prev, next)) });
  };

  if (!member) {
    return (
      <p className={styles.note}>
        This character is no longer in the cast. Pick someone below or delete
        the layer.
      </p>
    );
  }

  const person = member.kind === 'pet' ? null : normalizePerson(member);
  const at = (patch) => ({
    pose: layer.pose,
    mood: layer.mood,
    prop: layer.prop,
    ...patch,
  });

  return (
    <>
      <div className={styles.whoRow}>
        <span className={styles.memberArt}>
          <MemberImage member={member} crop="head" />
        </span>
        <span className={styles.memberText}>
          <span className={styles.memberName}>{memberName(member)}</span>
          <span className={styles.memberMeta}>
            {member.kind === 'pet' ? 'Pet' : 'On this page'}
          </span>
        </span>
        <WorkbenchButton
          variant="subtle"
          onClick={() => context?.onEditMember?.(member.id)}
        >
          Edit look
        </WorkbenchButton>
      </div>

      {person && (
        <>
          <TileGrid
            label="Mood"
            options={MOODS.map((m) => ({
              value: m.id,
              name: m.name,
              art: (
                <PersonImage
                  person={person}
                  placement={at({ mood: m.id })}
                  crop="head"
                />
              ),
            }))}
            value={layer.mood}
            onChange={(mood) => set({ mood })}
          />
          <TileGrid
            label="Pose"
            options={POSES.map((p) => ({
              value: p.id,
              name: p.name,
              art: (
                <PersonImage
                  person={person}
                  placement={at({ pose: p.id, side: 1 })}
                />
              ),
            }))}
            value={layer.pose}
            onChange={(pose) => place({ pose })}
            columns={4}
            shape="tall"
          />
          <TileGrid
            label="Holding"
            options={PROPS.map((p) => ({
              value: p.id,
              name: p.name,
              art: (
                <PersonImage person={person} placement={at({ prop: p.id })} />
              ),
            }))}
            value={layer.prop}
            onChange={(prop) => place({ prop })}
            columns={4}
            shape="tall"
          />
        </>
      )}

      <ToggleRow
        label="Mirror"
        hint="face the other way"
        checked={layer.flipX}
        onChange={(flipX) => set({ flipX })}
      />

      {cast.length > 1 && (
        <TileGrid
          label="Who is this?"
          options={cast.map((m) => ({
            value: m.id,
            name: memberName(m),
            art: <MemberImage member={m} crop="head" />,
          }))}
          value={layer.castId}
          onChange={(castId) => {
            // One of each person per page: if they are already here, go to
            // them rather than make a second copy.
            const here = context?.pageLayers?.find(
              (l) =>
                l.type === 'character' &&
                l.castId === castId &&
                l.id !== layer.id
            );
            if (here) {
              context.selectLayer?.(here.id);
              return;
            }
            const next = memberById(cast, castId);
            const prev = artForLayer(layer, member);
            const art = artForLayer(layer, next);
            set({
              castId,
              name: memberName(next),
              ...pick(reframeLayer(layer, prev, art)),
            });
          }}
          columns={4}
        />
      )}
    </>
  );
};

const pick = ({ x, y, width, height }) => ({ x, y, width, height });

CharacterProperties.propTypes = {
  layer: PropTypes.object.isRequired,
  set: PropTypes.func.isRequired,
  context: PropTypes.object,
};

export const PieceProperties = ({ layer, set }) => {
  const def = pieceById(layer.piece);

  const swap = (id) => {
    const prev = pieceArt(layer.piece, layer.tint);
    const next = pieceArt(id);
    // Keep the piece about as tall as it was, standing on the same spot.
    set({
      piece: id,
      tint: null,
      name: pieceById(id).name,
      ...pick(
        reframeLayer(layer, prev, {
          width: next.width * (prev.height / next.height),
          height: prev.height,
        })
      ),
    });
  };

  return (
    <>
      {def.tint && (
        <ColorField
          label="Colour"
          value={layer.tint ?? def.tint}
          onChange={(tint) => set({ tint })}
        />
      )}
      <ToggleRow
        label="Mirror"
        checked={layer.flipX}
        onChange={(flipX) => set({ flipX })}
      />
      <PiecePicker value={layer.piece} onPick={swap} />
    </>
  );
};

PieceProperties.propTypes = {
  layer: PropTypes.object.isRequired,
  set: PropTypes.func.isRequired,
};

/** Every scenery piece by category, as pictures. */
export const PiecePicker = ({ value = null, onPick }) => (
  <div className={styles.pieceGroups}>
    {PIECE_CATEGORIES.map((cat) => (
      <TileGrid
        key={cat.id}
        label={cat.name}
        options={PIECES.filter((p) => p.category === cat.id).map((p) => ({
          value: p.id,
          name: p.name,
          art: <PieceImage id={p.id} />,
        }))}
        value={value}
        onChange={onPick}
        columns={4}
      />
    ))}
  </div>
);

PiecePicker.propTypes = {
  value: PropTypes.string,
  onPick: PropTypes.func.isRequired,
};

/** The rail's scenery panel: add any piece to the page. */
export const SceneryPanel = ({ onAdd }) => (
  <div className={styles.panel}>
    <InspectorSection title="Scenery">
      <p className={styles.note}>
        Click a piece to add it to this page, then drag it anywhere, resize it,
        or send it behind your characters.
      </p>
      <PiecePicker onPick={onAdd} />
    </InspectorSection>
  </div>
);

SceneryPanel.propTypes = { onAdd: PropTypes.func.isRequired };
