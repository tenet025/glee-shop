import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PromoBanner = () => {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-serif">
              Summer Sale
            </h2>
            <p className="text-primary-foreground/80 mt-2 text-lg">
              Up to 50% off on selected items. Use code <strong>SUMMER50</strong>
            </p>
          </div>
          <Button asChild variant="secondary" size="lg" className="group">
            <Link to="/shop?sale=true">
              Shop the Sale
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
