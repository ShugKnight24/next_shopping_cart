import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { getHighlightRanges } from '../../utils/productSearch';
import styles from './Highlight.module.css';

export function Highlight({ text = '', query = '' }) {
  const ranges = useMemo(() => getHighlightRanges(text, query), [text, query]);
  if (ranges.length === 0) return text;

  const parts = [];
  let cursor = 0;
  ranges.forEach(({ start, end }) => {
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <mark key={start} className={styles.match}>
        {text.slice(start, end)}
      </mark>
    );
    cursor = end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));

  return parts;
}

Highlight.propTypes = {
  text: PropTypes.string,
  query: PropTypes.string,
};
