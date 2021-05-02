# Next Shopping Cart

Shopping cart built utilizing NextJS and the React Context API

## Setup

If you want to add Algolia to your own local version, take a look at the `.example.env` file and add the necessary info from Algolia's API
  - Rename based on your own project
  - Refer to [NextJS Docs](https://nextjs.org/docs/basic-features/environment-variables) for more info

## To-Dos
- [ ] Refactor
  - Sloppy Implementation for Modal & Recommendation system in favor of speed
    - Avoid prop drilling for recs
  - Add subcomponents for dupe code
    - Further refactor
  - Leverage destructuring

- [ ] Improve Algolia Implementation
  - Further refactor
  - [ ] Highlight matches in algolia search
    - [ ] Match can be found in algolia response
  - [ ] Improve responsiveness
  - [ ] Improve design

- [ ] Further utilize sass
  - Color Variables
  - Modules for buttons / Links
    - Other repeated styles

- [ ] Long term styles w/ Chakra / Emotion / Tailwind ...?
- [ ] Handle different quantity adding on subproduct pages

## Implemented
- [X] Added formatCurrency and getItem utils - 5/2/21
- [X] Use SCSS - 5/2/21
- [X] Add Product Recommendation system - 4/30/21
- [X] Add Modal System - 4/30/21
- [X] Add Custom Algolia Implementation - 4/30/21
- [X] Persist cart state via Local Storage - 4/28/21
