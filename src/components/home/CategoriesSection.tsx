import { Link } from 'react-router-dom';
import { categories } from '@/data/products';

export const CategoriesSection = () => {
  return (
    <section className="py-16 bg-card">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold font-serif text-foreground">Shop by Category</h2>
          <p className="text-muted-foreground mt-2">Find exactly what you're looking for</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.slug}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-background font-serif">{category.name}</h3>
                <p className="text-background/80 mt-1">
                  {category.subCategories.length} categories
                </p>
                <span className="inline-block mt-3 text-sm text-background font-medium border-b border-background/50 group-hover:border-background transition-colors">
                  Explore Collection →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
