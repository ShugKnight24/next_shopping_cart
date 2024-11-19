import { useContext, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import items from '../../data/items.json';
import techItems from '../../data/techItems.json';
import { CartContext } from '../../context/CartProvider';
import { formatCurrency } from '../../utils/cartUtils';
import { getCurrentItem } from '../../utils/getItem';
import PropTypes from 'prop-types';

const productList = [...items, ...techItems];

export const getStaticPaths = async () => {
  const pagePaths = productList.map(({ itemid }) => {
    return {
      params: {
        productid: itemid.toString(),
      },
    };
  });

  return {
    paths: pagePaths,
    fallback: false,
  };
};

export const getStaticProps = (context) => {
  const currentid = context.params.productid;
  const currentProduct = getCurrentItem(productList, currentid);
  return {
    props: {
      currentProduct: currentProduct,
    },
  };
};

export default function ProductID({ currentProduct }) {
  const { state, dispatch } = useContext(CartContext);
  const { inventory, cart } = state;
  const currentItem = getCurrentItem(inventory, currentProduct.itemid);
  const isInCart = getCurrentItem(cart, currentProduct.itemid) ? true : false;
  const disabledButton = currentItem.available === 0 ? true : false;
  const { description, image, itemid, manufacturer, price, productName } =
    currentProduct;
  const initialFavorite = currentItem.favorite === null ? true : false;
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  // TODO: Finish Add to Cart functionality
  // function handleSubmit(event){
  // 	event.preventDefault();
  // 	console.log(event);
  // }

  function handleAddToCart(itemid) {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: itemid,
      },
    });
  }

  function handleRemoveFromCart(itemid) {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: {
        productId: itemid,
      },
    });
  }

  function handleFavorite(itemid) {
    dispatch({
      type: 'ADD_FAVORITE',
      payload: {
        productId: itemid,
      },
    });
    setIsFavorite(true);
  }

  function handleRemoveFavorite(itemid) {
    dispatch({
      type: 'REMOVE_FAVORITE',
      payload: {
        productId: itemid,
      },
    });
    setIsFavorite(false);
  }

  return (
    <>
      <Head>
        <title>{productName} | Product Page</title>
      </Head>
      <div className="product-page">
        <div className="product-container">
          <Link className="product-return" href="/products">
            <i className="fas fa-chevron-left"></i>
            All Products
          </Link>
          {
            <div className="product" key={itemid}>
              <div className="page-header">
                <div className="name-favorite">
                  <h1 className="product-name">
                    {manufacturer} {productName}
                  </h1>
                  {isFavorite ? (
                    <button
                      className="favorite-button remove-favorite"
                      onClick={() => handleRemoveFavorite(itemid)}
                    >
                      <i className="fas fa-heart"></i>
                    </button>
                  ) : (
                    <button
                      className="favorite-button add-favorite"
                      onClick={() => handleFavorite(itemid)}
                    >
                      <i className="far fa-heart"></i>
                    </button>
                  )}
                </div>
              </div>
              <img src={image} alt={`${productName} by ${manufacturer}`} />
              <p className="product-description">{description}</p>
              <p className="product-price bold-text">{formatCurrency(price)}</p>
              <p className="product-quantity">
                Currently Available: {currentItem.available}
              </p>
              <div className="product-actions">
                {isInCart && (
                  <button
                    className="button delete-item"
                    onClick={() => handleRemoveFromCart(itemid)}
                  >
                    Remove Item
                  </button>
                )}
                <button
                  className={`button add-cart-button ${disabledButton ? 'disabled' : ''}`}
                  onClick={() => handleAddToCart(itemid)}
                >
                  Add To Cart
                </button>
              </div>
              {/* <form
							className="add-to-cart-form"
							onSubmit={ (event) => handleSubmit(event) }
						>
							<label htmlFor="quantity">Quantity:</label>
							<input
								id="quantity"
								className="quantity-input"
								type="number"
								name="quantity"
								value="1"
								min="0"
								max={ currentProduct.available }
								onChange={ (event) => updateQuantity(event) }
							/>
							<button 
								className="button add-cart-button"
								type="submit"
							>Add To Cart</button>
						</form> */}
            </div>
          }
        </div>
      </div>
    </>
  );
}

ProductID.propTypes = {
  currentProduct: PropTypes.shape({
    description: PropTypes.string,
    image: PropTypes.string,
    favorite: PropTypes.bool,
    isInCart: PropTypes.bool,
    itemid: PropTypes.string,
    manufacturer: PropTypes.string,
    price: PropTypes.number,
    productName: PropTypes.string,
  }),
};
