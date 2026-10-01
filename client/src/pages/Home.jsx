import React from "react";
import Hero from "../components/home/Hero";
import ShopCategories from "../components/home/ShopCategories";
import ProductSection from "../components/home/ProductSection";
import SpecialOffer from "../components/home/SpecialOffer";
import WhyChooseShopnet from "../components/home/WhyChooseShopnet";
import LazySection from "../components/LazySection";

const Home = () => {
  return (
    <main className="home-page">

      {/* ----------------------------------
          HERO
          Render immediately
      ---------------------------------- */}
      <Hero />


      {/* ----------------------------------
          SHOP CATEGORIES
      ---------------------------------- */}
      <LazySection minHeight="500px">
        <ShopCategories />
      </LazySection>


      {/* ----------------------------------
          PRODUCTS
      ---------------------------------- */}
      <LazySection minHeight="600px">
        <ProductSection />
      </LazySection>


      {/* ----------------------------------
          SPECIAL OFFER
      ---------------------------------- */}
      <LazySection minHeight="500px">
        <SpecialOffer />
      </LazySection>


      {/* ----------------------------------
          WHY CHOOSE SHOPNET
      ---------------------------------- */}
      <LazySection minHeight="500px">
        <WhyChooseShopnet />
      </LazySection>

    </main>
  );
};


export default Home
// // src    basic chart of hero and shopcategory
// │
// ├── components
// │   ├── Header.jsx
// │   ├── Footer.jsx
// │   │
// │   └── home
// │       ├── Hero.jsx
// │       ├── ShopCategories.jsx
// │       └── BrandOrbit.jsx
// │
// ├── pages
// │   ├── Home.jsx
// │   ├── About.jsx
// │   └── Advertisement.jsx
// │
// └── style
//     ├── navbar.css
//     ├── footer.css
//     ├── about.css
//     │
//     └── componentsCss
//         └── home
//             ├── hero.css
//             ├── categories.css
//             └── brandOrbit.css