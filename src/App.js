import React, { useState, useCallback } from 'react';
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Paper,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBoxIcon from '@mui/icons-material/AccountBox';

// Tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  // Estados
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Estados do formulário de login - SEPARADOS
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Estados do formulário de cadastro - SEPARADOS
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  // Estados do carrinho
  const [cart, setCart] = useState([]);

  // Produtos de exemplo
  const products = [
    { id: 1, name: 'Produto 1', price: 29.99 },
    { id: 2, name: 'Produto 2', price: 49.99 },
    { id: 3, name: 'Produto 3', price: 19.99 },
  ];

  // Função de login usando useCallback
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: loginEmail, 
          password: loginPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setMessage({ text: 'Login realizado com sucesso!', type: 'success' });
        setView('products');
        // Limpar campos após sucesso
        setLoginEmail('');
        setLoginPassword('');
      } else {
        setMessage({ text: data.message || 'Erro ao fazer login', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Erro de conexão com o servidor', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [loginEmail, loginPassword]);

  // Função de cadastro usando useCallback
  const handleRegister = useCallback(async (e) => {
    e.preventDefault();
    
    if (registerPassword !== registerConfirmPassword) {
      setMessage({ text: 'As senhas não coincidem', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: 'Cadastro realizado com sucesso!', type: 'success' });
        setView('login');
        // Limpar campos após sucesso
        setRegisterName('');
        setRegisterEmail('');
        setRegisterPassword('');
        setRegisterConfirmPassword('');
      } else {
        setMessage({ text: data.message || 'Erro ao cadastrar', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Erro de conexão com o servidor', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [registerName, registerEmail, registerPassword, registerConfirmPassword]);

  // Funções do carrinho usando useCallback
  const addToCart = useCallback((product) => {
    setCart(prevCart => [...prevCart, product]);
    setMessage({ text: 'Produto adicionado ao carrinho!', type: 'success' });
  }, []);

  const removeFromCart = useCallback((index) => {
    setCart(prevCart => prevCart.filter((_, i) => i !== index));
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setCart([]);
    setView('login');
    setMessage({ text: 'Logout realizado com sucesso!', type: 'success' });
  }, []);

  // Calcular total do carrinho
  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  // COMPONENTE DE LOGIN - SEPARADO E MEMOIZADO
  const LoginForm = React.memo(() => (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <LoginIcon sx={{ mr: 1, fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          Login
        </Typography>
      </Box>

      {message.text && message.type && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <form onSubmit={handleLogin}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          margin="normal"
          required
          autoComplete="email"
        />
        <TextField
          fullWidth
          label="Senha"
          type="password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          margin="normal"
          required
          autoComplete="current-password"
        />
        <Button
          fullWidth
          variant="contained"
          type="submit"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Entrar'}
        </Button>
      </form>

      <Divider sx={{ my: 2 }} />

      <Button
        fullWidth
        variant="outlined"
        onClick={() => setView('register')}
        startIcon={<PersonAddIcon />}
      >
        Criar conta
      </Button>
    </Paper>
  ));

  // COMPONENTE DE CADASTRO - SEPARADO E MEMOIZADO
  const RegisterForm = React.memo(() => (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PersonAddIcon sx={{ mr: 1, fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          Cadastro
        </Typography>
      </Box>

      {message.text && message.type && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <form onSubmit={handleRegister}>
        <TextField
          fullWidth
          label="Nome"
          value={registerName}
          onChange={(e) => setRegisterName(e.target.value)}
          margin="normal"
          required
          autoComplete="name"
        />
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={registerEmail}
          onChange={(e) => setRegisterEmail(e.target.value)}
          margin="normal"
          required
          autoComplete="email"
        />
        <TextField
          fullWidth
          label="Senha"
          type="password"
          value={registerPassword}
          onChange={(e) => setRegisterPassword(e.target.value)}
          margin="normal"
          required
          autoComplete="new-password"
        />
        <TextField
          fullWidth
          label="Confirmar Senha"
          type="password"
          value={registerConfirmPassword}
          onChange={(e) => setRegisterConfirmPassword(e.target.value)}
          margin="normal"
          required
          autoComplete="new-password"
        />
        <Button
          fullWidth
          variant="contained"
          type="submit"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Cadastrar'}
        </Button>
      </form>

      <Divider sx={{ my: 2 }} />

      <Button
        fullWidth
        variant="outlined"
        onClick={() => setView('login')}
      >
        Já tenho conta
      </Button>
    </Paper>
  ));

  // COMPONENTE DE PRODUTOS
  const ProductsView = React.memo(() => (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Produtos
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={() => setView('cart')}
            startIcon={<ShoppingCartIcon />}
            sx={{ mr: 2 }}
          >
            Carrinho ({cart.length})
          </Button>
          <Button
            variant="outlined"
            onClick={() => setView('profile')}
            startIcon={<AccountBoxIcon />}
            sx={{ mr: 2 }}
          >
            Perfil
          </Button>
          <Button
            variant="contained"
            onClick={handleLogout}
          >
            Sair
          </Button>
        </Box>
      </Box>

      {message.text && message.type && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {product.name}
                </Typography>
                <Typography variant="h5" color="primary" gutterBottom>
                  R$ {product.price.toFixed(2)}
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => addToCart(product)}
                >
                  Adicionar ao Carrinho
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  ));

  // COMPONENTE DE CARRINHO
  const CartView = React.memo(() => (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Carrinho
        </Typography>
        <Button
          variant="outlined"
          onClick={() => setView('products')}
        >
          Continuar Comprando
        </Button>
      </Box>

      {cart.length === 0 ? (
        <Alert severity="info">
          Seu carrinho está vazio
        </Alert>
      ) : (
        <>
          {cart.map((item, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">{item.name}</Typography>
                  <Typography color="primary">R$ {item.price.toFixed(2)}</Typography>
                </Box>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => removeFromCart(index)}
                >
                  Remover
                </Button>
              </Box>
            </Paper>
          ))}

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Total: R$ {cartTotal.toFixed(2)}
            </Typography>
            <Button
              fullWidth
              variant="contained"
              size="large"
            >
              Finalizar Compra
            </Button>
          </Paper>
        </>
      )}
    </Container>
  ));

  // COMPONENTE DE PERFIL
  const ProfileView = React.memo(() => (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Meu Perfil
        </Typography>
        <Button
          variant="outlined"
          onClick={() => setView('products')}
        >
          Voltar
        </Button>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Nome: {user?.name}
        </Typography>
        <Typography variant="h6" gutterBottom>
          Email: {user?.email}
        </Typography>
        <Divider sx={{ my: 3 }} />
        <Button
          variant="contained"
          color="error"
          onClick={handleLogout}
        >
          Sair da Conta
        </Button>
      </Paper>
    </Container>
  ));

  // Renderizar view apropriada
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
        {view === 'login' && <LoginForm />}
        {view === 'register' && <RegisterForm />}
        {view === 'products' && <ProductsView />}
        {view === 'cart' && <CartView />}
        {view === 'profile' && <ProfileView />}
      </Box>
    </ThemeProvider>
  );
}

export default App;
