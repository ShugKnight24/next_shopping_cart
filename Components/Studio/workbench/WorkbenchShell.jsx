import Link from 'next/link';
import PropTypes from 'prop-types';
import { ChevronLeft } from '../../Icons';
import styles from './WorkbenchShell.module.css';
import theme from './theme.module.css';

/**
 * The workbench chrome: top bar, left tool rail, canvas field, right inspector,
 * bottom status bar.
 *
 * Deliberately a fixed, non-scrolling app frame — the page does not scroll, the
 * panels do. That is the difference between an editor and a long form, and it
 * is why this lives on its own route rather than inside the marketing page.
 */
export const WorkbenchShell = ({
  title,
  subtitle,
  backHref = '/studio',
  backLabel = 'Studio',
  tools = null,
  inspector = null,
  status = null,
  actions = null,
  children,
}) => (
  <div className={`${theme.workbench} ${styles.shell}`}>
    <header className={styles.topBar}>
      <div className={styles.topLeft}>
        <Link href={backHref} className={styles.backLink}>
          <ChevronLeft size={16} />
          <span>{backLabel}</span>
        </Link>

        <span className={styles.divider} aria-hidden="true" />

        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>

      <div className={styles.topActions}>{actions}</div>
    </header>

    <div className={styles.body}>
      {tools && (
        <nav className={styles.rail} aria-label="Editor tools">
          {tools}
        </nav>
      )}

      <main className={styles.field}>{children}</main>

      {inspector && (
        <aside className={styles.inspector} aria-label="Design properties">
          {inspector}
        </aside>
      )}
    </div>

    <footer className={styles.statusBar}>{status}</footer>
  </div>
);

WorkbenchShell.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  backHref: PropTypes.string,
  backLabel: PropTypes.string,
  tools: PropTypes.node,
  inspector: PropTypes.node,
  status: PropTypes.node,
  actions: PropTypes.node,
  children: PropTypes.node,
};

/* --------------------------------------------------------- sub-pieces -- */

export const WorkbenchButton = ({
  children,
  variant = 'ghost',
  icon = null,
  ...rest
}) => (
  <button
    type="button"
    className={`${styles.button} ${styles[`button_${variant}`]}`}
    {...rest}
  >
    {icon}
    {children}
  </button>
);

WorkbenchButton.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['ghost', 'primary', 'subtle', 'danger']),
  icon: PropTypes.node,
};

/** A titled, optionally collapsible block inside the inspector. */
export const InspectorSection = ({ title, action = null, children }) => (
  <section className={styles.section}>
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {action}
    </div>
    <div className={styles.sectionBody}>{children}</div>
  </section>
);

InspectorSection.propTypes = {
  title: PropTypes.string.isRequired,
  action: PropTypes.node,
  children: PropTypes.node,
};

export const StatusItem = ({ label, value }) => (
  <span className={styles.statusItem}>
    <span className={styles.statusLabel}>{label}</span>
    <span className={styles.statusValue}>{value}</span>
  </span>
);

StatusItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
};

export { styles as workbenchStyles };
