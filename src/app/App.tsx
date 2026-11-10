import { BrowserRouter, Route, Routes } from 'react-router';
import { CarrinhoPage } from '../features/carrinho/CarrinhoPage';
import { CatalogoPage } from '../features/catalogo/CatalogoPage';
import { ProdutoPage } from '../features/catalogo/ProdutoPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { CheckoutPage } from '../features/checkout/CheckoutPage';
import { OrderPage } from '../features/pedidos/OrderPage';
import { PedidosPage } from '../features/pedidos/PedidosPage';
import { Layout } from '../shared/components/Layout';
import { NotFoundPage } from '../shared/components/NotFoundPage';
import { AuthProvider } from './providers/AuthProvider';
import { CartProvider } from './providers/CartProvider';

// Ordem: providers envolvem as rotas, para que qualquer tela consiga usar carrinho e autenticação.
export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<CatalogoPage />} />
              <Route path="produtos/:id" element={<ProdutoPage />} />
              <Route path="carrinho" element={<CarrinhoPage />} />
              <Route path="entrar" element={<LoginPage />} />
              <Route path="cadastro" element={<RegisterPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="pedidos" element={<PedidosPage />} />
              <Route path="pedidos/:id" element={<OrderPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
