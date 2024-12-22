import Head from 'next/head';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useContext, useState } from 'react';
import { CartContext } from '../../context/CartProvider';
import items from '../../data/items.json';
import techItems from '../../data/techItems.json';
import { formatCurrency } from '../../utils/cartUtils';
import { getCurrentItem } from '../../utils/getItem';

import { Star } from '../../Components/Icons/Star';
import { ProductTabs } from '../../Components/Products/ProductTabs';

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
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  // TODO: Finish updating Product Types & add to data files
  const additionalImages = [];
  const reviews = { length: 0, average: 0 };
  const variants = [];
  const sizes = [];
  const sizeGuide = '';

  // TODO: Make additional Images an array
  const images = [image, additionalImages];

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
        <div className="product-breadcrumbs">
          <Link href="/">Home</Link>
          <i className="fas fa-chevron-right" />
          <Link href="/products">Products</Link>
          <i className="fas fa-chevron-right" />
          {productName}
        </div>
        <div className="product-container">
          <div className="product-images">
            <img
              src={image}
              alt={`${productName} by ${manufacturer}`}
              onClick={() => {
                setIsOpen(true);
                setPhotoIndex(0);
              }}
            />
            {/* TODO: Finish Implementing and build lighthouse component */}
            <div className="additional-images">
              {/* {additionalImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${productName} additional image ${index + 1}`}
                  onClick={() => {
                    setIsOpen(true);
                    setPhotoIndex(index + 1);
                  }}
                />
              ))} */}
            </div>
          </div>
          <div className="product-details">
            <div className="product-brand">
              {/* TODO: Gather all brand logos */}
              <img
                src={`/brands/${manufacturer}.png`}
                alt={manufacturer}
                className="brand-logo"
              />
              <h1 className="product-name">
                {manufacturer} {productName}
              </h1>
            </div>
            <div className="product-reviews">
              {/* TODO: Clicking the reviews should toggle the reviews tab and focus */}
              <span>{reviews.length} Reviews</span>
              <div className="review-stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star averageRating={reviews.average} index={i} key={i} />
                ))}
              </div>
            </div>
            <p className="product-description">{description}</p>
            <p className="product-price">{formatCurrency(price)}</p>
            <p className="product-available-quantity">
              Currently Available: {currentItem.available}
            </p>
            {variants && (
              // TODO: Implement
              <div className="product-variants">
                <h3>Variants</h3>
                {variants.map((variant, index) => (
                  <button key={index} className="variant-button">
                    {variant}
                  </button>
                ))}
              </div>
            )}
            {sizes && (
              // TODO: Implement
              <div className="product-sizes">
                <h3>Sizes</h3>
                {sizes.map((size, index) => (
                  <button
                    key={index}
                    className={`size-button ${size.available ? '' : 'unavailable'}`}
                    disabled={!size.available}
                  >
                    {size.size}
                  </button>
                ))}
                {sizeGuide && (
                  <div className="size-guide">
                    <i className="fas fa-info-circle" title={sizeGuide}></i>
                  </div>
                )}
              </div>
            )}
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
        </div>
        {/* TODO: Properly implement this below the fold */}
        <ProductTabs product={currentProduct} />
      </div>
    </>
  );
}

// TODO: Finish updating ProductID PropTypes once data type is finalized
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
    additionalImages: PropTypes.arrayOf(PropTypes.string),
    reviews: PropTypes.shape({
      length: PropTypes.number,
      average: PropTypes.number,
    }),
    variants: PropTypes.arrayOf(PropTypes.string),
    sizes: PropTypes.arrayOf(
      PropTypes.shape({
        size: PropTypes.string,
        available: PropTypes.bool,
      })
    ),
    sizeGuide: PropTypes.string,
  }),
};
