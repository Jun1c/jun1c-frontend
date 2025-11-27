import React, { useState, useEffect } from 'react';
import { Menu, X, Youtube, Search, ChevronRight, Play, TrendingUp, Gamepad2, Tv, ThumbsUp, MessageCircle, LogIn, LogOut } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export default function Jun1CGamingSite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [articles, setArticles] = useState([]);
  const [featuredArticle, setFeaturedArticle] = useState(null);
  const [videos, setVideos] = useState([]);
  const [comments, setComments] = useState({});
  const [ratings, setRatings] = useState({});
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [commentForm, setCommentForm] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    loadUser();
  }, []);

  const loadUser = () => {
    const savedUser = localStorage.getItem('jun1c_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const articlesRes = await fetch(`${API_URL}/articles`);
      const videosRes = await fetch(`${API_URL}/videos`);
      
      const articlesData = await articlesRes.json();
      const videosData = await videosRes.json();
      
      if (articlesData && articlesData.length > 0) {
        const featured = articlesData.find(a => a.featured);
        const regular = articlesData.filter(a => !a.featured);
        
        setFeaturedArticle(featured || articlesData[0]);
        setArticles(regular.slice(0, 4));
      }
      
      setVideos(videosData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = authMode === 'register' ? '/auth/register' : '/auth/login';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authForm)
      });
      
      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('jun1c_token', data.token);
        localStorage.setItem('jun1c_user', JSON.stringify(data.user));
        setUser(data.user);
        setShowAuthModal(false);
        setAuthForm({ email: '', password: '', name: '' });
      } else {
        alert('Erro: ' + (data.error || 'Não foi possível autenticar'));
      }
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('jun1c_token');
    localStorage.removeItem('jun1c_user');
  };

  const handleLike = async (articleId) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setRatings(prev => ({
      ...prev,
      [articleId]: !prev[articleId]
    }));
  };

  const handleComment = (articleId) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const commentText = commentForm[articleId];
    if (!commentText) return;

    const newComment = {
      id: Date.now(),
      user: user.name,
      avatar: user.avatar,
      text: commentText,
      date: new Date().toLocaleDateString()
    };

    setComments(prev => ({
      ...prev,
      [articleId]: [...(prev[articleId] || []), newComment]
    }));

    setCommentForm(prev => ({ ...prev, [articleId]: '' }));
  };

  const AuthModal = () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full">
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
              value={authForm.name}
              onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={authForm.email}
            onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
          />
          <input
            type="password"
            placeholder="Senha"
            value={authForm.password}
            onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
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

  const ArticleCard = ({ article, featured = false }) => (
    <div className={`bg-gray-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-red-500 transition ${featured ? 'col-span-full' : ''}`}>
      <div className="relative">
        <img 
          src={article.image} 
          alt={article.title}
          className={`w-full object-cover ${featured ? 'h-96' : 'h-48'}`}
        />
        <span className="absolute top-3 left-3 bg-red-600 text-xs font-bold px-3 py-1 rounded-full text-white">
          {article.category}
        </span>
      </div>
      <div className="p-6">
        <h3 className={`font-bold mb-3 text-white hover:text-red-400 transition cursor-pointer ${featured ? 'text-2xl' : 'text-lg'}`}>
          {article.title}
        </h3>
        {featured && <p className="text-gray-400 mb-4">{article.excerpt}</p>}
        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <span>{article.createdAt ? new Date(article.createdAt).toLocaleDateString() : article.date}</span>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => handleLike(article.id)}
              className={`flex items-center space-x-1 hover:text-red-400 transition ${ratings[article.id] ? 'text-red-400' : ''}`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{article.likes + (ratings[article.id] ? 1 : 0)}</span>
            </button>
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span>{(comments[article.id]?.length || 0)}</span>
            </div>
          </div>
        </div>

        {user && (
          <div className="border-t border-gray-700 pt-4">
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                placeholder="Adicione um comentário..."
                value={commentForm[article.id] || ''}
                onChange={(e) => setCommentForm({...commentForm, [article.id]: e.target.value})}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              />
              <button
                onClick={() => handleComment(article.id)}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition text-white"
              >
                Enviar
              </button>
            </div>
            {comments[article.id]?.map(comment => (
              <div key={comment.id} className="flex space-x-3 mb-3">
                <img src={comment.avatar} alt={comment.user} className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="font-semibold text-sm text-white mb-1">{comment.user}</p>
                    <p className="text-sm text-gray-300">{comment.text}</p>
                  </div>
                  <span className="text-xs text-gray-500 ml-3">{comment.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {showAuthModal && <AuthModal />}

      <header className="bg-gradient-to-r from-red-900 via-gray-800 to-purple-900 border-b border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-red-600 to-purple-600 p-2 rounded-lg">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 via-amber-200 to-purple-500 bg-clip-text text-transparent">
                JUN1C
              </h1>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="hover:text-red-400 transition">Início</a>
              <a href="#" className="hover:text-red-400 transition">Notícias</a>
              <a href="#" className="hover:text-red-400 transition">Reviews</a>
              <a href="#" className="hover:text-red-400 transition">Vídeos</a>
              <a href="#" className="hover:text-red-400 transition">Guias</a>
            </nav>

            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 hover:bg-gray-700 rounded-lg transition"
              >
                <Search className="w-5 h-5" />
              </button>
              
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                    <span className="hidden md:block text-sm">{user.name}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 hover:bg-gray-700 rounded-lg transition"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
                >
                  <LogIn className="w-5 h-5" />
                  <span className="hidden md:block">Entrar</span>
                </button>
              )}

              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 hover:bg-gray-700 rounded-lg transition"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {searchOpen && (
            <div className="py-4">
              <input
                type="text"
                placeholder="Buscar notícias, reviews, jogos..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              />
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {featuredArticle && (
          <div className="mb-12">
            <ArticleCard article={featuredArticle} featured={true} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-gradient-to-br from-red-900/50 to-red-800/30 border border-red-700/50 rounded-xl p-6 hover:scale-105 transition cursor-pointer">
            <TrendingUp className="w-8 h-8 text-red-400 mb-3" />
            <h3 className="text-xl font-bold mb-2">Em Alta</h3>
            <p className="text-gray-400 text-sm">As notícias mais quentes do momento</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-700/50 rounded-xl p-6 hover:scale-105 transition cursor-pointer">
            <Tv className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-xl font-bold mb-2">Últimos Vídeos</h3>
            <p className="text-gray-400 text-sm">Conteúdo direto do nosso canal</p>
          </div>
          <div className="bg-gradient-to-br from-amber-900/50 to-amber-800/30 border border-amber-700/50 rounded-xl p-6 hover:scale-105 transition cursor-pointer">
            <Gamepad2 className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="text-xl font-bold mb-2">Reviews</h3>
            <p className="text-gray-400 text-sm">Análises completas e imparciais</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Últimas Notícias</h2>
              <a href="#" className="text-red-400 hover:text-red-300 text-sm flex items-center">
                Ver todas <ChevronRight className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Últimos Vídeos</h3>
                <Youtube className="w-5 h-5 text-red-500" />
              </div>
              <div className="space-y-4">
                {videos.length > 0 ? videos.slice(0, 3).map(video => (
                  <div key={video.id} className="flex items-start space-x-3 group cursor-pointer">
                    <div className="relative flex-shrink-0">
                      <div className="w-24 h-16 bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-red-600 transition">
                        <Play className="w-6 h-6" />
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/80 text-xs px-1 rounded">
                        {video.duration}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold mb-1 group-hover:text-red-400 transition line-clamp-2">
                        {video.title}
                      </h4>
                      <span className="text-xs text-gray-400">{video.views} views</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-400 text-sm">Nenhum vídeo disponível</p>
                )}
              </div>
              <button className="w-full mt-4 bg-red-600 hover:bg-red-700 py-2 rounded-lg font-semibold transition flex items-center justify-center space-x-2">
                <Youtube className="w-4 h-4" />
                <span>Ver Canal Completo</span>
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-900/50 to-red-900/50 border border-purple-700/50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">Newsletter</h3>
              <p className="text-sm text-gray-300 mb-4">
                Receba as últimas notícias e reviews direto no seu email
              </p>
              <input
                type="email"
                placeholder="seu@email.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mb-3 text-white focus:outline-none focus:border-purple-500"
              />
              <button className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-semibold transition">
                Inscrever-se
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 border-t border-gray-700 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4 text-red-400">JUN1C</h4>
              <p className="text-sm text-gray-400">
                Seu portal de notícias, reviews e conteúdo sobre o mundo dos games
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Navegação</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-red-400 transition">Início</a></li>
                <li><a href="#" className="hover:text-red-400 transition">Notícias</a></li>
                <li><a href="#" className="hover:text-red-400 transition">Reviews</a></li>
                <li><a href="#" className="hover:text-red-400 transition">Vídeos</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Conteúdo</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-red-400 transition">Guias</a></li>
                <li><a href="#" className="hover:text-red-400 transition">Análises</a></li>
                <li><a href="#" className="hover:text-red-400 transition">Listas</a></li>
                <li><a href="#" className="hover:text-red-400 transition">Opinião</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Redes Sociais</h4>
              <div className="flex space-x-3">
                <a href="#" className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
            <p>&copy; 2024 JUN1C Gaming. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}