import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { ProductsSection } from '@/components/home/ProductsSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { PromoBanner } from '@/components/home/PromoBanner';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <ProductsSection
          title="Featured Products"
          subtitle="Handpicked favorites for you"
          filter="featured"
        />
        <CategoriesSection />
        <ProductsSection
          title="Trending Now"
          subtitle="What's hot this season"
          filter="trending"
        />
        <PromoBanner />
        <ProductsSection
          title="New Arrivals"
          subtitle="Fresh styles just dropped"
          filter="newArrival"
        />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
