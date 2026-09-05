import Head from 'next/head';
import Link from 'next/link';
import { useContext } from 'react';
import { ProductCard } from '../Components/Products/ProductCard';
import { CartContext } from '../context/CartProvider';
import { getCurrentItem } from '../utils/getItem';
import styles from '../styles/pages/Favorites.module.css';

export default function Favorites() {
  const { state } = useContext(CartContext);
  const { inventory, cart } = state;

  const filteredFavorites = inventory.filter((item) => Boolean(item.favorite));

  return (
    <>
      <Head>
        <title>Shopping Cart | Favorites</title>
      </Head>
      <div className={styles.favoritesContainer}>
        <div className={styles.pageHeader}>
          <h1>Your Favorites</h1>
          <h2>Items you&apos;ve saved for later</h2>
        </div>
        {filteredFavorites.length > 0 ? (
          <div className={styles.favoritesGrid}>
            {filteredFavorites.map(
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
            )}
          </div>
        ) : (
          <div className={styles.noFavorites}>
            <p>No favorites yet</p>
            <ul>
              <li>
                Browse our collection and tap the heart icon to save items you
                love
              </li>
            </ul>
            <Link href="/products">Start Browsing</Link>
          </div>
        )}
      </div>
    </>
  );
}
