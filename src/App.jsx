import { useMemo, useState } from 'react';
import { auth } from './api';

const categories = ['Programming', 'Data Engineering', 'Cloud', 'AI', 'Cybersecurity', 'Career'];

const featuredPosts = [
  {
    title: 'Modern Python for Data Pipelines',
    category: 'Data Engineering',
    readTime: '6 min read',
    description: 'Learn how Python is used to automate ingestion, transformation, and workflow orchestration for modern data platforms.',
  },
  {
    title: 'Building APIs with FastAPI',
    category: 'Programming',
    readTime: '8 min read',
    description: 'A complete guide to designing high-performance APIs using FastAPI, validation, and modern Python patterns.',
  },
  {
    title: 'SQL Performance for Large Datasets',
    category: 'Data Engineering',
    readTime: '5 min read',
    description: 'Improve query efficiency with indexing, partitioning, and schema design strategies that scale in production.',
  },
];

const posts = [
  {
    id: 1,
    title: 'How to Build a Reliable ETL Workflow',
    category: 'Data Engineering',
    author: 'Aisha Cole',
    date: 'August 7, 2026',
    summary: 'From extraction to transformation and loading, discover how to build resilient data processing pipelines.',
  },
  {
    id: 2,
    title: 'JavaScript Patterns That Scale in Real Projects',
    category: 'Programming',
    author: 'Daniel Moore',
    date: 'August 4, 2026',
    summary: 'A practical look at modular code, state management, and reusable patterns for growing front-end apps.',
  },
  {
    id: 3,
    title: 'PostgreSQL for Analytics Workloads',
    category: 'Database',
    author: 'Sophia Green',
    date: 'August 1, 2026',
    summary: 'Understand relational performance, indexing, and query strategies when working with analytics-heavy datasets.',
  },
  {
    id: 4,
    title: 'Cloud Architecture Basics for Developers',
    category: 'Cloud',
    author: 'Lucas Nguyen',
    date: 'July 30, 2026',
    summary: 'A beginner-friendly overview of cloud services, deployment patterns, and infrastructure thinking.',
  },
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [authMode, setAuthMode] = useState('signin');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const filteredPosts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return posts;
    }

    return posts.filter((post) =>
      [post.title, post.category, post.summary, post.author].some((value) =>
        value.toLowerCase().includes(term),
      ),
    );
  }, [searchTerm]);

  const validateField = (name, value, mode) => {
    if (name === 'fullName') {
      if (mode === 'register' && !value.trim()) {
        return 'Full name is required.';
      }
      return '';
    }

    if (name === 'email') {
      if (!value.trim()) {
        return 'Email is required.';
      }
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address.';
      }
      return '';
    }

    if (name === 'password') {
      if (!value) {
        return 'Password is required.';
      }
      if (!passwordRegex.test(value)) {
        return 'Password must be at least 6 characters and include one lowercase, one uppercase, and one number.';
      }
      if (mode === 'register' && formData.confirmPassword && value !== formData.confirmPassword) {
        return 'Passwords do not match.';
      }
      return '';
    }

    if (name === 'confirmPassword') {
      if (!value) {
        return 'Please confirm your password.';
      }
      if (value !== formData.password) {
        return 'Passwords do not match.';
      }
      return '';
    }

    return '';
  };

  const validateForm = (values, mode) => {
    const nextErrors = {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    nextErrors.fullName = validateField('fullName', values.fullName, mode);
    nextErrors.email = validateField('email', values.email, mode);
    nextErrors.password = validateField('password', values.password, mode);

    if (mode === 'register') {
      nextErrors.confirmPassword = validateField('confirmPassword', values.confirmPassword, mode);
    }

    return nextErrors;
  };

  const handleAuthModeChange = (mode) => {
    setAuthMode(mode);
    setErrors({ fullName: '', email: '', password: '', confirmPassword: '' });
    setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
    setAuthError('');
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    const nextError = validateField(name, value, authMode);
    setErrors((current) => ({
      ...current,
      [name]: nextError,
      ...(name === 'password' && authMode === 'register' && formData.confirmPassword
        ? { confirmPassword: value === formData.confirmPassword ? '' : 'Passwords do not match.' }
        : {}),
      ...(name === 'confirmPassword' && authMode === 'register'
        ? { confirmPassword: value === formData.password ? '' : 'Passwords do not match.' }
        : {}),
    }));
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError('');

    const nextErrors = validateForm(formData, authMode);
    setErrors(nextErrors);

    const hasErrors = Object.values(nextErrors).some(Boolean);
    if (hasErrors) {
      return;
    }

    setAuthLoading(true);

    try {
      let response;
      
      if (authMode === 'signin') {
        response = await auth.signin(formData.email, formData.password);
      } else {
        response = await auth.register(formData.fullName, formData.email, formData.password);
      }

      // Store token and user info
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      }

      // Set user as authenticated
      const user = {
        email: response.user?.email || formData.email,
        fullName: response.user?.fullName || formData.fullName || formData.email.split('@')[0],
      };
      setCurrentUser(user);
      setIsAuthenticated(true);
      setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
    } catch (error) {
      setAuthError(error.message || 'Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    auth.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthMode('signin');
    setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
    setErrors({ fullName: '', email: '', password: '', confirmPassword: '' });
    setAuthError('');
  };

  return (
    <div className="page-shell">
      {!isAuthenticated && (
        <div className="auth-overlay">
          <div className="auth-modal">
            <div className="auth-tabs">
              <button
                type="button"
                className={authMode === 'signin' ? 'tab active' : 'tab'}
                onClick={() => handleAuthModeChange('signin')}
              >
                Sign In
              </button>
              <button
                type="button"
                className={authMode === 'register' ? 'tab active' : 'tab'}
                onClick={() => handleAuthModeChange('register')}
              >
                Register
              </button>
            </div>

            <h2>{authMode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>

            {authError && <div className="auth-error">{authError}</div>}

            <form className="auth-form" onSubmit={handleAuthSubmit} noValidate>
              {authMode === 'register' && (
                <div className="field-group">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleFieldChange}
                    placeholder="Full name"
                    aria-label="Full name"
                    className={errors.fullName ? 'input-error' : ''}
                  />
                  {errors.fullName && <span className="field-error">{errors.fullName}</span>}
                </div>
              )}

              <div className="field-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFieldChange}
                  onBlur={(event) => {
                    const nextError = validateField(event.target.name, event.target.value, authMode);
                    setErrors((current) => ({
                      ...current,
                      email: nextError,
                    }));
                  }}
                  placeholder="Email address"
                  aria-label="Email address"
                  className={errors.email ? 'input-error' : ''}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="field-group">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFieldChange}
                  onBlur={(event) => {
                    const nextError = validateField(event.target.name, event.target.value, authMode);
                    setErrors((current) => ({
                      ...current,
                      password: nextError,
                    }));
                  }}
                  placeholder={authMode === 'signin' ? 'Password' : 'Create password'}
                  aria-label={authMode === 'signin' ? 'Password' : 'Create password'}
                  className={errors.password ? 'input-error' : ''}
                  aria-invalid={Boolean(errors.password)}
                />
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              {authMode === 'register' && (
                <div className="field-group">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleFieldChange}
                    onBlur={(event) => {
                      const nextError = validateField(event.target.name, event.target.value, authMode);
                      setErrors((current) => ({
                        ...current,
                        confirmPassword: nextError,
                      }));
                    }}
                    placeholder="Confirm password"
                    aria-label="Confirm password"
                    className={errors.confirmPassword ? 'input-error' : ''}
                    aria-invalid={Boolean(errors.confirmPassword)}
                  />
                  {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                </div>
              )}

              {authMode === 'signin' && (
                <label className="remember-row">
                  <input type="checkbox" />
                  <span>Keep me signed in</span>
                </label>
              )}

              <button type="submit" className="primary-btn auth-submit" disabled={authLoading}>
                {authLoading ? 'Loading...' : (authMode === 'signin' ? 'Login' : 'Register')}
              </button>
            </form>
          </div>
        </div>
      )}

      {isAuthenticated && (
        <>
          <header className="topbar">
            <div className="brand-block">
              <div className="brand-mark">R</div>
              <div>
                <p className="brand-name">Rough Coder</p>
                <span className="brand-sub">Studio</span>
              </div>
            </div>

            <nav className="nav">
              <a href="#home">Home</a>
              <a href="#blog">Blog</a>
              <a href="#topics">Topics</a>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
            </nav>

            <div className="header-actions">
              <button type="button" className="primary-btn">Join Newsletter</button>
              <div className="user-info">
                <span>{currentUser?.fullName || currentUser?.email}</span>
                <button
                  type="button"
                  className="secondary-btn login-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main>
            <section className="hero" id="home">
              <div className="hero-copy">
                <span className="eyebrow">Learn. Build. Scale.</span>
                <h1>Data, code, and digital skills for the next generation.</h1>
                <p>
                  Explore practical lessons on programming, data engineering, cloud systems, and modern IT careers.
                </p>
                <div className="hero-actions">
                  <button className="primary-btn">Read Articles</button>
                  <button className="secondary-btn">Explore Topics</button>
                </div>
                <div className="stats">
                  <div>
                    <strong>250+</strong>
                    <span>Tech lessons</span>
                  </div>
                  <div>
                    <strong>18k</strong>
                    <span>Monthly readers</span>
                  </div>
                  <div>
                    <strong>12</strong>
                    <span>Learning tracks</span>
                  </div>
                </div>
              </div>

              <div className="hero-card">
                <div className="mini-card blue">
                  <span>Trending topic</span>
                  <h3>Python Data Pipelines</h3>
                </div>
                <div className="mini-card dark">
                  <span>Popular category</span>
                  <h3>Data Engineering</h3>
                </div>
              </div>
            </section>

            <section className="featured" id="topics">
              <div className="section-heading">
                <span className="eyebrow">Featured topics</span>
                <h2>Start learning the skills that matter</h2>
              </div>

              <div className="category-grid">
                {categories.map((category) => (
                  <div key={category} className="category-item">
                    <span>{category}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="featured-posts">
              <div className="section-heading inline">
                <div>
                  <span className="eyebrow">Featured content</span>
                  <h2>Latest tutorials and insights</h2>
                </div>
                <a href="#blog">View all posts</a>
              </div>

              <div className="card-grid">
                {featuredPosts.map((post) => (
                  <article key={post.title} className="post-card highlight">
                    <div className="tag">{post.category}</div>
                    <h3>{post.title}</h3>
                    <p>{post.description}</p>
                    <div className="meta-row">
                      <span>{post.readTime}</span>
                      <button>Read more</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="blog-section" id="blog">
              <div className="section-heading inline">
                <div>
                  <span className="eyebrow">Blog</span>
                  <h2>Latest articles</h2>
                </div>
                <div className="search-box">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search articles..."
                    aria-label="Search articles"
                  />
                </div>
              </div>

              <div className="articles-list">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <article key={post.id} className="article-row">
                      <div className="article-badge">{post.category}</div>
                      <div className="article-copy">
                        <h3>{post.title}</h3>
                        <p>{post.summary}</p>
                        <div className="article-meta">
                          <span>{post.author}</span>
                          <span>{post.date}</span>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty-state">No articles match your search.</div>
                )}
              </div>
            </section>

            <section className="about" id="about">
              <div className="about-card">
                <span className="eyebrow">Why Rough Coder?</span>
                <h2>Practical learning for real-world technology careers.</h2>
                <p>
                  We turn complex technical topics into simple, actionable lessons for beginners and professionals alike.
                </p>
              </div>
            </section>
          </main>

          <footer className="footer" id="contact">
            <div>
              <p className="brand-name">Rough Coder</p>
            </div>
            <div className="footer-links">
              <a href="#blog">Blog</a>
              <a href="#topics">Topics</a>
              <a href="#about">About</a>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
