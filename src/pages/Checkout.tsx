import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Truck, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useDeliveryFee } from '@/hooks/useProducts';
import { useCreateOrder } from '@/hooks/useOrders';
import { DeliveryType, PaymentMethod } from '@/types';
import { toast } from 'sonner';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { data: deliveryFee = 5 } = useDeliveryFee();
  const createOrder = useCreateOrder();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('entrega');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [observations, setObservations] = useState('');
  const [pixCopied, setPixCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const PIX_KEY = "85999991111";
  const actualDeliveryFee = deliveryType === 'entrega' ? deliveryFee : 0;
  const total = subtotal + actualDeliveryFee;

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const copyPixKey = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setPixCopied(true);
    toast.success('Chave Pix copiada!');
    setTimeout(() => setPixCopied(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error('Por favor, informe seu nome');
      return;
    }

    if (!customerPhone.trim()) {
      toast.error('Por favor, informe seu telefone');
      return;
    }

    if (deliveryType === 'entrega' && !customerAddress.trim()) {
      toast.error('Por favor, informe seu endereço');
      return;
    }

    setIsSubmitting(true);

    try {
      await createOrder.mutateAsync({
        customerName,
        customerPhone,
        customerAddress: deliveryType === 'entrega' ? customerAddress : undefined,
        deliveryType,
        paymentMethod,
        observations,
        items,
        subtotal,
        deliveryFee: actualDeliveryFee,
        total
      });

      clearCart();
      toast.success('Pedido realizado com sucesso!');
      
      const whatsappMessage = encodeURIComponent(
        `Olá! Acabei de fazer um pedido:\n\n` +
        `Nome: ${customerName}\n` +
        `Telefone: ${customerPhone}\n` +
        `${deliveryType === 'entrega' ? `Endereço: ${customerAddress}\n` : 'Retirada no local\n'}` +
        `Pagamento: ${paymentMethod === 'pix' ? 'Pix' : 'Na entrega'}\n\n` +
        `Total: ${formatPrice(total)}`
      );
      
      window.open(`https://wa.me/5585999991111?text=${whatsappMessage}`, '_blank');
      navigate('/');
    } catch (error) {
      toast.error('Erro ao criar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h2>
          <Button onClick={() => navigate('/')}>Voltar ao cardápio</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <h1 className="text-3xl font-bold text-foreground mb-8">Finalizar Pedido</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Seus Dados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone / WhatsApp *</Label>
                    <Input
                      id="phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(85) 99999-9999"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Entrega ou Retirada</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={deliveryType}
                    onValueChange={(v) => setDeliveryType(v as DeliveryType)}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem
                        value="entrega"
                        id="entrega"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="entrega"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <Truck className="mb-2 h-6 w-6" />
                        Entrega
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value="retirada"
                        id="retirada"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="retirada"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <Store className="mb-2 h-6 w-6" />
                        Retirada
                      </Label>
                    </div>
                  </RadioGroup>

                  {deliveryType === 'entrega' && (
                    <div className="mt-4">
                      <Label htmlFor="address">Endereço completo *</Label>
                      <Textarea
                        id="address"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="Rua, número, bairro, ponto de referência..."
                        required
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Forma de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="pix" id="pix" />
                      <Label htmlFor="pix" className="flex-1 cursor-pointer">
                        <span className="font-medium">Pix</span>
                        <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                      <RadioGroupItem value="entrega" id="na-entrega" />
                      <Label htmlFor="na-entrega" className="flex-1 cursor-pointer">
                        <span className="font-medium">Pagar na Entrega</span>
                        <p className="text-sm text-muted-foreground">Dinheiro ou cartão</p>
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === 'pix' && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-2">Chave Pix (Telefone):</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-background p-2 rounded text-sm">
                          {PIX_KEY}
                        </code>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={copyPixKey}
                        >
                          {pixCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Envie o comprovante pelo WhatsApp
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Alguma observação geral sobre o pedido?"
                  />
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.product.name}
                        </span>
                        <span>{formatPrice(item.product.price * item.quantity)}</span>
                      </div>
                    ))}

                    <Separator />

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Taxa de entrega</span>
                      <span>
                        {deliveryType === 'retirada' ? 'Grátis' : formatPrice(actualDeliveryFee)}
                      </span>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(total)}</span>
                    </div>

                    <Button
                      type="submit"
                      className="w-full gradient-primary text-lg py-6 mt-4"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Enviando...' : 'Confirmar Pedido'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
