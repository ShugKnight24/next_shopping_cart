# Next Shopping Cart

Shopping cart built utilizing NextJS and the React Context API

## Setup

### Installation & Running

```bash
npm install
npm run dev
```

### Algolia

If you want to add Algolia to your own local version, take a look at the `.example.env` file and add the necessary info from Algolia's API

### Google Analytics

In order to add Google Analytics, add your App's tracking ID to the `.example.env`, which will start basic tracking. Look at the docs for Events and PageViews for more customized tracking in [More Info](#more-info)

### Environment Variable

- Rename `.example.env` based on your own project
- Refer to [NextJS Docs](https://nextjs.org/docs/basic-features/environment-variables) for more info

## To-Dos

- [ ] Refactor issues from NextJS & React API changes

  - Update to use the latest from both API updates
  - Integrate React 19

- [ ] Sass clean up

  - Refactor new app.css / old import system not needed
    - utilize `@forward` and `@use` correctly
  - Refactor to use more variables
  - Fix any broken system
  - Remove duplicate styles
  - Move to scss modules?

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

- Check the [Changelog](./CHANGELOG.md)

## Project Decisions

Removed 'Add to Cart' modal as it made the UX clunky. Keeping the component if anyone would like that implementation. Can see it's value with products that are highly customizable, but it's overkill in a generic cart system

## More Info

### Analytics

#### Google Analytics Setup

- [Events](https://developers.google.com/analytics/devguides/collection/gtagjs/events)
- [PageViews](https://developers.google.com/analytics/devguides/collection/gtagjs/pages)
- [Next Custom Document](https://nextjs.org/docs/advanced-features/custom-document)
