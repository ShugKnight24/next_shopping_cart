import { useContext } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { CartContext } from '../context/CartProvider';
import { ProductCard } from '../Components/Products/ProductCard';
import { getCurrentItem } from '../utils/getItem';

export default function Favorites() {
  const { state } = useContext(CartContext);
  const { inventory, cart } = state;

  const filteredFavorites = inventory.filter((item) => {
    if (item.favorite === null) {
      return item;
    }
  });

  return (
    <>
      <Head>
        <title>Shopping Cart | Favorites</title>
      </Head>
      <div className="favorites-container">
        <h1>Favorite Products</h1>
        {filteredFavorites.length > 0 ? (
          filteredFavorites.map(
            ({
              available,
              description,
              favorite,
              image,
              itemid,
              manufacturer,
              price,
              productName,
            }) => {
              const isInCart = getCurrentItem(cart, itemid) ? true : false;

              return (
                <ProductCard
                  key={itemid}
                  available={available}
                  description={description}
                  favorite={favorite}
                  image={image}
                  isInCart={isInCart}
                  itemid={itemid}
                  manufacturer={manufacturer}
                  price={price}
                  productName={productName}
                />
              );
            }
          )
        ) : (
          <div className="no-favorites">
            <p className="bold-text">You have no favorite products</p>
            <p>Use the links below to navigate to our most popular pages</p>
            <ul>
              <span className="bold-text">Continue Shopping</span>:
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/products">Products</Link>
              </li>
              <li>
                <Link href="/cart">Cart</Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
