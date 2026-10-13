import { useEffect, useRef, useState } from 'react';

/** Same keys, and each value identical. */
export const shallowEqual = (a, b) => {
  if (a === b) return true;
  if (!a || !b) return false;
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every((key) => Object.is(a[key], b[key]))
  );
};

/** A copy of `obj` without `keys`. */
export const omit = (obj, keys) => {
  const rest = { ...obj };
  keys.forEach((key) => delete rest[key]);
  return rest;
};

/**
 * Keep handing back the previous value while `isEqual` says nothing that
 * matters changed, so memos and effects keyed on it do not rerun. Thumbnails
 * use it to ignore edits that do not change what they draw.
 */
export const useStable = (value, isEqual = shallowEqual) => {
  const ref = useRef(value);
  if (!isEqual(ref.current, value)) ref.current = value;
  return ref.current;
};

/** `value`, but only once it has stopped changing for `ms` (a drag ending). */
export const useSettled = (value, ms) => {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return settled;
};
