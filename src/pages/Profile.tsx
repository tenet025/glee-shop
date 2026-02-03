import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  User, Package, MapPin, LogOut, Plus, Trash2, Edit2, Check, X 
} from 'lucide-react';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

interface ShippingAddress {
  id: string;
  full_name: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  shipping_address: {
    firstName: string;
    lastName: string;
    city: string;
    state: string;
  };
}

interface OrderItem {
  id: string;
  product_name: string;
  variant_sku: string;
  color: string | null;
  size: string | null;
  quantity: number;
  price: number;
  image_url: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '' });
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
    phone: '',
    is_default: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchProfile(), fetchAddresses(), fetchOrders()]);
    setLoading(false);
  };

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setProfileForm({ full_name: data.full_name || '', phone: data.phone || '' });
    }
  };

  const fetchAddresses = async () => {
    const { data } = await supabase
      .from('shipping_addresses')
      .select('*')
      .order('is_default', { ascending: false });

    if (data) setAddresses(data);
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      // Type assertion for JSONB shipping_address field
      const typedOrders = data.map((order) => ({
        ...order,
        shipping_address: order.shipping_address as unknown as Order['shipping_address'],
      }));
      setOrders(typedOrders);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    const { data } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (data) setOrderItems(data);
  };

  const handleUpdateProfile = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profileForm.full_name,
        phone: profileForm.phone,
      })
      .eq('user_id', user?.id);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated!');
      setEditingProfile(false);
      fetchProfile();
    }
  };

  const handleAddAddress = async () => {
    const { error } = await supabase.from('shipping_addresses').insert({
      user_id: user?.id,
      ...addressForm,
    });

    if (error) {
      toast.error('Failed to add address');
    } else {
      toast.success('Address added!');
      setShowAddAddress(false);
      setAddressForm({
        full_name: '',
        street_address: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'United States',
        phone: '',
        is_default: false,
      });
      fetchAddresses();
    }
  };

  const handleDeleteAddress = async (id: string) => {
    const { error } = await supabase.from('shipping_addresses').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete address');
    } else {
      toast.success('Address deleted!');
      fetchAddresses();
    }
  };

  const handleSetDefault = async (id: string) => {
    // First, unset all defaults
    await supabase
      .from('shipping_addresses')
      .update({ is_default: false })
      .eq('user_id', user?.id);

    // Then set the new default
    const { error } = await supabase
      .from('shipping_addresses')
      .update({ is_default: true })
      .eq('id', id);

    if (error) {
      toast.error('Failed to set default address');
    } else {
      toast.success('Default address updated!');
      fetchAddresses();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success('Signed out successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold font-serif">My Account</h1>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <Package className="h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="addresses" className="gap-2">
                <MapPin className="h-4 w-4" />
                Addresses
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Profile Information</CardTitle>
                  {!editingProfile ? (
                    <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleUpdateProfile}>
                        <Check className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingProfile(false)}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      {editingProfile ? (
                        <Input
                          value={profileForm.full_name}
                          onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                        />
                      ) : (
                        <p className="text-foreground">{profile?.full_name || 'Not set'}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <p className="text-foreground">{profile?.email || user?.email}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      {editingProfile ? (
                        <Input
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        />
                      ) : (
                        <p className="text-foreground">{profile?.phone || 'Not set'}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No orders yet</p>
                        <Button asChild className="mt-4">
                          <Link to="/shop">Start Shopping</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.map((order) => (
                          <div
                            key={order.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedOrder?.id === order.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                            }`}
                            onClick={() => {
                              setSelectedOrder(order);
                              fetchOrderItems(order.id);
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono text-sm font-medium">{order.order_number}</span>
                              <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>{new Date(order.created_at).toLocaleDateString()}</span>
                              <span className="font-medium text-foreground">${order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selectedOrder && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Details</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedOrder.order_number}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Items</h4>
                        <div className="space-y-3">
                          {orderItems.map((item) => (
                            <div key={item.id} className="flex gap-3">
                              {item.image_url && (
                                <img
                                  src={item.image_url}
                                  alt={item.product_name}
                                  className="w-16 h-16 rounded object-cover"
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-medium">{item.product_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.color} / {item.size} × {item.quantity}
                                </p>
                                <p className="text-sm font-medium">${item.price.toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium mb-2">Shipping Address</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedOrder.shipping_address.firstName} {selectedOrder.shipping_address.lastName}
                          <br />
                          {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}
                        </p>
                      </div>

                      <Separator />

                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>${selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Saved Addresses</CardTitle>
                  <Button onClick={() => setShowAddAddress(!showAddAddress)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Address
                  </Button>
                </CardHeader>
                <CardContent>
                  {showAddAddress && (
                    <div className="mb-6 p-4 border rounded-lg bg-muted/30">
                      <h4 className="font-medium mb-4">New Address</h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Full Name</Label>
                          <Input
                            value={addressForm.full_name}
                            onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Street Address</Label>
                          <Input
                            value={addressForm.street_address}
                            onChange={(e) => setAddressForm({ ...addressForm, street_address: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Input
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>State</Label>
                          <Input
                            value={addressForm.state}
                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>ZIP Code</Label>
                          <Input
                            value={addressForm.postal_code}
                            onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Country</Label>
                          <Input
                            value={addressForm.country}
                            onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button onClick={handleAddAddress}>Save Address</Button>
                        <Button variant="outline" onClick={() => setShowAddAddress(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}

                  {addresses.length === 0 && !showAddAddress ? (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No saved addresses</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="p-4 border rounded-lg relative">
                          {address.is_default && (
                            <Badge className="absolute top-2 right-2">Default</Badge>
                          )}
                          <p className="font-medium">{address.full_name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {address.street_address}
                            <br />
                            {address.city}, {address.state} {address.postal_code}
                            <br />
                            {address.country}
                          </p>
                          {address.phone && (
                            <p className="text-sm text-muted-foreground mt-1">{address.phone}</p>
                          )}
                          <div className="flex gap-2 mt-3">
                            {!address.is_default && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetDefault(address.id)}
                              >
                                Set Default
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteAddress(address.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
