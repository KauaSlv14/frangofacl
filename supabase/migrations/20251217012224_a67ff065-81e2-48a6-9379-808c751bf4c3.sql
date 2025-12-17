-- Enum for order status
CREATE TYPE public.order_status AS ENUM ('novo', 'em_preparo', 'a_caminho', 'entregue', 'cancelado');

-- Enum for payment method
CREATE TYPE public.payment_method AS ENUM ('pix', 'entrega');

-- Enum for delivery type
CREATE TYPE public.delivery_type AS ENUM ('entrega', 'retirada');

-- Enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT DEFAULT 'prato',
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Accompaniments table
CREATE TABLE public.accompaniments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number SERIAL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  delivery_type public.delivery_type NOT NULL DEFAULT 'entrega',
  payment_method public.payment_method NOT NULL DEFAULT 'pix',
  status public.order_status NOT NULL DEFAULT 'novo',
  observations TEXT,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  accompaniments TEXT[],
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Settings table for delivery fee
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accompaniments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Function to check admin role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Products policies (public read, admin write)
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Accompaniments policies (public read, admin write)
CREATE POLICY "Accompaniments are viewable by everyone" ON public.accompaniments FOR SELECT USING (true);
CREATE POLICY "Admins can insert accompaniments" ON public.accompaniments FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update accompaniments" ON public.accompaniments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete accompaniments" ON public.accompaniments FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Orders policies (anyone can create, admins can view/update all)
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Order items policies
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view order items" ON public.order_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Settings policies (public read, admin write)
CREATE POLICY "Settings are viewable by everyone" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Insert default products
INSERT INTO public.products (name, description, price, category) VALUES
  ('Frango e Linguiça', 'Delicioso frango assado com linguiça calabresa', 17.00, 'prato'),
  ('Carne Trinchada', 'Carne bovina trinchada na brasa', 17.00, 'prato'),
  ('Frango ao Molho', 'Frango suculento ao molho especial', 17.00, 'prato'),
  ('Tilápia Assada', 'Tilápia fresca assada na brasa', 17.00, 'prato');

-- Insert default accompaniments
INSERT INTO public.accompaniments (name) VALUES
  ('Arroz'),
  ('Baião de Dois'),
  ('Macarrão'),
  ('Feijão'),
  ('Salada'),
  ('Farofa');

-- Insert default settings
INSERT INTO public.settings (key, value) VALUES ('delivery_fee', '5.00');

-- Insert 3 test orders
INSERT INTO public.orders (customer_name, customer_phone, customer_address, delivery_type, payment_method, status, subtotal, delivery_fee, total) VALUES
  ('João Silva', '(85) 99999-1111', 'Rua das Flores, 123', 'entrega', 'pix', 'novo', 34.00, 5.00, 39.00),
  ('Maria Santos', '(85) 99999-2222', 'Av. Principal, 456', 'entrega', 'entrega', 'em_preparo', 51.00, 5.00, 56.00),
  ('Pedro Oliveira', '(85) 99999-3333', NULL, 'retirada', 'pix', 'entregue', 17.00, 0.00, 17.00);

-- Insert test order items
INSERT INTO public.order_items (order_id, product_id, product_name, quantity, price, accompaniments)
SELECT o.id, p.id, p.name, 2, p.price, ARRAY['Arroz', 'Feijão', 'Salada']
FROM public.orders o, public.products p
WHERE o.customer_name = 'João Silva' AND p.name = 'Frango e Linguiça';

INSERT INTO public.order_items (order_id, product_id, product_name, quantity, price, accompaniments)
SELECT o.id, p.id, p.name, 3, p.price, ARRAY['Baião de Dois', 'Macarrão', 'Farofa']
FROM public.orders o, public.products p
WHERE o.customer_name = 'Maria Santos' AND p.name = 'Carne Trinchada';

INSERT INTO public.order_items (order_id, product_id, product_name, quantity, price, accompaniments)
SELECT o.id, p.id, p.name, 1, p.price, ARRAY['Arroz', 'Salada']
FROM public.orders o, public.products p
WHERE o.customer_name = 'Pedro Oliveira' AND p.name = 'Tilápia Assada';