import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToWishlist, removeFromWishlist, isInWishlist, addToCart } = useStore();
  const inWishlist = isInWishlist(product.id);
  
  const defaultVariant = product.variants[0];
  const hasDiscount = defaultVariant.originalPrice && defaultVariant.originalPrice > defaultVariant.price;
  const discountPercent = hasDiscount
    ? Math.round(((defaultVariant.originalPrice! - defaultVariant.price) / defaultVariant.originalPrice!) * 100)
    : 0;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product.id);
      toast.success('Added to wishlist');
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      variantSku: defaultVariant.sku,
      quantity: 1,
      color: defaultVariant.color,
      size: defaultVariant.size,
    });
    toast.success('Added to cart');
  };

  const availableColors = [...new Set(product.variants.map((v) => v.colorHex))];

  return (
    <Link to={`/product/${product.slug}`}>
      <Card className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.images[0]}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hasDiscount && (
              <Badge variant="destructive" className="text-xs">
                -{discountPercent}%
              </Badge>
            )}
            {product.newArrival && (
              <Badge className="text-xs bg-primary">New</Badge>
            )}
            {product.trending && (
              <Badge variant="secondary" className="text-xs">Trending</Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-3 right-3 bg-card/80 backdrop-blur hover:bg-card ${
              inWishlist ? 'text-destructive' : 'text-muted-foreground'
            }`}
            onClick={handleWishlistToggle}
          >
            <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
          </Button>

          {/* Quick Add Button */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button
              className="w-full"
              onClick={handleQuickAdd}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Color Options */}
          <div className="flex gap-1 mb-2">
            {availableColors.slice(0, 4).map((color) => (
              <div
                key={color}
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: color }}
              />
            ))}
            {availableColors.length > 4 && (
              <span className="text-xs text-muted-foreground">+{availableColors.length - 4}</span>
            )}
          </div>

          {/* Product Info */}
          <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
            {product.shortDescription}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-medium">{product.averageRating}</span>
            <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-foreground">
              ${defaultVariant.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ${defaultVariant.originalPrice!.toFixed(2)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
