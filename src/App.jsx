import { useMemo, useState } from 'react';

const API_BASE_URL = 'http://localhost:8000';

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

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [statusMessage, setStatusMessage] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);

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

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...(authMode === 'register' ? { name: formData.name } : {}),
      email: formData.email,
      password: formData.password,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/${authMode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Authentication failed');
      }

      setLoggedInUser(result.user);
      setStatusMessage(result.message);
      setFormData({ name: '', email: '', password: '' });
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  return (
    <div className="page-shell">
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

        <button className="primary-btn">Join Newsletter</button>
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

        <section className="auth-panel">
          <div className="auth-card">
            <div className="auth-header">
              <span className="eyebrow">Account access</span>
              <h2>{authMode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
            </div>

            <div className="auth-toggle">
              <button
                type="button"
                className={authMode === 'login' ? 'toggle-btn active' : 'toggle-btn'}
                onClick={() => setAuthMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={authMode === 'register' ? 'toggle-btn active' : 'toggle-btn'}
                onClick={() => setAuthMode('register')}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="auth-form">
              {authMode === 'register' && (
                <label>
                  Full name
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </label>
              )}

              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                />
              </label>

              <button type="submit" className="primary-btn auth-submit">
                {authMode === 'login' ? 'Login' : 'Register'}
              </button>
            </form>

            {statusMessage && <p className="status-message">{statusMessage}</p>}

            {loggedInUser && (
              <div className="user-badge">
                Logged in as <strong>{loggedInUser.name}</strong>
              </div>
            )}
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
    </div>
  );
}
