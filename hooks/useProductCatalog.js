import { useCallback, useEffect, useState } from 'react';
import { normalizeProduct } from '../utils/contractResilience';

/**
 * Declarative Product Catalog Hook
 *
 * Manages product fetching, loading states, error handling, contract normalization,
 * and resilient retries according to SOLID and DRY principles.
 *
 * @param {object} [options]
 * @param {Array<object>} [options.initialData] - Optional initial product list (e.g. from CartContext/SSR)
 * @param {boolean} [options.fetchFromApi=false] - Whether to actively fetch/revalidate against /api/products
 * @param {string} [options.apiEndpoint='/api/products'] - Target API route
 * @returns {{
 *   products: Array<object>,
 *   totalCount: number,
 *   status: 'idle' | 'loading' | 'success' | 'error',
 *   error: string | null,
 *   isLoading: boolean,
 *   isError: boolean,
 *   isEmpty: boolean,
 *   refetch: () => Promise<void>
 * }}
 */
export function useProductCatalog({
  initialData = null,
  fetchFromApi = false,
  apiEndpoint = '/api/products',
} = {}) {
  const [products, setProducts] = useState(() =>
    Array.isArray(initialData) ? initialData.map(normalizeProduct) : []
  );
  const [status, setStatus] = useState(
    Array.isArray(initialData) && initialData.length > 0 ? 'success' : 'idle'
  );
  const [error, setError] = useState(null);

  // Synchronize when initialData changes from parent/context
  useEffect(() => {
    if (Array.isArray(initialData) && !fetchFromApi) {
      setProducts(initialData.map(normalizeProduct));
      setStatus('success');
      setError(null);
    }
  }, [initialData, fetchFromApi]);

  const loadFromApi = useCallback(
    async (signal) => {
      setStatus('loading');
      setError(null);

      try {
        const response = await fetch(apiEndpoint, {
          headers: { Accept: 'application/json' },
          signal,
        });

        if (!response.ok) {
          throw new Error(
            `Catalog service unavailable (HTTP ${response.status}: ${response.statusText || 'Error'})`
          );
        }

        const payload = await response.json();
        const rawList = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.data)
            ? payload.data
            : [];

        const normalizedList = rawList.map(normalizeProduct);
        setProducts(normalizedList);
        setStatus('success');
      } catch (err) {
        if (err.name === 'AbortError') return;

        setError(
          err.message || 'Failed to retrieve products from catalog service.'
        );
        setStatus('error');
      }
    },
    [apiEndpoint]
  );

  useEffect(() => {
    if (!fetchFromApi) return;

    const controller = new AbortController();
    loadFromApi(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchFromApi, loadFromApi]);

  const refetch = useCallback(() => {
    const controller = new AbortController();
    return loadFromApi(controller.signal);
  }, [loadFromApi]);

  const isLoading = status === 'loading';
  const isError = status === 'error';
  const isEmpty = status === 'success' && products.length === 0;

  return {
    products,
    totalCount: products.length,
    status,
    error,
    isLoading,
    isError,
    isEmpty,
    refetch,
  };
}
