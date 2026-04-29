import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, Heart, ShieldCheck, Truck, RefreshCw, Star, ArrowLeft, ImagePlus, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, getDoc, collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, ProductVariant } from '../types';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    // Determine the current stock based on the variant selected
    if (selectedVariant !== null && typeof selectedVariant.stock !== 'undefined') {
       // if we changed variant and quantity exceeds the new variant stock, adjust it
       setQuantity(q => {
          if (selectedVariant.stock <= 0) return 1; // will be disabled anyway, but reset
          return Math.min(q, selectedVariant.stock);
       });
    }
  }, [selectedVariant]);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        } else {
          navigate('/category/all');
          return;
        }

        // Fetch reviews
        const q = query(collection(db, 'reviews'), where('productId', '==', id), where('status', '==', 'approved'));
        const reviewSnap = await getDocs(q);
        setReviews(reviewSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndReviews();
  }, [id, navigate]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const max = 800;
          if (width > height) {
            if (width > max) { height *= max / width; width = max; }
          } else {
            if (height > max) { width *= max / height; height = max; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const base64 = await compressImage(file);
    setReviewImages(prev => [...prev, base64].slice(0, 3)); // Max 3 images
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to submit a review");
      navigate('/login');
      return;
    }
    setSubmittingReview(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        productId: id,
        productName: product?.name || '',
        userId: user.uid,
        userName: user.displayName || 'Customer',
        rating: reviewRating,
        comment: reviewText,
        images: reviewImages,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      alert('Review submitted successfully! It will appear once approved.');
      setReviewFormOpen(false);
      setReviewText('');
      setReviewRating(5);
      setReviewImages([]);
    } catch (err) {
      console.error(err);
      alert('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };
  const isFavorited = isInWishlist(product?.id || '');

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const currentPrice = selectedVariant?.price || product.price;
  const currentStock = selectedVariant?.stock ?? product.stock;

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isFavorited) {
      await removeFromWishlist(product.id || '');
    } else {
      await addToWishlist(product.id || '');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Images */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-[4/5] overflow-hidden rounded-[2rem] bg-gray-100"
          >
            <img 
              src={product.images[activeImage]} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="flex space-x-4">
            {product.images.map((img, i) => (
              <button 
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-brand-gold bg-brand-gold/10' : 'border-transparent'}`}
              >
                <img src={img} alt={`View ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-brand-gold">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 text-gray-300" />
                <span className="text-xs font-medium text-gray-400 uppercase tracking-widest ml-2">4.8 (24 Reviews)</span>
              </div>
              <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-brand-olive transition-colors flex items-center space-x-1">
                <ArrowLeft className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Back</span>
              </button>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-olive mb-4">{product.name}</h1>
            <div className="flex items-baseline space-x-4">
              <p className="text-3xl font-medium text-brand-gold">₹{currentPrice.toLocaleString()}</p>
              {selectedVariant?.price && selectedVariant.price !== product.price && (
                <span className="text-sm text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
              )}
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed text-lg">
            {product.description}
          </p>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-6 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-brand-olive px-1">Select Option</h4>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-6 py-3 rounded-2xl border transition-all text-xs font-bold tracking-widest uppercase ${
                      selectedVariant?.id === variant.id 
                      ? 'border-brand-gold bg-brand-gold/5 text-brand-gold shadow-sm' 
                      : 'border-brand-olive/10 text-gray-400 hover:border-brand-gold/50'
                    }`}
                  >
                    {variant.name} {variant.price ? `(+₹${(variant.price - product.price).toLocaleString()})` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 py-8 border-y border-brand-olive/10">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Material</p>
              <p className="font-medium text-gray-900">{selectedVariant?.type === 'material' ? selectedVariant.name : (product.material || 'Handcrafted Mixed Material')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Availability</p>
              <p className={`font-medium ${currentStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {currentStock > 0 ? `In Stock (${currentStock} units)` : 'Out of Stock'}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className={`flex items-center border ${currentStock === 0 ? 'border-gray-200' : 'border-brand-olive/20'} rounded-full px-4 py-2`}>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || currentStock === 0}
                  className="w-10 h-10 text-xl text-gray-400 hover:text-brand-olive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >-</button>
                <span className="w-12 text-center font-bold">{currentStock === 0 ? 0 : quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  disabled={quantity >= currentStock || currentStock === 0}
                  className="w-10 h-10 text-xl text-gray-400 hover:text-brand-olive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >+</button>
              </div>
              <button 
                onClick={() => {
                  const finalProduct = {
                    ...product,
                    price: currentPrice,
                    name: selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name
                  };
                  addToCart(finalProduct, quantity);
                }}
                disabled={currentStock === 0}
                className="flex-grow bg-brand-olive text-brand-cream py-5 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center space-x-3 shadow-lg hover:bg-brand-olive/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{currentStock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>
              <button 
                onClick={handleWishlistToggle}
                className={`p-5 rounded-full border transition-all ${isFavorited ? 'border-red-500 text-red-500 bg-red-50' : 'border-brand-olive/20 text-gray-400 hover:text-red-500 hover:border-red-500'}`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: ShieldCheck, label: 'Secure Payment' },
                { icon: Truck, label: 'Free Shipping' },
                { icon: RefreshCw, label: '10 Day Returns' }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center p-4 bg-white rounded-2xl border border-gray-50 text-center">
                  <item.icon className="w-6 h-6 text-brand-gold mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="mt-24 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
           <h2 className="text-3xl font-serif font-bold text-brand-olive text-center md:text-left mb-6 md:mb-0">Customer Reviews</h2>
           <button 
             onClick={() => {
                if (!user) {
                   navigate('/login');
                } else {
                   setReviewFormOpen(!reviewFormOpen);
                }
             }}
             className="px-6 py-3 border-2 border-brand-olive text-brand-olive font-bold uppercase tracking-widest text-xs rounded-full hover:bg-brand-olive hover:text-brand-cream transition-colors"
           >
             {reviewFormOpen ? 'Cancel' : 'Write a Review'}
           </button>
        </div>
        
        <AnimatePresence>
           {reviewFormOpen && (
              <motion.div 
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 exit={{ opacity: 0, height: 0 }}
                 className="overflow-hidden mb-12"
              >
                 <form onSubmit={submitReview} className="bg-white p-8 rounded-3xl border border-brand-olive/10 shadow-sm space-y-6">
                    <div>
                       <label className="block text-xs font-bold uppercase tracking-widest text-brand-olive mb-2">Rating</label>
                       <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                             <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                className="focus:outline-none"
                             >
                                <Star className={`w-8 h-8 ${reviewRating >= star ? 'text-brand-gold fill-current' : 'text-gray-200'}`} />
                             </button>
                          ))}
                       </div>
                    </div>
                    
                    <div>
                       <label className="block text-xs font-bold uppercase tracking-widest text-brand-olive mb-2">Your Review</label>
                       <textarea 
                          required
                          rows={4}
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="What did you love about this item?"
                          className="w-full px-4 py-3 rounded-2xl border-brand-olive/20 focus:border-brand-gold focus:ring-brand-gold transition-colors outline-none"
                       />
                    </div>
                    
                    <div>
                       <label className="block text-xs font-bold uppercase tracking-widest text-brand-olive mb-2">Add Photos (up to 3)</label>
                       <div className="flex flex-wrap gap-4">
                          {reviewImages.map((img, i) => (
                             <div key={i} className="relative w-24 h-24 rounded-2xl border bg-gray-50">
                                <img src={img} alt="Upload" className="w-full h-full object-cover rounded-2xl" />
                                <button
                                   type="button"
                                   onClick={() => setReviewImages(reviewImages.filter((_, idx) => idx !== i))}
                                   className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                                >
                                   <X className="w-3 h-3" />
                                </button>
                             </div>
                          ))}
                          
                          {reviewImages.length < 3 && (
                             <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-brand-gold hover:bg-brand-gold/5 transition-colors text-gray-400 hover:text-brand-gold">
                                <ImagePlus className="w-6 h-6 mb-1" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Add Photo</span>
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                             </label>
                          )}
                       </div>
                    </div>
                    
                    <button 
                       type="submit"
                       disabled={submittingReview}
                       className="w-full bg-brand-olive text-brand-cream py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-brand-olive/90 transition-colors disabled:opacity-50"
                    >
                       {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                 </form>
              </motion.div>
           )}
        </AnimatePresence>
        
        <div className="space-y-8">
          {reviews.length > 0 ? reviews.map((review) => (
            <div key={review.id} className="bg-white p-8 rounded-3xl shadow-sm border border-brand-olive/5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-brand-olive text-lg">{review.userName}</h4>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
                     {review.createdAt?.seconds ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                  </p>
                </div>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={`w-4 h-4 ${j < review.rating ? 'text-brand-gold fill-current' : 'text-gray-200'}`} />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">{review.comment}</p>
              
              {review.images && review.images.length > 0 && (
                 <div className="flex space-x-4 mt-6">
                    {review.images.map((img: string, i: number) => (
                       <a key={i} href={img} target="_blank" rel="noreferrer">
                          <img src={img} alt="Customer upload" className="w-24 h-24 object-cover rounded-2xl border" />
                       </a>
                    ))}
                 </div>
              )}
            </div>
          )) : (
            <div className="text-center p-12 bg-gray-50 rounded-3xl border border-gray-100">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h4 className="font-serif text-xl font-bold text-brand-olive mb-2">No reviews yet</h4>
              <p className="text-gray-500 max-w-sm mx-auto">Be the first to share your experience with this beautiful piece of handcrafted elegance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
