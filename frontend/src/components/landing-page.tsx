// landing-page.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import logo from '../assests/logonandhanotes.png';
import { 
  BookOpen, 
  Users, 
  Upload, 
  Search,
  FileText,
  Award,
  ChevronDown,
  ChevronUp,
  Shield,
  Bell,
  Star,
  Download,
  GraduationCap,
  Mail,
  ArrowRight,
  ArrowDown,
  File,
  Bookmark,
  Eye
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface LandingPageProps {
  onNavigateToApp: () => void;
  onNavigateToSignup: () => void;
  onNavigateToLogin: () => void;
  currentUser: any;
}

export function LandingPage({ 
  onNavigateToApp, 
  onNavigateToSignup, 
  onNavigateToLogin,
  currentUser 
}: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState('home');

  const features = [
    {
      icon: <Upload className="w-6 h-6" />,
      title: "Notes Upload & Download",
      description: "Easily upload PDFs, PPTs, and images. Download study materials anytime."
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "College Email Signup",
      description: "Secure access with @nandhaengg.org email verification only."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Channel Sharing System",
      description: "Join subject-specific channels and collaborate with classmates."
    },
    {
      icon: <Bookmark className="w-6 h-6" />,
      title: "Bookmarks & Search",
      description: "Save favorite notes and use smart filters to find exactly what you need."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Download Proxy",
      description: "All downloads are secure and tracked. Your data is protected."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Credit Rewards",
      description: "Earn credits for uploading quality notes. Unlock premium features."
    }
  ];

  const faqs = [
    {
      question: "Who can use this platform?",
      answer: "Only students with @nandhaengg.org email addresses can register and access the platform."
    },
    {
      question: "How do I earn credits?",
      answer: "Upload notes to earn credits: PDF (3 credits), DOC/DOCX (3 credits), PPT (2 credits), Images (1 credit)."
    },
    {
      question: "Are the notes free to download?",
      answer: "Yes, all notes in the global library are free to download for registered students."
    },
    {
      question: "What are private channels?",
      answer: "Channels are private groups where you can share notes with specific people - perfect for study groups."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Smooth scroll function
  const smoothScroll = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Update active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'features', 'how-it-works', 'supported-files', 'faq'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
  <div className="header-container">
    <div className="logo">
      <img src={logo} alt="Nandha Notes" className="logo-image" />
      <span className="logo-text cursor-pointer">
        Nandha <span className="logo-highlight">Notes</span>
      </span>
    </div>
    
    <nav className="nav-links">
      <a 
        href="#home" 
        className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
        onClick={(e) => { e.preventDefault(); smoothScroll('home'); }}
      >
        Home
      </a>
      <a 
        href="#features" 
        className={`nav-link ${activeSection === 'features' ? 'active' : ''}`}
        onClick={(e) => { e.preventDefault(); smoothScroll('features'); }}
      >
        Features
      </a>
      <a 
        href="#how-it-works" 
        className={`nav-link ${activeSection === 'how-it-works' ? 'active' : ''}`}
        onClick={(e) => { e.preventDefault(); smoothScroll('how-it-works'); }}
      >
        How It Works
      </a>
      <a 
        href="#supported-files" 
        className={`nav-link ${activeSection === 'supported-files' ? 'active' : ''}`}
        onClick={(e) => { e.preventDefault(); smoothScroll('supported-files'); }}
      >
        Files
      </a>
      <a 
        href="#faq" 
        className={`nav-link ${activeSection === 'faq' ? 'active' : ''}`}
        onClick={(e) => { e.preventDefault(); smoothScroll('faq'); }}
      >
        FAQ
      </a>
    </nav>

    <div className="header-buttons">
      <Button 
        className="signup-btn cursor-pointer"
        onClick={onNavigateToSignup}
      >
        Get Started
      </Button>
    </div>
  </div>
</header>

      {/* Hero Section */}
      <section className="section home-section" id="home">
        <div className="section-content">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Share and Discover <span className="hero-highlight">Study Notes</span>
              </h1>
              <p className="hero-description">
                A collaborative platform for Nandha students to share notes, create study groups, 
                and learn together in a secure environment.
              </p>
              <div className="hero-buttons">
                <Button 
                  size="lg"
                  className="cta-primary"
                  onClick={onNavigateToSignup}
                >
                  Get Started Free
                  <ArrowRight className="btn-icon" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="cta-secondary"
                  onClick={onNavigateToLogin}
                >
                  Sign In
                </Button>
              </div>
            </div>
            <div className="hero-visual">
              <div 
                className="hero-image"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
                }}
              />
            </div>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Students</span>
            </div>
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Notes Shared</span>
            </div>
            <div className="stat">
              <span className="stat-number">50+</span>
              <span className="stat-label">Study Groups</span>
            </div>
          </div>
        </div>
        
      </section>

      {/* Features Section */}
      <section className="section features-section" id="features">
        <div className="section-content">
          <div className="section-header">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-description">
              Everything you need for effective studying and collaboration
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <Card key={index} className="feature-card">
                <CardHeader>
                  <div className="feature-icon">
                    {feature.icon}
                  </div>
                  <CardTitle className="feature-title">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="feature-description">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section how-it-works-section" id="how-it-works">
        <div className="section-content">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-description">Simple steps to start sharing and learning</p>
          </div>

          <div className="steps-container">
            <div className="step">
              <div className="step-visual">
                <div className="step-number">1</div>
                <GraduationCap className="step-icon" />
              </div>
              <h3 className="step-title">Sign Up</h3>
              <p className="step-description">
                Register with your @nandhaengg.org email to verify your student status
              </p>
            </div>

            <div className="step">
              <div className="step-visual">
                <div className="step-number">2</div>
                <Upload className="step-icon" />
              </div>
              <h3 className="step-title">Upload & Earn</h3>
              <p className="step-description">
                Share your notes and earn credits for each upload
              </p>
            </div>

            <div className="step">
              <div className="step-visual">
                <div className="step-number">3</div>
                <Users className="step-icon" />
              </div>
              <h3 className="step-title">Collaborate</h3>
              <p className="step-description">
                Join channels, create study groups, and learn together
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Files */}
      <section className="section files-section" id="supported-files">
        <div className="section-content">
          <div className="section-header">
            <h2 className="section-title">Supported Files</h2>
            <p className="section-description">Upload and earn credits for sharing knowledge</p>
          </div>

          <div className="files-container">
            <div className="files-background">
              <img 
                src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Digital files and documents"
              />
            </div>
            <div className="files-grid">
              <div className="file-type">
                <FileText className="file-icon pdf" />
                <div className="file-info">
                  <span className="file-name">PDF Documents</span>
                  <span className="file-credits">3 credits</span>
                </div>
              </div>
              <div className="file-type">
                <File className="file-icon doc" />
                <div className="file-info">
                  <span className="file-name">Word Documents</span>
                  <span className="file-credits">3 credits</span>
                </div>
              </div>
              <div className="file-type">
                <Award className="file-icon ppt" />
                <div className="file-info">
                  <span className="file-name">PowerPoint Files</span>
                  <span className="file-credits">2 credits</span>
                </div>
              </div>
              <div className="file-type">
                <Upload className="file-icon image" />
                <div className="file-info">
                  <span className="file-name">Images</span>
                  <span className="file-credits">1 credit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section faq-section" id="faq">
        <div className="section-content">
          <div className="section-header">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-description">Get answers to common questions</p>
          </div>

          <div className="faq-container">
            <div className="faq-background">
              <img 
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Student asking questions"
              />
            </div>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <Card key={index} className="faq-card">
                  <CardContent className="faq-content">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="faq-question"
                    >
                      <span>{faq.question}</span>
                      {openFaq === index ? (
                        <ChevronUp className="faq-icon" />
                      ) : (
                        <ChevronDown className="faq-icon" />
                      )}
                    </button>
                    {openFaq === index && (
                      <div className="faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Animated Background */}
      <section className="section cta-section">
        <div className="section-content">
          <div className="cta-content">
            {/* Animated Background Elements */}
            <div className="animated-background">
              <div className="floating-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
                <div className="shape shape-4"></div>
                <div className="shape shape-5"></div>
                <div className="shape shape-6"></div>
              </div>
              <div className="gradient-orbs">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
              </div>
              <div className="particles">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="particle"></div>
                ))}
              </div>
            </div>
            
            <h2 className="cta-title">Ready to Start Learning Together?</h2>
            <p className="cta-description">
              Join thousands of Nandha students already sharing and learning on our platform
            </p>
            <div className="cta-buttons">
              <Button 
                size="lg" 
                className="cta-primary cursor-pointer"
                onClick={onNavigateToSignup}
              >
                Create Your Account
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="cta-secondary cursor-pointer"
                onClick={onNavigateToLogin}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
  <div className="footer-content">
    <div className="footer-logo">
      <img src={logo} alt="Nandha Notes" className="footer-logo-image" />
      <span className="footer-logo-text">
        Nandha <span className="footer-logo-highlight">Notes</span>
      </span>
    </div>
    <div className="footer-copyright">
      <p>© 2025 Nandha Notes. All rights reserved.</p>
      <p className="footer-made-with">Made with ❤ for students by students</p>
    </div>
  </div>
</footer>

      <style jsx>{`
      .footer-logo-image {
  height: 35px; /* Slightly smaller than header logo */
  width: auto;
  object-fit: contain;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}
        .landing-page {
          min-height: 100vh;
          background: var(--background);
          color: var(--foreground);
          scroll-behavior: smooth;
        }

        /* Section Base Styles */
        .section {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 4rem 0;
        }

        .section-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          width: 100%;
          position: relative;
          z-index: 2;
        }

        /* Header Styles */
        .landing-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(30, 41, 59, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 1000;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
          font-weight: 600;
          font-size: 1.25rem;
        }

        .logo-icon {
          width: 1.5rem;
          height: 1.5rem;
        }

        .logo-highlight {
          color: var(--primary);
        }

        .nav-links {
          display: flex;
          gap: 2rem;
        }

        .nav-link {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
        }

        .nav-link:hover,
        .nav-link.active {
          color: white;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--primary);
          transition: width 0.3s ease;
        }

        .nav-link:hover::after,
        .nav-link.active::after {
          width: 100%;
        }

        .header-buttons {
          display: flex;
          gap: 1rem;
        }

        .signup-btn {
          background: var(--primary);
          color: white;
          transition: all 0.3s ease;
        }

        .signup-btn:hover {
          background: var(--primary);
          opacity: 0.9;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(13, 148, 136, 0.3);
        }

        /* Home Section */
        .home-section {
          background: linear-gradient(135deg, #475569 0%, #334155 50%, #1e293b 100%);
          color: white;
          padding-top: 80px;
          padding-bottom: 4rem;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          margin-bottom: 2rem;
          flex: 1;
          justify-content: center;
        }

        .hero-text {
          opacity: 0;
          animation: slideInLeft 1s ease 0.3s forwards;
          display: flex;
          flex-direction: column;
          justify-content: center;
          height: 100%;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }

        .hero-highlight {
          color: var(--primary);
          background: linear-gradient(135deg, var(--primary), #22d3ee);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1.25rem;
          margin-bottom: 2rem;
          opacity: 0.9;
          line-height: 1.6;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .cta-primary {
          background: var(--primary);
          color: white;
          font-weight: 600;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .cta-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }

        .cta-primary:hover::before {
          left: 100%;
        }

        .cta-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(13, 148, 136, 0.4);
        }

        .cta-secondary {
          border-color: rgba(255, 255, 255, 0.3);
          color: white;
          background: transparent;
          padding: 1rem 2rem;
          transition: all 0.3s ease;
        }

        .cta-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: white;
          transform: translateY(-2px);
        }

        .btn-icon {
          width: 1.25rem;
          height: 1.25rem;
          transition: transform 0.3s ease;
        }

        .cta-primary:hover .btn-icon {
          transform: translateX(4px);
        }

        .hero-visual {
          position: relative;
          height: 400px;
          border-radius: 20px;
          overflow: hidden;
          opacity: 0;
          animation: slideInRight 1s ease 0.5s forwards;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-image {
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          transition: transform 0.8s ease;
        }

        .hero-visual:hover .hero-image {
          transform: scale(1.05);
        }

        .hero-stats {
          display: flex;
          gap: 3rem;
          justify-content: center;
          opacity: 0;
          animation: fadeInUp 1s ease 0.7s forwards;
          margin-top: auto;
          padding-top: 2rem;
        }

        .stat {
          text-align: center;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .stat:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .stat-number {
          display: block;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #fff, var(--primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          font-size: 0.875rem;
          opacity: 0.8;
        }

        .scroll-indicator {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: white;
          opacity: 0.8;
          animation: bounce 2s infinite;
        }

        .scroll-arrow {
          width: 1.5rem;
          height: 1.5rem;
        }

        /* Section Header */
        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-title {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--foreground);
          opacity: 0;
          animation: fadeInUp 0.8s ease forwards;
        }

        .section-description {
          font-size: 1.25rem;
          color: var(--muted-foreground);
          max-width: 600px;
          margin: 0 auto;
          opacity: 0;
          animation: fadeInUp 0.8s ease 0.2s forwards;
        }

        /* Features Section */
        .features-section {
          background: var(--background);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          opacity: 0;
          animation: fadeInUp 0.8s ease 0.4s forwards;
        }

        .feature-card {
          background: var(--card);
          border: 1px solid var(--border);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          opacity: 0;
          animation: fadeInUp 0.8s ease forwards;
          position: relative;
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(13, 148, 136, 0.05), transparent);
          transition: left 0.6s;
        }

        .feature-card:hover::before {
          left: 100%;
        }

        .feature-card:nth-child(1) { animation-delay: 0.4s; }
        .feature-card:nth-child(2) { animation-delay: 0.6s; }
        .feature-card:nth-child(3) { animation-delay: 0.8s; }
        .feature-card:nth-child(4) { animation-delay: 1s; }
        .feature-card:nth-child(5) { animation-delay: 1.2s; }
        .feature-card:nth-child(6) { animation-delay: 1.4s; }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border-color: var(--primary);
        }

        .feature-icon {
          background: var(--primary);
          color: white;
          width: 3rem;
          height: 3rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          transition: transform 0.3s ease;
        }

        .feature-card:hover .feature-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .feature-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .feature-description {
          color: var(--muted-foreground);
          line-height: 1.6;
        }

        /* How It Works */
        .how-it-works-section {
          background: var(--muted);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .steps-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
          opacity: 0;
          animation: fadeInUp 0.8s ease 0.4s forwards;
        }

        .step {
          text-align: center;
          padding: 2rem;
          background: var(--card);
          border-radius: 20px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .step::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--primary), #22d3ee);
          transform: scaleX(0);
          transition: transform 0.4s ease;
        }

        .step:hover::before {
          transform: scaleX(1);
        }

        .step:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .step-visual {
          margin-bottom: 1.5rem;
          position: relative;
        }

        .step-number {
          width: 3rem;
          height: 3rem;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 auto 1rem;
          position: relative;
          z-index: 2;
          transition: transform 0.3s ease;
        }

        .step:hover .step-number {
          transform: scale(1.1);
        }

        .step-icon {
          width: 4rem;
          height: 4rem;
          color: var(--primary);
          margin: 0 auto;
          opacity: 0.1;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
        }

        .step-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          position: relative;
          z-index: 2;
        }

        .step-description {
          color: var(--muted-foreground);
          line-height: 1.6;
          position: relative;
          z-index: 2;
        }

        /* Files Section */
        .files-section {
          background: var(--background);
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .files-container {
          position: relative;
          max-width: 900px;
          margin: 0 auto;
          height: 400px;
        }

        .files-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.05;
          border-radius: 20px;
          overflow: hidden;
        }

        .files-background img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .files-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          position: relative;
          z-index: 2;
          opacity: 0;
          animation: fadeInUp 0.8s ease 0.4s forwards;
          height: 100%;
          align-content: center;
        }

        .file-type {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--card);
          border-radius: 16px;
          border: 1px solid var(--border);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          height: fit-content;
        }

        .file-type::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(13, 148, 136, 0.05), transparent);
          transition: left 0.6s;
        }

        .file-type:hover::before {
          left: 100%;
        }

        .file-type:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
          border-color: var(--primary);
        }

        .file-icon {
          width: 3rem;
          height: 3rem;
          padding: 0.75rem;
          border-radius: 12px;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }

        .file-type:hover .file-icon {
          transform: scale(1.1);
        }

        .file-icon.pdf {
          background: #fee2e2;
          color: #dc2626;
        }

        .file-icon.doc {
          background: #dbeafe;
          color: #2563eb;
        }

        .file-icon.ppt {
          background: #ffedd5;
          color: #ea580c;
        }

        .file-icon.image {
          background: #dcfce7;
          color: #16a34a;
        }

        .file-info {
          display: flex;
          flex-direction: column;
        }

        .file-name {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .file-credits {
          color: var(--muted-foreground);
          font-size: 0.875rem;
        }

        /* FAQ Section */
        .faq-section {
          background: var(--muted);
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .faq-container {
          position: relative;
          max-width: 800px;
          margin: 0 auto;
          height: 500px;
        }

        .faq-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.05;
          border-radius: 20px;
          overflow: hidden;
        }

        .faq-background img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .faq-list {
          position: relative;
          z-index: 2;
          opacity: 0;
          animation: fadeInUp 0.8s ease 0.4s forwards;
          height: 100%;
          overflow-y: auto;
        }

        .faq-card {
          margin-bottom: 1rem;
          border: 1px solid var(--border);
          transition: all 0.3s ease;
          background: var(--card);
          overflow: hidden;
        }

        .faq-card:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
        }

        .faq-content {
          padding: 0;
        }

        .faq-question {
          width: 100%;
          padding: 1.5rem;
          text-align: left;
          background: none;
          border: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .faq-question:hover {
          background: var(--secondary);
        }

        .faq-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: var(--muted-foreground);
          transition: all 0.3s ease;
        }

        .faq-answer {
          padding: 0 1.5rem 1.5rem;
          color: var(--muted-foreground);
          line-height: 1.6;
          animation: slideDown 0.3s ease;
        }

        /* CTA Section - Animated Background */
        .cta-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          color: white;
          text-align: center;
          position: relative;
          min-height: 80vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow: hidden;
        }

        .cta-content {
          position: relative;
          z-index: 2;
          padding: 3rem 0;
        }

        /* Animated Background */
        .animated-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
        }

        /* Floating Shapes */
        .floating-shapes {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .shape-1 {
          width: 80px;
          height: 80px;
          top: 10%;
          left: 10%;
          animation: float 6s ease-in-out infinite;
        }

        .shape-2 {
          width: 120px;
          height: 120px;
          top: 60%;
          right: 10%;
          animation: float 8s ease-in-out infinite 1s;
        }

        .shape-3 {
          width: 60px;
          height: 60px;
          bottom: 20%;
          left: 20%;
          animation: float 7s ease-in-out infinite 0.5s;
        }

        .shape-4 {
          width: 100px;
          height: 100px;
          top: 20%;
          right: 20%;
          animation: float 9s ease-in-out infinite 1.5s;
        }

        .shape-5 {
          width: 70px;
          height: 70px;
          bottom: 10%;
          right: 30%;
          animation: float 5s ease-in-out infinite 0.8s;
        }

        .shape-6 {
          width: 90px;
          height: 90px;
          top: 70%;
          left: 5%;
          animation: float 10s ease-in-out infinite 2s;
        }

        /* Gradient Orbs */
        .gradient-orbs {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0.6;
        }

        .orb-1 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, #ff6b6b, transparent);
          top: -100px;
          left: -100px;
          animation: pulse 8s ease-in-out infinite;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #4ecdc4, transparent);
          bottom: -150px;
          right: -100px;
          animation: pulse 12s ease-in-out infinite 2s;
        }

        .orb-3 {
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, #45b7d1, transparent);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 10s ease-in-out infinite 1s;
        }

        /* Particles */
        .particles {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          animation: float 15s linear infinite;
        }

        /* Create random particle positions */
        .particle:nth-child(1) { top: 20%; left: 10%; animation-delay: 0s; }
        .particle:nth-child(2) { top: 60%; left: 20%; animation-delay: 1s; }
        .particle:nth-child(3) { top: 30%; left: 80%; animation-delay: 2s; }
        .particle:nth-child(4) { top: 70%; left: 70%; animation-delay: 3s; }
        .particle:nth-child(5) { top: 40%; left: 40%; animation-delay: 4s; }
        .particle:nth-child(6) { top: 80%; left: 30%; animation-delay: 5s; }
        .particle:nth-child(7) { top: 20%; left: 60%; animation-delay: 6s; }
        .particle:nth-child(8) { top: 50%; left: 90%; animation-delay: 7s; }
        .particle:nth-child(9) { top: 10%; left: 30%; animation-delay: 8s; }
        .particle:nth-child(10) { top: 90%; left: 80%; animation-delay: 9s; }
        .particle:nth-child(11) { top: 30%; left: 15%; animation-delay: 10s; }
        .particle:nth-child(12) { top: 70%; left: 45%; animation-delay: 11s; }
        .particle:nth-child(13) { top: 25%; left: 75%; animation-delay: 12s; }
        .particle:nth-child(14) { top: 85%; left: 25%; animation-delay: 13s; }
        .particle:nth-child(15) { top: 45%; left: 55%; animation-delay: 14s; }
        .particle:nth-child(16) { top: 15%; left: 85%; animation-delay: 15s; }
        .particle:nth-child(17) { top: 65%; left: 15%; animation-delay: 16s; }
        .particle:nth-child(18) { top: 35%; left: 35%; animation-delay: 17s; }
        .particle:nth-child(19) { top: 75%; left: 65%; animation-delay: 18s; }
        .particle:nth-child(20) { top: 55%; left: 95%; animation-delay: 19s; }

        .cta-title {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1rem;
          opacity: 0;
          animation: fadeInUp 0.8s ease 0.2s forwards;
        }

        .cta-description {
          font-size: 1.25rem;
          margin-bottom: 2rem;
          opacity: 0.9;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          opacity: 0;
          animation: fadeInUp 0.8s ease 0.4s forwards;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          opacity: 0;
          animation: fadeInUp 0.8s ease 0.6s forwards;
        }

        /* Footer */
        .landing-footer {
          background: rgba(30, 41, 59, 0.95);
          color: white;
          padding: 2rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          text-align: center;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 1.25rem;
        }

        .footer-logo-icon {
          width: 1.5rem;
          height: 1.5rem;
        }

        .footer-logo-highlight {
          color: var(--primary);
        }

        .footer-copyright {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .footer-made-with {
          opacity: 0.8;
          font-size: 0.875rem;
        }

        /* Enhanced Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 200px;
          }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0) translateX(-50%);
          }
          40% {
            transform: translateY(-10px) translateX(-50%);
          }
          60% {
            transform: translateY(-5px) translateX(-50%);
          }
        }

        /* New Animations for CTA Section */
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(120deg);
          }
          66% {
            transform: translateY(10px) rotate(240deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .hero-content {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 2rem;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-buttons {
            flex-direction: column;
            align-items: center;
          }

          .hero-stats {
            flex-direction: column;
            gap: 1rem;
          }

          .nav-links {
            display: none;
          }

          .section-title {
            font-size: 2rem;
          }

          .steps-container {
            grid-template-columns: 1fr;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .files-grid {
            grid-template-columns: 1fr;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .header-buttons {
            display: none;
          }

          .section {
            padding: 3rem 0;
          }

          .files-container,
          .faq-container {
            height: auto;
            min-height: 300px;
          }

          .cta-title {
            font-size: 2rem;
          }

          .shape {
            display: none; /* Hide shapes on mobile for better performance */
          }

          .orb {
            filter: blur(20px); /* Reduce blur on mobile */
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 2rem;
          }

          .hero-description {
            font-size: 1rem;
          }

          .section-title {
            font-size: 1.75rem;
          }

          .section {
            padding: 2rem 0;
          }

          .cta-title {
            font-size: 1.75rem;
          }
        }
          .logo-image {
  height: 40px; /* Adjust based on your logo's aspect ratio */
  width: auto;
  object-fit: contain;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}
      `}</style>
    </div>
  );
}