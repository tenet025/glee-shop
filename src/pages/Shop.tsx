import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Grid, List, X } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { products, categories } from '@/data/products';
import { Separator } from '@/components/ui/separator';

const allColors = [...new Set(products.flatMap((p) => p.variants.map((v) => v.color)))];
const allSizes = [...new Set(products.flatMap((p) => p.variants.map((v) => v.size)))];
const priceRange = { min: 0, max: 200 };

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceFilter, setPriceFilter] = useState<[number, number]>([0, 200]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');

  const categorySlug = searchParams.get('category');
  const searchQuery = searchParams.get('search') || '';

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (categorySlug) {
      result = result.filter(
        (p) => p.category.toLowerCase() === categorySlug.toLowerCase()
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Price filter
    result = result.filter((p) => {
      const minPrice = Math.min(...p.variants.map((v) => v.price));
      return minPrice >= priceFilter[0] && minPrice <= priceFilter[1];
    });

    // Color filter
    if (selectedColors.length > 0) {
      result = result.filter((p) =>
        p.variants.some((v) => selectedColors.includes(v.color))
      );
    }

    // Size filter
    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.variants.some((v) => selectedSizes.includes(v.size))
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.variants[0].price - b.variants[0].price);
        break;
      case 'price-high':
        result.sort((a, b) => b.variants[0].price - a.variants[0].price);
        break;
      case 'rating':
        result.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [categorySlug, searchQuery, priceFilter, selectedColors, selectedSizes, sortBy]);

  const activeFiltersCount =
    (categorySlug ? 1 : 0) +
    (priceFilter[0] > 0 || priceFilter[1] < 200 ? 1 : 0) +
    selectedColors.length +
    selectedSizes.length;

  const clearFilters = () => {
    setSearchParams({});
    setPriceFilter([0, 200]);
    setSelectedColors([]);
    setSelectedSizes([]);
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="font-semibold mb-3">Categories</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={categorySlug === category.slug ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => {
                if (categorySlug === category.slug) {
                  searchParams.delete('category');
                } else {
                  searchParams.set('category', category.slug);
                }
                setSearchParams(searchParams);
              }}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h4 className="font-semibold mb-3">Price Range</h4>
        <Slider
          value={priceFilter}
          onValueChange={(value) => setPriceFilter(value as [number, number])}
          min={priceRange.min}
          max={priceRange.max}
          step={10}
          className="mb-2"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>${priceFilter[0]}</span>
          <span>${priceFilter[1]}</span>
        </div>
      </div>

      <Separator />

      {/* Colors */}
      <div>
        <h4 className="font-semibold mb-3">Colors</h4>
        <div className="flex flex-wrap gap-2">
          {allColors.map((color) => (
            <label
              key={color}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={selectedColors.includes(color)}
                onCheckedChange={() => toggleColor(color)}
              />
              <span className="text-sm">{color}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Sizes */}
      <div>
        <h4 className="font-semibold mb-3">Sizes</h4>
        <div className="flex flex-wrap gap-2">
          {allSizes.map((size) => (
            <Button
              key={size}
              variant={selectedSizes.includes(size) ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleSize(size)}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-serif text-foreground">
              {categorySlug
                ? categories.find((c) => c.slug === categorySlug)?.name || 'Shop'
                : 'All Products'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {filteredProducts.length} products found
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge className="ml-2">{activeFiltersCount}</Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Active:</span>
                  {categorySlug && (
                    <Badge variant="secondary" className="gap-1">
                      {categorySlug}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => {
                          searchParams.delete('category');
                          setSearchParams(searchParams);
                        }}
                      />
                    </Badge>
                  )}
                  {selectedColors.map((color) => (
                    <Badge key={color} variant="secondary" className="gap-1">
                      {color}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => toggleColor(color)}
                      />
                    </Badge>
                  ))}
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="hidden sm:flex border border-border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <FilterContent />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {filteredProducts.length > 0 ? (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }
                >
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">No products found</p>
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
