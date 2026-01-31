import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { products } from '@/data/products';
import { toast } from 'sonner';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, addToCart } = useStore();

  const wishlistProducts = wishlist
    .map((item) => products.find((p) => p.id === item.productId))
    .filter(Boolean);

  const handleAddToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      const variant = product.variants[0];
      addToCart({
        productId: product.id,
        variantSku: variant.sku,
        quantity: 1,
        color: variant.color,
        size: variant.size,
      });
      toast.success('Added to cart');
    }
  };

  if (wishlistProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your wishlist is empty</h1>
            <p className="text-muted-foreground mb-6">
              Save items you love to your wishlist.
            </p>
            <Button asChild>
              <Link to="/shop">Start Shopping</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <h1 className="text-3xl font-bold font-serif mb-8">
            My Wishlist ({wishlistProducts.length})
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => {
              if (!product) return null;
              const variant = product.variants[0];
              const hasDiscount = variant.originalPrice && variant.originalPrice > variant.price;

              return (
                <div
                  key={product.id}
                  className="group bg-card rounded-lg border border-border overflow-hidden"
                >
                  <Link
                    to={`/product/${product.slug}`}
                    className="block aspect-square overflow-hidden bg-muted"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  <div className="p-4">
                    <Link
                      to={`/product/${product.slug}`}
                      className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                      {product.name}
                    </Link>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-bold">${variant.price.toFixed(2)}</span>
                      {hasDiscount && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${variant.originalPrice!.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        className="flex-1"
                        size="sm"
                        onClick={() => handleAddToCart(product.id)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          removeFromWishlist(product.id);
                          toast.success('Removed from wishlist');
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
