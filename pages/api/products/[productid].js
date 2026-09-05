import products from '../../../data/products.json';
import {
  normalizeProduct,
  validateProductContract,
} from '../../../utils/contractResilience';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      error: `Method ${req.method} Not Allowed`,
      contractValid: false,
    });
  }

  const { productid, simulateContractBreak } = req.query;

  res.setHeader('X-API-Version', '2.0.0');
  res.setHeader('X-Contract-Status', 'Enforced');

  const rawProduct = products.find(
    (p) =>
      p.itemid?.toLowerCase() === productid?.toLowerCase() ||
      String(p.id)?.toLowerCase() === productid?.toLowerCase()
  );

  if (!rawProduct) {
    return res.status(404).json({
      error: `Product '${productid}' not found`,
      contractValid: false,
    });
  }

  let item = rawProduct;
  if (simulateContractBreak === 'true') {
    // Intentionally corrupt to demonstrate contract recovery
    item = {
      title: rawProduct.productName,
      cost: `$${rawProduct.price}`,
      stockCount: '15',
    };
  }

  const normalized = normalizeProduct(item);
  const contractResult = validateProductContract(normalized);

  return res.status(200).json({
    version: '2.0.0',
    contractValid: contractResult.valid,
    contractErrors: contractResult.errors,
    simulatedBreak: simulateContractBreak === 'true',
    data: normalized,
  });
}
