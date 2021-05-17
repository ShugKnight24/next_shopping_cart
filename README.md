# Next Shopping Cart

Shopping cart built utilizing NextJS and the React Context API

## Setup

If you want to add Algolia to your own local version, take a look at the `.example.env` file and add the necessary info from Algolia's API
  - Rename based on your own project
  - Refer to [NextJS Docs](https://nextjs.org/docs/basic-features/environment-variables) for more info

## To-Dos
- [ ] Refactor
  - Recommendation system
    - Avoid prop drilling for recs
  - Add subcomponents for dupe code
    - Further refactor
    - Favorites
  - Leverage destructuring where applicable

- [ ] Improve Algolia Implementation
  - Further refactor
  - [ ] Highlight matches in algolia search
    - [ ] Match can be found in algolia response
  - [ ] Improve responsiveness
  - [ ] Improve design

- [ ] Further utilize sass
  - Other repeated styles

- [ ] Long term styles w/ Chakra / Emotion / Tailwind ...?
- [ ] Handle different quantity adding on subproduct pages

- [ ] Refactor Carousel Styles
  - Especially when smaller horizontal screens and screens with little vertical space
  - Also on really large screens - Arrows get pushed
  - Add down arrow to next section

- Modal Colors
  - Not a fan of button color combo when clear & delete

- Refactor Hit to be robust enough to handle initial Algolia logo

- Improve Product Cards and Favorites Card
  - Differentiate or make robust enough to distinguish between
- Create a popular items list

## Future Ideas
- Discount Code system...
  - Discount system on recommended products ...?
    - How to best handle...
      - Apply discount for each product pair... add to cart together

## Implemented
- [X] Add PropTypes - 5/17/21
- [X] Refactor subproduct pages - 5/17/21
- [X] Add remove from cart button to product cards - 5/17/21
- [X] Implemented Favorites system - 5/16/21
- [X] Fixed delete functionality and quantity correctly updated - 5/16/21
- [X] Add Algolia Logo and refactor misc logic - 5/16/21
- [X] Refactored Carousel logic - 5/15/21
- [X] Tech Items sub pages work properly - 5/12/21
- [X] scss color vars & buttons - 5/12/21
- [X] Add carousel to home page - 5/11/21
- [X] Refactor Cart Counter - 5/10/21
- [X] Add more Items - 5/10/21
- [X] Sticky Nav & Improve Cart Count - 5/9/21
- [X] Improve Cart design - 5/9/21
- [X] Product 'Card' subcomponents & improved styling - 5/8/21
- [X] Fixed delete item bug that caused wrong item to be deleted - 5/4/21
- [X] Refactored Modal system - 5/4/21
- [X] Added formatCurrency and getItem utils - 5/2/21
- [X] Use SCSS - 5/2/21
- [X] Add Product Recommendation system - 4/30/21
- [X] Add Modal System - 4/30/21
- [X] Add Custom Algolia Implementation - 4/30/21
- [X] Persist cart state via Local Storage - 4/28/21

## Project Decisions
Removed 'Add to Cart' modal as it made the UX clunky. Keeping the component if anyone would like that implementation. Can see it's value with products that are highly customizable, but it's overkill in a generic cart system
