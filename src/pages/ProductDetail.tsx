import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Minus, Plus, Star, Truck, RotateCcw, Shield, ChevronRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { products } from '@/data/products';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { ProductCard } from '@/components/product/ProductCard';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = products.find((p) => p.slug === slug);
  
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore();
  
  const [selectedColor, setSelectedColor] = useState(product?.variants[0]?.color || '');
  const [selectedSize, setSelectedSize] = useState(product?.variants[0]?.size || '');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <Button asChild>
              <Link to="/shop">Back to Shop</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);

  // Get unique colors and sizes
  const availableColors = [...new Set(product.variants.map((v) => ({ color: v.color, hex: v.colorHex })))];
  const uniqueColors = availableColors.filter(
    (v, i, a) => a.findIndex((t) => t.color === v.color) === i
  );

  const availableSizes = [...new Set(
    product.variants
      .filter((v) => v.color === selectedColor)
      .map((v) => v.size)
  )];

  // Get selected variant
  const selectedVariant = product.variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );

  const hasDiscount = selectedVariant?.originalPrice && selectedVariant.originalPrice > selectedVariant.price;
  const discountPercent = hasDiscount
    ? Math.round(((selectedVariant!.originalPrice! - selectedVariant!.price) / selectedVariant!.originalPrice!) * 100)
    : 0;

  // Update image when color changes
  const currentImage = selectedVariant?.image || product.images[selectedImageIndex];

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    const variant = product.variants.find((v) => v.color === color);
    if (variant) {
      setSelectedSize(variant.size);
      const imageIndex = product.images.findIndex((img) => img === variant.image);
      if (imageIndex >= 0) setSelectedImageIndex(imageIndex);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error('Please select a size and color');
      return;
    }
    if (selectedVariant.stock < quantity) {
      toast.error('Not enough stock available');
      return;
    }
    addToCart({
      productId: product.id,
      variantSku: selectedVariant.sku,
      quantity,
      color: selectedColor,
      size: selectedSize,
    });
    toast.success('Added to cart!');
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product.id);
      toast.success('Added to wishlist');
    }
  };

  // Related products
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/shop" className="hover:text-primary">Shop</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to={`/shop?category=${product.category.toLowerCase()}`} className="hover:text-primary">
              {product.category}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title & Price */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {product.newArrival && <Badge>New</Badge>}
                  {product.trending && <Badge variant="secondary">Trending</Badge>}
                  {hasDiscount && <Badge variant="destructive">-{discountPercent}%</Badge>}
                </div>
                <h1 className="text-3xl font-bold font-serif text-foreground">{product.name}</h1>
                <p className="text-muted-foreground mt-2">{product.shortDescription}</p>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.averageRating)
                            ? 'fill-primary text-primary'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{product.averageRating}</span>
                  <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-3xl font-bold text-foreground">
                    ${selectedVariant?.price.toFixed(2) || product.variants[0].price.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xl text-muted-foreground line-through">
                      ${selectedVariant?.originalPrice?.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <Separator />

              {/* Color Selection */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Color: <span className="text-muted-foreground">{selectedColor}</span>
                </Label>
                <div className="flex gap-2">
                  {uniqueColors.map(({ color, hex }) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? 'border-primary ring-2 ring-primary ring-offset-2'
                          : 'border-border hover:border-primary/50'
                      }`}
                      style={{ backgroundColor: hex }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Size: <span className="text-muted-foreground">{selectedSize}</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => {
                    const variant = product.variants.find(
                      (v) => v.color === selectedColor && v.size === size
                    );
                    const outOfStock = !variant || variant.stock === 0;
                    
                    return (
                      <Button
                        key={size}
                        variant={selectedSize === size ? 'default' : 'outline'}
                        disabled={outOfStock}
                        onClick={() => setSelectedSize(size)}
                        className={outOfStock ? 'opacity-50' : ''}
                      >
                        {size}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Stock Status */}
              {selectedVariant && (
                <div className="text-sm">
                  {selectedVariant.stock > 10 ? (
                    <span className="text-green-600">In Stock</span>
                  ) : selectedVariant.stock > 0 ? (
                    <span className="text-orange-600">Only {selectedVariant.stock} left</span>
                  ) : (
                    <span className="text-destructive">Out of Stock</span>
                  )}
                </div>
              )}

              {/* Quantity & Actions */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={selectedVariant && quantity >= selectedVariant.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stock === 0}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleWishlistToggle}
                  className={inWishlist ? 'text-destructive border-destructive' : ''}
                >
                  <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="text-center">
                  <Truck className="h-6 w-6 mx-auto text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">Free Shipping</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="h-6 w-6 mx-auto text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">30-Day Returns</p>
                </div>
                <div className="text-center">
                  <Shield className="h-6 w-6 mx-auto text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">Secure Payment</p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <Tabs defaultValue="description" className="mt-12">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none">
                <p className="text-foreground">{product.description}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="mt-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Material</h4>
                  <p className="text-muted-foreground">{product.material}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Fit</h4>
                  <p className="text-muted-foreground">{product.fit}</p>
                </div>
                <div className="sm:col-span-2">
                  <h4 className="font-semibold mb-2">Care Instructions</h4>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {product.washCare.map((care, i) => (
                      <li key={i}>{care}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {product.reviews.length > 0 ? (
                  product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'fill-primary text-primary' : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">Verified</Badge>
                        )}
                      </div>
                      <p className="font-medium">{review.userName}</p>
                      <p className="text-sm text-muted-foreground">{review.date}</p>
                      <p className="mt-2 text-foreground">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No reviews yet.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold font-serif mb-6">You May Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Helper component for Label (inline for simplicity)
const Label = ({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={className} {...props}>{children}</label>
);

export default ProductDetail;
