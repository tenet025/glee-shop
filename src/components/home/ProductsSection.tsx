import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/ProductCard';
import { products } from '@/data/products';

interface ProductsSectionProps {
  title: string;
  subtitle?: string;
  filter: 'featured' | 'trending' | 'newArrival';
  limit?: number;
}

export const ProductsSection = ({ title, subtitle, filter, limit = 4 }: ProductsSectionProps) => {
  const filteredProducts = products
    .filter((product) => {
      if (filter === 'featured') return product.featured;
      if (filter === 'trending') return product.trending;
      if (filter === 'newArrival') return product.newArrival;
      return true;
    })
    .slice(0, limit);

  return (
    <section className="py-16">
      <div className="container">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold font-serif text-foreground">{title}</h2>
            {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
          </div>
          <Button asChild variant="ghost" className="group">
            <Link to="/shop">
              View All
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
