import React, { useState, useEffect } from 'react';
import { Menu, X, Youtube, Search, ChevronRight, Play, Gamepad2, ThumbsUp, MessageCircle, LogIn, LogOut } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// COMPONENTE DE MODAL - MOVIDO PARA FORA E MEMOIZADO PARA EVITAR RE-CRIAÇÃO
const AuthModal = React.memo(({
  showAuthModal,
  setShowAuthModal,
  authMode,
  setAuthMode,
  authName,
  setAuthName,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  handleAuth
}) => {
  if (!showAuthModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={() => setShowAuthModal(false)}
    >
      <div
        className="bg-gray-800 rounded-xl p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {authMode === 'login' ? 'Entrar' : 'Criar Conta'}
          </h2>
          <button onClick={() => setShowAuthModal(false)} className="text-white hover:text-red-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {authMode === 'register' && (
            <input
              type="text"
              placeholder="Nome completo"
              value={authName}
              onChange={(e) => setAuthName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
              autoComplete="name"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="Senha"
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
            autoComplete="current-password"
          />

          <button
            onClick={handleAuth}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition"
          >
            {authMode === 'login' ? 'Entrar' : 'Criar Conta'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            className="text-sm text-red-400 hover:text-red-300"
          >
            {authMode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
          </button>
        </div>
      </div>
    </div>
  );
});

export default function Jun1CGaming() {
  // Estados principais
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Estados do formulário de autenticação - SEPARADOS (CORREÇÃO PRINCIPAL)
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // Estados de artigos e comentários
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [commentText, setCommentText] = useState('');

  // Carregar usuário do localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Carregar artigos
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch(`${API_URL}/articles`);
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error('Erro ao carregar artigos:', error);
    }
  };

  // Função de autenticação
  const handleAuth = async () => {
    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const body = authMode === 'login'
        ? { email: authEmail, password: authPassword }
        : { name: authName, email: authEmail, password: authPassword };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        setShowAuthModal(false);
        // Limpar campos
        setAuthName('');
        setAuthEmail('');
        setAuthPassword('');
      } else {
        alert(data.message || 'Erro na autenticação');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao conectar com o servidor');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const handleLike = async (articleId) => {
    if (!user) {
      alert('Faça login para curtir');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/articles/${articleId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        fetchArticles();
      }
    } catch (error) {
      console.error('Erro ao curtir:', error);
    }
  };

  const handleComment = async (articleId) => {
    if (!user) {
      alert('Faça login para comentar');
      return;
    }

    if (!commentText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/articles/${articleId}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: commentText }),
      });

      if (response.ok) {
        setCommentText('');
        fetchArticles();
      }
    } catch (error) {
      console.error('Erro ao comentar:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="sticky top-0 bg-black/95 backdrop-blur-sm border-b border-red-900/20 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Gamepad2 className="w-8 h-8 text-red-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
                Jun1C
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button className="text-gray-300 hover:text-red-500 transition">Notícias</button>
              <button className="text-gray-300 hover:text-red-500 transition">Reviews</button>
              <button className="text-gray-300 hover:text-red-500 transition">Vídeos</button>
              <button className="text-gray-300 hover:text-red-500 transition">Guias</button>
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <button className="text-gray-300 hover:text-red-500 transition">
                <Search className="w-5 h-5" />
              </button>
              
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-[#F5F5DC] text-sm hidden md:block">
                    Olá, {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Sair</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden md:inline">Entrar</span>
                </button>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-gray-300"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 space-y-2">
              <button className="block text-gray-300 hover:text-red-500 py-2 w-full text-left">Notícias</button>
              <button className="block text-gray-300 hover:text-red-500 py-2 w-full text-left">Reviews</button>
              <button className="block text-gray-300 hover:text-red-500 py-2 w-full text-left">Vídeos</button>
              <button className="block text-gray-300 hover:text-red-500 py-2 w-full text-left">Guias</button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Featured Article */}
        <div className="mb-8">
          <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-red-900/20 to-purple-900/20 border border-red-900/20 h-96">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <span className="inline-block px-3 py-1 bg-red-600 rounded-full text-xs font-semibold mb-3">
                DESTAQUE
              </span>
              <h1 className="text-4xl font-bold text-white mb-3">
                Novidades Incríveis do Mundo dos Games
              </h1>
              <p className="text-gray-300 mb-4 max-w-2xl">
                Confira as últimas notícias e atualizações sobre os jogos mais esperados do ano.
              </p>
              <button className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg transition">
                <span>Ler mais</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50 hover:border-red-600/50 transition group"
            >
              <div className="h-48 bg-gradient-to-br from-red-900/20 to-purple-900/20 relative">
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-black/60 rounded-full text-xs font-semibold text-red-400">
                    {article.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-500 transition">
                  {article.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLike(article.id)}
                      className="flex items-center space-x-1 text-gray-400 hover:text-red-500 transition"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm">{article.likes || 0}</span>
                    </button>
                    
                    <button
                      onClick={() => setSelectedArticle(article)}
                      className="flex items-center space-x-1 text-gray-400 hover:text-purple-500 transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{article.comments?.length || 0}</span>
                    </button>
                  </div>
                  
                  <button className="text-sm text-red-400 hover:text-red-300 flex items-center space-x-1">
                    <span>Ler mais</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* YouTube Section */}
        <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <Youtube className="w-6 h-6 text-red-600" />
              <span>Últimos Vídeos</span>
            </h2>
            <button className="text-red-400 hover:text-red-300 flex items-center space-x-1">
              <span>Ver todos</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative rounded-lg overflow-hidden mb-3 bg-gradient-to-br from-red-900/20 to-purple-900/20 h-40">
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h3 className="text-white font-semibold group-hover:text-red-500 transition">
                  Análise Completa - Jogo #{i}
                </h3>
                <p className="text-gray-400 text-sm">Jun1C Gaming</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authName={authName}
        setAuthName={setAuthName}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        handleAuth={handleAuth}
      />

      {/* Comments Modal */}
      {selectedArticle && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedArticle(null)}
        >
          <div 
            className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Comentários</h2>
              <button onClick={() => setSelectedArticle(null)} className="text-white hover:text-red-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Comment Form */}
            {user && (
              <div className="mb-6">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Escreva seu comentário..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 min-h-[100px]"
                />
                <button
                  onClick={() => handleComment(selectedArticle.id)}
                  className="mt-2 bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg transition"
                >
                  Comentar
                </button>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {selectedArticle.comments?.map((comment, index) => (
                <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-white">{comment.user}</span>
                    <span className="text-gray-400 text-sm">{comment.date}</span>
                  </div>
                  <p className="text-gray-300">{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
