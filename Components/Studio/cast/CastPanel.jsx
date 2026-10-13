import PropTypes from 'prop-types';
import { TrashIcon } from '../../Icons';
import { TextField } from '../workbench/WorkbenchFields';
import { InspectorSection, WorkbenchButton } from '../workbench/WorkbenchShell';
import { MemberImage } from './CastArt';
import { createPerson, createPet, memberName } from './castModel';
import styles from './CastPanel.module.css';
import { describePerson } from './castRig';
import { LookEditor, PetEditor } from './LookEditor';

/**
 * The cast: everyone who appears in the design. Make a person once — a
 * grown-up, a kid, a little one, or a pet — then place them on any page.
 * Their look lives here, so a change reaches every page they are on.
 */
export const CastPanel = ({
  cast,
  editingId,
  onEdit,
  onChangeCast,
  onPlace,
  placedCount = {},
}) => {
  const editing = cast.find((m) => m.id === editingId) ?? null;

  const update = (id, patch, options) =>
    onChangeCast(
      cast.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      options
    );
  const add = (member) => {
    onChangeCast([...cast, member]);
    onEdit(member.id);
  };
  const remove = (id) => {
    onChangeCast(cast.filter((m) => m.id !== id));
    onEdit(null);
  };

  return (
    <div className={styles.panel}>
      <InspectorSection title="Cast">
        <p className={styles.note}>
          Everyone in your story. Change someone here and they change on every
          page.
        </p>

        <ul className={styles.roster} aria-label="Cast members">
          {cast.map((member) => (
            <li key={member.id}>
              <button
                type="button"
                className={`${styles.member} ${member.id === editingId ? styles.memberActive : ''}`}
                aria-pressed={member.id === editingId}
                onClick={() =>
                  onEdit(member.id === editingId ? null : member.id)
                }
              >
                <span className={styles.memberArt}>
                  <MemberImage member={member} crop="head" />
                </span>
                <span className={styles.memberText}>
                  <span className={styles.memberName}>
                    {memberName(member, 'Unnamed')}
                  </span>
                  <span className={styles.memberMeta}>
                    {member.kind === 'pet' ? 'Pet' : describePerson(member)}
                    {placedCount[member.id]
                      ? ` · on ${placedCount[member.id]} ${placedCount[member.id] === 1 ? 'page' : 'pages'}`
                      : ''}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div
          className={styles.addRow}
          role="group"
          aria-label="Add to the cast"
        >
          <WorkbenchButton
            variant="subtle"
            onClick={() => add(createPerson('adult', { name: 'Grown-up' }))}
          >
            + Grown-up
          </WorkbenchButton>
          <WorkbenchButton
            variant="subtle"
            onClick={() => add(createPerson('kid', { name: 'Kid' }))}
          >
            + Kid
          </WorkbenchButton>
          <WorkbenchButton
            variant="subtle"
            onClick={() => add(createPerson('toddler', { name: 'Little one' }))}
          >
            + Little one
          </WorkbenchButton>
          <WorkbenchButton
            variant="subtle"
            onClick={() => add(createPet({ name: 'Pet' }))}
          >
            + Pet
          </WorkbenchButton>
        </div>
      </InspectorSection>

      {editing && (
        <InspectorSection title={`Edit ${memberName(editing)}`}>
          <div className={styles.hero}>
            <MemberImage
              member={editing}
              crop="full"
              className={styles.heroArt}
            />
          </div>

          <TextField
            label="Name"
            value={editing.name ?? ''}
            maxLength={18}
            // Typing a name is not an undo step per letter.
            onChange={(name) => update(editing.id, { name }, { commit: false })}
          />

          <div className={styles.addRow}>
            <WorkbenchButton variant="primary" onClick={() => onPlace(editing)}>
              Place on this page
            </WorkbenchButton>
            <WorkbenchButton
              variant="danger"
              icon={<TrashIcon size={14} />}
              onClick={() => remove(editing.id)}
              disabled={cast.length <= 1}
            >
              Remove
            </WorkbenchButton>
          </div>

          {editing.kind === 'pet' ? (
            <PetEditor
              member={editing}
              onChange={(patch) => update(editing.id, patch)}
            />
          ) : (
            <LookEditor
              member={editing}
              onChange={(patch) => update(editing.id, patch)}
            />
          )}
        </InspectorSection>
      )}
    </div>
  );
};

CastPanel.propTypes = {
  cast: PropTypes.arrayOf(PropTypes.object).isRequired,
  editingId: PropTypes.string,
  onEdit: PropTypes.func.isRequired,
  onChangeCast: PropTypes.func.isRequired,
  onPlace: PropTypes.func.isRequired,
  placedCount: PropTypes.object,
};
