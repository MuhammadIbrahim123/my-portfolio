import { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail, Phone, MapPin, ArrowRight, ExternalLink,
  Menu, X, Code2, Palette, Smartphone, Zap, ShoppingCart, Wrench,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown, MessageCircle,
  Sun, Moon, Monitor,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const useTheme = () => {
  const stored = () => { try { return localStorage.getItem("theme") || "system"; } catch { return "system"; } };
  const [theme, setThemeState] = useState(stored);

  useEffect(() => {
    const apply = (t) => {
      const dark = t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply(theme);
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => apply("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = (t) => {
    try { localStorage.setItem("theme", t); } catch (e) { console.warn("Theme storage unavailable", e); }
    setThemeState(t);
  };

  return { theme, setTheme };
};

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const options = [
    { value: "light",  Icon: Sun,     label: "Light"  },
    { value: "dark",   Icon: Moon,    label: "Dark"   },
    { value: "system", Icon: Monitor, label: "System" },
  ];
  const current = options.find((o) => o.value === theme);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/8 dark:border-white/10 text-[#666] dark:text-[#999] hover:border-ink dark:hover:border-white/30 hover:text-ink dark:hover:text-white transition-all duration-300 text-[12px] font-semibold font-body cursor-pointer"
      >
        <current.Icon size={14} />
        <span className="hidden sm:inline tracking-[0.5px] uppercase">{current.label}</span>
        <ChevronDown size={11} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[130px] bg-white dark:bg-[#1a1a1a] rounded-xl border border-black/8 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden z-[200]"
          >
            {options.map(({ value, Icon, label }) => (
              <button
                key={value}
                onClick={() => { setTheme(value); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition-colors cursor-pointer ${
                  theme === value
                    ? "text-accent bg-accent/8"
                    : "text-[#666] dark:text-[#999] hover:bg-black/4 dark:hover:bg-white/5 hover:text-ink dark:hover:text-white"
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Computed once at module level — safe to read during render
const IS_FINE_POINTER = window.matchMedia("(pointer: fine)").matches;

const CustomCursor = () => {
  const [pos, setPos]               = useState({ x: -200, y: -200 });
  const [isHovering, setIsHovering] = useState(false);
  const [isCard, setIsCard]         = useState(false);
  const [isDark, setIsDark]         = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    if (!IS_FINE_POINTER) return;
    const mo = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains("dark"))
    );
    mo.observe(document.documentElement, { attributeFilter: ["class"] });
    const onMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      const el = e.target;
      const card = !!el.closest("[data-project]");
      const link = !!el.closest("a, button");
      setIsCard(card);
      setIsHovering(link && !card);
    };
    window.addEventListener("mousemove", onMove);
    return () => { window.removeEventListener("mousemove", onMove); mo.disconnect(); };
  }, []);

  if (!IS_FINE_POINTER) return null;

  const dotColor    = isDark ? "#10b981" : "#1a1a1a";
  const ringDefault = isDark ? "rgba(16,185,129,0.5)" : "rgba(26,26,26,0.3)";
  const ringActive  = "#10b981";

  return (
    <>
      {/* Dot — instant */}
      <div className="fixed pointer-events-none z-[9999] w-2 h-2 rounded-full"
        style={{ left: pos.x, top: pos.y, transform: "translate(-50%,-50%)", backgroundColor: dotColor }} />
      {/* Ring — trailing */}
      <div className="fixed pointer-events-none z-[9999] rounded-full border-2"
        style={{
          left: pos.x, top: pos.y,
          width: 36, height: 36,
          transform: `translate(-50%,-50%) scale(${isCard ? 2 : isHovering ? 1.5 : 1})`,
          borderColor: (isHovering || isCard) ? ringActive : ringDefault,
          background: (isHovering || isCard) ? "rgba(16,185,129,0.08)" : "transparent",
          transition: "left 150ms ease-out, top 150ms ease-out, transform 200ms ease-out, border-color 200ms, background 200ms",
        }} />
    </>
  );
};

const LinkedinIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

// Defined outside Portfolio so React never remounts it on parent re-renders
const CountUp = ({ end, suffix = "", duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const elRef = useRef(null);
  const hasAnimated = useRef(false);
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;
        const steps = 60;
        const increment = end / steps;
        const intervalMs = duration / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, intervalMs);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);
  return <span ref={elRef}>{count}{suffix}</span>;
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const ease = [0.16, 1, 0.3, 1];

const QUESTIONS = [
  { q: "What services do you offer?",  a: "I specialize in React.js & Next.js development, Figma-to-code conversion, responsive design, performance optimization, e-commerce frontends, and ongoing maintenance. Let's discuss your project! 🚀" },
  { q: "Show me your projects",        a: "I've built 7+ live products across healthcare, e-commerce, SaaS & analytics. Check out my projects section above, or visit paisli-medical-fe.vercel.app to see my work! 💻" },
  { q: "What's your tech stack?",      a: "My core stack: React.js, Next.js, TypeScript, Tailwind CSS, Redux/Zustand, REST APIs & GraphQL. I also work with Material UI, Shadcn, Framer Motion, and deploy via Vercel. ⚡" },
  { q: "How can I hire you?",          a: "Easy! Fill out the contact form above, email me at laftan033@gmail.com, or message me on LinkedIn. I'm currently available for freelance projects and open to collaboration! 🤝" },
];

const ChatBot = () => {
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState([{ type: "bot", text: "Hey! 👋 I'm Ibrahim's portfolio assistant. What would you like to know?" }]);
  const [isTyping, setIsTyping]   = useState(false);
  const [clicked, setClicked]     = useState(new Set());
  const bottomRef                 = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleQuestion = (item) => {
    if (isTyping) return;
    setMessages((prev) => [...prev, { type: "user", text: item.q }]);
    setClicked((prev) => new Set([...prev, item.q]));
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { type: "bot", text: item.a }]);
      setIsTyping(false);
    }, 800);
  };

  const available = QUESTIONS.filter((it) => !clicked.has(it.q));

  return (
    <>
      {/* ── Chat window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease }}
            className="fixed bottom-24 right-6 z-[998] w-[360px] max-[400px]:w-[calc(100vw-32px)] max-h-[500px] bg-white rounded-2xl border border-black/6 shadow-[0_25px_60px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-ink px-5 py-4 flex items-center gap-3 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-cream font-semibold text-[15px]">Ibrahim's Assistant</div>
                <div className="text-cream/60 text-[11px] mt-0.5">Typically replies instantly</div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-cream/70 hover:text-cream transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#fafaf8] max-h-[340px]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex items-end gap-2.5 ${msg.type === "user" ? "flex-row-reverse" : ""}`}>
                  {msg.type === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-accent text-cream text-[11px] font-bold flex items-center justify-center shrink-0">MI</div>
                  )}
                  <div className={`px-4 py-3 text-[14px] leading-[1.6] max-w-[85%] ${
                    msg.type === "bot"
                      ? "bg-white rounded-2xl rounded-tl-sm text-[#444] border border-black/6 shadow-sm"
                      : "bg-ink rounded-2xl rounded-tr-sm text-cream"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-end gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-accent text-cream text-[11px] font-bold flex items-center justify-center shrink-0">MI</div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 border border-black/6 shadow-sm flex gap-1.5 items-center">
                    {[0, 150, 300].map((delay, idx) => (
                      <span key={idx} className="w-2 h-2 rounded-full bg-[#999] inline-block animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Quick replies */}
              {!isTyping && available.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {available.map((item, i) => (
                    <button key={i} onClick={() => handleQuestion(item)}
                      className="px-4 py-2 rounded-full border border-accent/30 text-accent text-[13px] font-medium bg-accent/5 hover:bg-accent hover:text-cream transition-all duration-200 cursor-pointer">
                      {item.q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toggle button ── */}
      <div className="fixed bottom-6 right-22 z-[997]">
        {!isOpen && <div className="absolute inset-0 w-12 h-12 rounded-full bg-accent/30 animate-ping pointer-events-none" />}
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen((o) => !o)}
          className="relative w-12 h-12 rounded-full bg-accent text-cream flex items-center justify-center shadow-[0_8px_30px_rgba(16,185,129,0.3)] cursor-pointer"
        >
          {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
        </motion.button>
      </div>
    </>
  );
};

const Portfolio = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeFilter, setActiveFilter] = useState("All");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  // Inline plugin avoids accessing .current during render
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCarouselIndex(emblaApi.selectedScrollSnap());
    const onReInit = () => setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onReInit);
    onSelect();
    onReInit();
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onReInit);
    };
  }, [emblaApi]);

  // On filter change: reInit so Embla sees new slide count, then jump to start
  // setCarouselIndex is handled automatically by the "select" event after scrollTo
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    emblaApi.scrollTo(0, true);
  }, [activeFilter, emblaApi]);

  const EMAILJS_SERVICE  = "service_i8xrp7p";
  const EMAILJS_TEMPLATE = "template_agcjkws";
  const EMAILJS_PUBLIC   = "VOBYuxPZIH27wL1-Q";

  const navItems = ["Home", "About", "Skills", "Projects", "Experience", "Services", "Contact"];

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY || 0);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      setSendStatus("empty");
      setTimeout(() => setSendStatus(null), 3000);
      return;
    }
    setSending(true);
    setSendStatus(null);
    try {
      await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
        name: formData.name, email: formData.email,
        message: formData.message, title: formData.name,
      }, EMAILJS_PUBLIC);
      setSendStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
      setSendStatus("error");
    }
    setSending(false);
    setTimeout(() => setSendStatus(null), 5000);
  };

  // ── Data ──────────────────────────────────────────────────────────────────
  const skills = [
    { category: "Core", items: [
      { name: "React.js", level: 95 }, { name: "Next.js", level: 90 }, { name: "TypeScript", level: 88 },
      { name: "JavaScript ES6+", level: 95 }, { name: "HTML5", level: 98 }, { name: "CSS3 / SCSS", level: 95 },
    ]},
    { category: "State & Data", items: [
      { name: "Redux / RTK", level: 90 }, { name: "Zustand", level: 85 }, { name: "Context API", level: 92 },
      { name: "React Query", level: 85 }, { name: "RESTful APIs", level: 92 }, { name: "GraphQL", level: 75 },
    ]},
    { category: "UI & Styling", items: [
      { name: "Tailwind CSS", level: 93 }, { name: "Material UI", level: 88 }, { name: "Shadcn/UI", level: 85 },
      { name: "Ant Design", level: 82 }, { name: "Framer Motion", level: 80 }, { name: "Styled Components", level: 85 },
    ]},
    { category: "Tools & DevOps", items: [
      { name: "Git / GitHub", level: 92 }, { name: "Webpack / Vite", level: 88 }, { name: "Vercel / Netlify", level: 90 },
      { name: "CI/CD Pipelines", level: 82 }, { name: "Jest / RTL", level: 85 }, { name: "Figma to Code", level: 90 },
    ]},
  ];

  const projects = [
    { title: "Paisli Medical", category: "Healthcare", desc: "A modern medical application frontend with clean UI architecture, intuitive patient-facing interfaces, and responsive design ensuring accessibility across all devices.", tech: ["React.js", "Next.js", "Medical UI", "Responsive Design"], link: "https://paisli-medical-fe.vercel.app/", color: "#14b8a6", icon: "⚕️" },
    { title: "TraQR Software", category: "Enterprise", desc: "Enterprise industrial asset management platform with QR code-based equipment tracking, AI-powered predictive maintenance, and real-time operational dashboards. Multi-role system for OEMs, Field Service Providers, End Users, and Distributors — covering order management, inspections, work orders, and document management across the full industrial supply chain.", tech: ["React.js", "Multi-role", "QR Code", "AI Integration", "Enterprise"], link: "https://tra-q-sw-fe.vercel.app/", color: "#6366f1", icon: "⚙️" },
    { title: "HelpTouch — Gifts4Families", category: "Web App", desc: "A donation platform featuring sponsor-funded gift cards delivered to foster families. Designed complete UI with user auth, profile management, and secure digital gift card delivery via email.", tech: ["React.js", "API Integration", "Auth Systems", "Responsive UI"], link: "https://gifts4families.cc/", color: "#f59e0b", icon: "🎁" },
    { title: "RegelTec — HYDRAFIL Study", category: "Healthcare", desc: "A clinical trial management platform for the HYDRAFIL-D study. Facilitating patient data collection, screening, eligibility assessment, and FDA-compliant regulatory tracking across 225+ participants.", tech: ["React.js", "Clinical Data", "FDA Compliance", "Multi-site"], link: "https://www.hydrafilstudy.com", color: "#3b82f6", icon: "🏥" },
    { title: "Freight Clarity", category: "Analytics", desc: "A freight spend management platform with advanced analytics. Automated reverse billing, tender analysis, and root cause algorithms reducing manual verification by 80%.", tech: ["React.js", "Analytics", "Data Processing", "Automation"], link: "https://www.freightclarity.com", color: "#8b5cf6", icon: "📊" },
    { title: "Splitmart", category: "E-Commerce", desc: "A comprehensive e-commerce marketplace with dynamic product filtering, multi-vendor catalog management, secure payment processing, and optimized performance across all devices.", tech: ["React.js", "E-Commerce", "Payment Integration", "Search & Filter"], link: "https://splitmart.com/", color: "#ec4899", icon: "🛒" },
  ];

  const categories = ["All", ...new Set(projects.map((p) => p.category))];
  const filteredProjects = activeFilter === "All" ? projects : projects.filter((p) => p.category === activeFilter);

  const experience = [
    { role: "Senior Frontend Engineer", company: "Silicon Nexus", location: "Lahore, PK", period: "Dec 2024 — Present",
      highlights: ["Leading frontend architecture for Paisli Medical, TraQR Software, and enterprise web applications", "Built healthcare platforms with FDA-compliant data collection and clinical trial management", "Performance monitoring with Lighthouse & Web Vitals, achieving 90+ performance scores", "85% test coverage with comprehensive testing suites, reducing production bugs by 45%"] },
    { role: "Frontend Engineer", company: "Graffitecs", location: "Lahore, PK", period: "Dec 2023 — Nov 2024",
      highlights: ["Built freight analytics platform with advanced data processing", "E-commerce marketplace with multi-vendor support", "Automated billing systems reducing manual work by 80%", "Dynamic filtering and real-time search functionality"] },
    { role: "Frontend Engineer", company: "Prosign", location: "Lahore, PK", period: "Jan 2022 — Nov 2023",
      highlights: ["CI/CD workflows for zero-downtime deployments", "30% improvement in page load times", "Active Agile/Scrum participation", "Component-based architecture for scalable solutions"] },
  ];

  const services = [
    { Icon: Code2,        title: "React & Next.js Development", desc: "Custom web applications with modern React patterns, server-side rendering, and optimized performance for scalable business solutions." },
    { Icon: Palette,      title: "Figma to Code Conversion",    desc: "Pixel-perfect translation of your design files into clean, responsive, production-ready code with attention to every detail." },
    { Icon: Smartphone,   title: "Responsive Web Design",       desc: "Mobile-first development ensuring your application looks and works flawlessly across all devices and screen sizes." },
    { Icon: Zap,          title: "Performance Optimization",    desc: "Speed audits, code splitting, lazy loading, and caching strategies to deliver lightning-fast user experiences." },
    { Icon: ShoppingCart, title: "E-Commerce Frontends",        desc: "Dynamic product catalogs, search & filter systems, payment integration, and conversion-optimized shopping experiences." },
    { Icon: Wrench,       title: "Bug Fixing & Maintenance",    desc: "Quick turnaround on frontend bugs, UI inconsistencies, browser compatibility issues, and code refactoring." },
  ];

  const stats = [
    { value: 3,  suffix: "+", label: "Years Experience" },
    { value: 15, suffix: "+", label: "Projects Delivered" },
    { value: 7,  suffix: "+", label: "Live Products" },
    { value: 5,  suffix: "+", label: "Industries Served" },
  ];

  const marqueeItems = ["React.js", "Next.js", "TypeScript", "Tailwind CSS", "Redux", "Performance", "E-Commerce", "Healthcare", "SaaS"];

  const contactItems = [
    { Icon: Mail,     label: "Email",    value: "laftan033@gmail.com",    href: "mailto:laftan033@gmail.com" },
    { Icon: Phone,    label: "Phone",    value: "+92 331 5727761" },
    { Icon: LinkedinIcon, label: "LinkedIn", value: "Muhammad Ibrahim",       href: "https://www.linkedin.com/in/muhammad-ibrahim-933172222/" },
    { Icon: MapPin,   label: "Location", value: "Lahore, Pakistan" },
  ];

  // ── Shared class fragments ───────────────────────────────────────────────
  const btnPrimary = "inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-ink text-cream rounded-full text-[14px] font-semibold no-underline hover:-translate-y-0.5 hover:bg-[#333] hover:shadow-[0_12px_35px_rgba(0,0,0,0.2)] transition-all duration-500";
  const btnOutline = "inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-transparent text-ink border-[1.5px] border-[#ddd] rounded-full text-[14px] font-semibold no-underline hover:border-ink hover:-translate-y-0.5 transition-all duration-500";
  const sectionLabel = "text-[12px] font-bold tracking-[3px] uppercase text-[#999] mb-[14px] font-body";
  const sectionTitle = "font-sora font-bold text-[clamp(28px,4vw,48px)] leading-[1.15] tracking-[-1.5px] text-ink";
  const inputCls = "w-full px-5 py-4 border-[1.5px] border-[#e5e5e3] dark:border-[#2a2a2a] rounded-[14px] text-[15px] font-body bg-white dark:bg-[#1a1a1a] text-ink outline-none focus:border-ink dark:focus:border-accent focus:shadow-[0_0_0_3px_rgba(26,26,26,0.06)] dark:focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] placeholder:text-[#bbb] dark:placeholder:text-[#555] transition-all duration-300";

  return (
    <div className="font-body bg-cream text-ink min-h-screen overflow-x-hidden cursor-none">
      <CustomCursor />

      {/* ── NAVBAR ──────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-[clamp(20px,5vw,80px)] bg-[rgba(250,250,248,0.88)] dark:bg-[rgba(13,13,13,0.92)] backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.06] transition-all duration-500${scrollY > 50 ? " shadow-[0_4px_30px_rgba(0,0,0,0.06)]" : ""}`}>
        <div className="max-w-[1280px] mx-auto flex items-center justify-between h-[72px]">
          <div className="font-sora font-extrabold text-2xl tracking-[-1.5px]">
            MI<span className="text-accent">.</span>
          </div>
          <div className="hidden md:flex gap-8 items-center">
            {navItems.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="relative text-[13px] font-medium text-[#666] dark:text-accent uppercase tracking-[0.5px] py-1.5 transition-colors duration-300 hover:text-ink dark:hover:text-accent group no-underline">
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-ink dark:bg-accent transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="md:hidden p-2 text-ink" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE MENU ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-[998]"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease }}
              className="fixed top-0 right-0 w-[280px] h-screen bg-[rgba(250,250,248,0.97)] dark:bg-[rgba(13,13,13,0.97)] backdrop-blur-xl z-999 flex flex-col pt-20 px-10 gap-6 shadow-[-10px_0_40px_rgba(0,0,0,0.08)]"
            >
              {navItems.map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`}
                  className="text-lg font-medium text-[#666] hover:text-ink transition-colors no-underline"
                  onClick={() => setIsMenuOpen(false)}>
                  {item}
                </a>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section id="home" className="min-h-screen flex items-center pt-[120px] pb-[80px] px-[clamp(20px,5vw,80px)] relative">
        <div className="absolute w-125 h-125 rounded-full bg-ink opacity-[0.03] -top-25 -right-37.5 pointer-events-none" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-ink opacity-[0.03] bottom-[50px] -left-[100px] pointer-events-none" />

        <div className="max-w-[1280px] mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[60px] items-center">

            {/* LEFT */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0, ease }}
                className="inline-flex items-center gap-2 px-[18px] py-2 rounded-full bg-ink text-cream text-[11px] font-semibold tracking-[1.5px] uppercase font-body mb-8"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
                Available for Freelance
              </motion.div>

              <h1 className="font-sora font-extrabold text-[clamp(40px,7vw,86px)] leading-[1.06] tracking-[-3px]">
                <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease }} className="block">
                  Muhammad
                </motion.span>
                <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4, ease }} className="block text-accent">
                  Ibrahim
                </motion.span>
              </h1>

              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6, ease }} className="mt-4 mb-6">
                <span className="inline-flex items-center font-code text-[14px] font-medium text-accent tracking-[1px] border-[1.5px] border-accent rounded-full px-5 py-2">
                  <span className="mr-2">●</span>Senior Frontend Engineer
                </span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8, ease }}
                className="text-[clamp(15px,1.8vw,17px)] text-[#777] leading-[1.75] max-w-[520px] mb-11"
              >
                Senior Frontend Engineer crafting pixel-perfect, high-performance web applications with React.js & Next.js. 3+ years turning complex ideas into elegant digital experiences.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0, ease }}
                className="flex gap-4 flex-wrap"
              >
                <a href="#projects" className={btnPrimary}>View Projects <ArrowRight size={18} /></a>
                <a href="#contact" className={btnOutline}>Let's Talk</a>
              </motion.div>
            </div>

            {/* RIGHT: Contact card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease }}
              className="bg-white border border-black/[0.06] rounded-3xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.06)] mt-8 lg:mt-0"
            >
              <h3 className="font-sora text-[20px] font-bold text-ink mb-2">Let's Connect</h3>
              <p className="text-[14px] text-[#777] mb-8">Open for freelance projects & collaborations</p>
              <div className="flex flex-col gap-5">
                {contactItems.map(({ Icon, label, value, href }, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#ecfdf5] flex items-center justify-center shrink-0">
                      <Icon size={20} className="text-accent" />
                    </div>
                    <div>
                      <div className="text-[11px] text-[#999] font-bold tracking-[1.5px] uppercase mb-0.5">{label}</div>
                      {href ? (
                        <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                          className="text-ink font-semibold text-[14px] no-underline hover:text-accent transition-colors">{value}</a>
                      ) : (
                        <span className="text-ink font-semibold text-[14px]">{value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <a href="#contact" className={`${btnPrimary} w-full mt-8`}>
                Send me a message <ArrowRight size={16} />
              </a>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-[60px] border-t border-[#e5e5e3] pt-10">
            {stats.map((s, i) => (
              <div key={i} className="text-center py-8 px-5">
                <div className="font-sora text-[clamp(36px,5vw,46px)] font-extrabold text-ink leading-none tracking-[-2px]">
                  <CountUp end={s.value} suffix={s.suffix} />
                </div>
                <div className="text-[14px] text-[#888] font-medium mt-2 tracking-[0.3px]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ─────────────────────────────────────────────────────── */}
      <div className="overflow-hidden py-[50px] border-t border-b border-[#e5e5e3] dark:border-[#2a2a2a] bg-[#f5f5f2] dark:bg-[#0d0d0d]">
        <div className="flex gap-6 animate-marquee whitespace-nowrap items-center">
          {[...marqueeItems, ...marqueeItems].map((t, i) => (
            <span key={i} style={{ display: "contents" }}>
              <span className="font-sora text-[clamp(36px,5vw,56px)] font-extrabold text-ink dark:text-accent tracking-[-1.5px] opacity-[0.12] dark:opacity-[0.3]">{t}</span>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent opacity-50 shrink-0" />
            </span>
          ))}
        </div>
      </div>

      {/* ── ABOUT ───────────────────────────────────────────────────────── */}
      <section id="about" className="py-[120px] px-[clamp(20px,5vw,80px)]">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          className="max-w-[1280px] mx-auto">
          <div className={sectionLabel}>About Me</div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-16 items-start mt-2">

            {/* LEFT ── story + buttons */}
            <div>
              <h2 className={`${sectionTitle} mb-8`}>
                Turning ideas into<br /><span className="text-accent">exceptional</span> interfaces
              </h2>
              <div className="space-y-5">
                <p className="text-[16px] leading-[1.8] text-[#666]">
                  I'm a Senior Frontend Engineer based in Lahore, Pakistan, with over 3 years of professional experience building production-grade web applications. My expertise lies in React.js, Next.js, and TypeScript — creating interfaces that are not only visually compelling but also performant and accessible.
                </p>
                <p className="text-[16px] leading-[1.8] text-[#666]">
                  I've delivered solutions across healthcare, fintech, e-commerce, logistics, and SaaS — working with international teams and clients to turn complex business requirements into clean, intuitive user experiences.
                </p>
                <p className="text-[16px] leading-[1.8] text-[#666]">
                  Currently building my own digital agency alongside my SEO partner, offering end-to-end frontend development and search optimization services to businesses worldwide.
                </p>
              </div>
              <div className="flex gap-4 mt-10 flex-wrap">
                <a href="https://www.linkedin.com/in/muhammad-ibrahim-933172222/" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3 bg-transparent text-ink border-[1.5px] border-[#ddd] rounded-full text-[13px] font-semibold no-underline hover:border-ink hover:-translate-y-0.5 transition-all duration-500">
                  LinkedIn <ExternalLink size={14} />
                </a>
                <a href="mailto:laftan033@gmail.com"
                  className="inline-flex items-center gap-2 px-7 py-3 bg-ink text-cream rounded-full text-[13px] font-semibold no-underline hover:-translate-y-0.5 hover:bg-[#333] transition-all duration-500">
                  Email Me
                </a>
              </div>
            </div>

            {/* RIGHT ── Why Work With Me card */}
            <div className="bg-white border border-black/6 rounded-3xl p-10 shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
              <h3 className="font-sora text-[20px] font-bold text-ink mb-8">Why Work With Me</h3>
              <div className="flex flex-col gap-6">
                {[
                  { Icon: Zap,        title: "Fast Delivery",      desc: "Quick turnarounds without compromising quality" },
                  { Icon: Code2,      title: "Clean Code",         desc: "Modular, scalable, and well-documented codebase" },
                  { Icon: Smartphone, title: "Pixel Perfect",      desc: "Exact Figma-to-code implementation across all devices" },
                  { Icon: Wrench,     title: "Ongoing Support",    desc: "Post-launch maintenance and bug fixes included" },
                ].map(({ Icon, title, desc }, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={18} className="text-accent" />
                    </div>
                    <div>
                      <div className="text-[15px] font-bold text-ink">{title}</div>
                      <div className="text-[13px] text-[#777] mt-0.5 leading-relaxed">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── SKILLS ──────────────────────────────────────────────────────── */}
      <section id="skills" className="py-[120px] px-[clamp(20px,5vw,80px)] bg-white">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          className="max-w-[1280px] mx-auto">
          <div className={sectionLabel}>Technical Expertise</div>
          <h2 className={`${sectionTitle} mb-[60px]`}>
            Skills & <span className="text-accent">Technologies</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {skills.map((cat, ci) => (
              <div key={ci} className="p-8 rounded-[20px] bg-cream border border-black/[0.06]">
                <h3 className="font-sora text-[14px] font-bold tracking-[2px] uppercase text-accent mb-7">{cat.category}</h3>
                <div className="flex flex-col gap-[22px]">
                  {cat.items.map((skill, si) => (
                    <div key={si}>
                      <div className="flex justify-between items-center mb-2.5">
                        <span className="text-[16px] font-semibold text-[#222]">{skill.name}</span>
                        <span className="text-[14px] font-code font-semibold text-ink bg-[#eeeee9] dark:bg-[#252525] dark:text-[#F0F0EE] px-2.5 py-0.5 rounded-lg">{skill.level}%</span>
                      </div>
                      <div className="h-2 bg-[#eeeee9] dark:bg-[#252525] rounded-[10px] overflow-hidden">
                        <motion.div
                          className="h-full rounded-[10px] bg-linear-to-r from-ink to-[#444] dark:from-[#5a5a5a] dark:to-[#888]"
                          initial={{ width: "0%" }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, ease, delay: si * 0.05 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── PROJECTS ────────────────────────────────────────────────────── */}
      <section id="projects" className="py-[120px] px-[clamp(20px,5vw,80px)]">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          className="max-w-[1280px] mx-auto">
          <div className={sectionLabel}>Selected Work</div>
          <h2 className={`${sectionTitle} mb-5`}>
            Featured <span className="text-accent">Projects</span>
          </h2>
          <p className="text-[16px] text-[#777] mb-10 max-w-[560px]">
            A collection of real-world products I've built — from healthcare platforms to e-commerce marketplaces.
          </p>

          {/* Filter buttons */}
          <div className="flex gap-2.5 flex-wrap mb-12 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveFilter(cat)}
                className={`px-6 py-2.5 rounded-full border-[1.5px] text-[13px] font-semibold tracking-[0.3px] transition-all duration-300 font-body whitespace-nowrap ${
                  activeFilter === cat
                    ? "bg-ink text-cream border-ink"
                    : "bg-transparent text-[#777] border-[#e5e5e3] hover:bg-ink hover:text-cream hover:border-ink"
                }`}>
                {cat}
              </button>
            ))}
          </div>

          {/* ── Carousel ── */}
          <div className="relative">
            {/* Viewport */}
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex -ml-7">
                {filteredProjects.map((project, i) => (
                  <div
                    key={`${project.title}-${i}`}
                    className="flex-[0_0_100%] md:flex-[0_0_50%] xl:flex-[0_0_33.333%] min-w-0 pl-7"
                  >
                    <motion.a
                      href={project.link} target="_blank" rel="noopener noreferrer"
                      data-project=""
                      className="no-underline text-inherit group block h-full"
                      whileHover={{ y: -8 }}
                      transition={{ duration: 0.5, ease }}
                    >
                      <div className="rounded-[20px] overflow-hidden bg-white border border-black/6 group-hover:shadow-[0_25px_60px_rgba(0,0,0,0.1)] group-hover:border-transparent transition-all duration-500 h-full flex flex-col">
                        <div className="h-50 flex items-center justify-center relative"
                          style={{ background: `linear-gradient(135deg, ${project.color}20, ${project.color}40)` }}>
                          <span className="text-[56px] transition-transform duration-500 group-hover:scale-[1.3] group-hover:rotate-10">
                            {project.icon}
                          </span>
                          <div className="absolute top-4 right-4 px-3.5 py-1.5 rounded-full bg-white/90 text-[11px] font-semibold text-[#555]">
                            {project.category}
                          </div>
                        </div>
                        <div className="p-6 pb-7 flex flex-col flex-1">
                          <h3 className="font-sora text-[18px] font-bold mb-2.5 text-ink tracking-[-0.5px]">{project.title}</h3>
                          <p className="text-[14px] leading-[1.7] text-[#888] mb-4.5 line-clamp-3">{project.desc}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {project.tech.map((t, ti) => (
                              <span key={ti} className="px-4 py-1.5 rounded-full bg-black/5 text-[#555] text-[12px] font-medium font-code">{t}</span>
                            ))}
                          </div>
                          <div className="flex items-center gap-1 text-accent text-[13px] font-semibold mt-4">
                            View Project
                            <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </motion.a>
                  </div>
                ))}
              </div>
            </div>

            {/* Prev / Next arrows */}
            <button
              onClick={() => emblaApi?.scrollPrev()}
              className="hidden md:flex absolute left-0 top-25 -translate-x-5 w-11 h-11 rounded-full bg-white border border-black/8 shadow-[0_4px_16px_rgba(0,0,0,0.1)] items-center justify-center hover:bg-ink hover:text-cream hover:border-ink transition-all duration-300 z-10"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              className="hidden md:flex absolute right-0 top-25 translate-x-5 w-11 h-11 rounded-full bg-white border border-black/8 shadow-[0_4px_16px_rgba(0,0,0,0.1)] items-center justify-center hover:bg-ink hover:text-cream hover:border-ink transition-all duration-300 z-10"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === carouselIndex
                    ? "w-6 h-2 bg-ink"
                    : "w-2 h-2 bg-[#ccc] hover:bg-[#999]"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── EXPERIENCE ──────────────────────────────────────────────────── */}
      <section id="experience" className="py-[120px] px-[clamp(20px,5vw,80px)] bg-white">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          className="max-w-[1280px] mx-auto">
          <div className={sectionLabel}>Career Journey</div>
          <h2 className={`${sectionTitle} mb-[60px]`}>
            Work <span className="text-accent">Experience</span>
          </h2>

          {/* Timeline container */}
          <div className="relative">
            {/* Vertical line — desktop only */}
            <div className="hidden md:block absolute left-3.25 top-0 bottom-0 w-0.5 bg-[#e5e5e3]" />

            <div className="flex flex-col gap-10">
              {experience.map((exp, i) => (
                <motion.div
                  key={i}
                  className="relative group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, ease, delay: i * 0.1 }}
                >
                  {/* Timeline dot — desktop only */}
                  <div className="hidden md:block absolute left-1.75 top-10 w-3 h-3 rounded-full bg-accent border-4 border-cream z-10 transition-transform duration-300 group-hover:scale-125" />

                  {/* Card — offset right of line on desktop */}
                  <div className="md:ml-13 bg-white rounded-2xl border border-black/6 p-8 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300">
                    {/* Top row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-1">
                      <div>
                        <h3 className="font-sora text-[22px] font-bold text-ink tracking-[-0.5px]">{exp.role}</h3>
                        <p className="text-[15px] text-accent font-semibold mt-1">{exp.company} — {exp.location}</p>
                      </div>
                      <span className="shrink-0 self-start px-5 py-2 rounded-full bg-[#f5f5f3] dark:bg-[#222] text-[12px] font-semibold text-[#777] font-code whitespace-nowrap">{exp.period}</span>
                    </div>

                    {/* Separator */}
                    <div className="border-t border-[#f0f0ee] my-5" />

                    {/* Highlights — 2-column grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {exp.highlights.map((h, hi) => (
                        <div key={hi} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                          </div>
                          <span className="text-[14px] text-[#555] leading-[1.6]">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── SERVICES ────────────────────────────────────────────────────── */}
      <section id="services" className="py-[120px] px-[clamp(20px,5vw,80px)]">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          className="max-w-[1280px] mx-auto">
          <div className={sectionLabel}>What I Offer</div>
          <h2 className={`${sectionTitle} mb-[60px]`}>
            Services <span className="text-accent">I Provide</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {services.map(({ Icon, title, desc }, i) => (
              <motion.div key={i}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4, ease }}
                className="p-9 rounded-[20px] bg-white border border-black/[0.06] hover:border-ink hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500"
              >
                <Icon size={38} className="text-accent mb-5" />
                <h3 className="font-sora text-[18px] font-bold mb-3 text-ink tracking-[-0.3px]">{title}</h3>
                <p className="text-[15px] leading-[1.7] text-[#777]">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── CONTACT ─────────────────────────────────────────────────────── */}
      <section id="contact" className="py-[120px] px-[clamp(20px,5vw,80px)] bg-white">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px]">
            <div>
              <div className={sectionLabel}>Get in Touch</div>
              <h2 className={`${sectionTitle} mb-6`}>
                Let's build<br />something <span className="text-accent">amazing</span>
              </h2>
              <p className="text-[16px] leading-[1.8] text-[#777] mb-10 max-w-[400px]">
                Have a project in mind? Let's discuss how I can help bring your vision to life with clean code and stunning interfaces.
              </p>
              <div className="flex flex-col gap-5">
                {contactItems.map(({ Icon, label, value, href }, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[14px] bg-[#ecfdf5] flex items-center justify-center shrink-0">
                      <Icon size={20} className="text-accent" />
                    </div>
                    <div>
                      <div className="text-[11px] text-[#999] font-bold tracking-[1.5px] uppercase mb-0.5">{label}</div>
                      {href ? (
                        <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                          className="text-ink font-semibold text-[15px] no-underline hover:text-accent transition-colors">{value}</a>
                      ) : (
                        <span className="text-ink font-semibold text-[15px]">{value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label className="text-[14px] font-semibold text-[#444] mb-2 block">Your Name</label>
                <input className={inputCls} placeholder="John Doe"
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="text-[14px] font-semibold text-[#444] mb-2 block">Email Address</label>
                <input type="email" className={inputCls} placeholder="john@example.com"
                  value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <label className="text-[14px] font-semibold text-[#444] mb-2 block">Your Message</label>
                <textarea rows={5} className={`${inputCls} resize-y`} placeholder="Tell me about your project..."
                  value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
              </div>
              <button disabled={sending} onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-2.5 px-9 py-4 bg-ink text-cream rounded-full text-[14px] font-semibold hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(0,0,0,0.2)] hover:bg-[#333] transition-all duration-500 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none mt-2">
                {sending ? (
                  <><span className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                ) : (
                  <>Send Message <ArrowRight size={18} /></>
                )}
              </button>

              <AnimatePresence>
                {sendStatus === "success" && (
                  <motion.div key="success" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="px-5 py-3.5 rounded-[14px] bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0] text-[14px] font-semibold text-center font-body">
                    ✅ Message sent successfully! I'll get back to you soon.
                  </motion.div>
                )}
                {sendStatus === "error" && (
                  <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="px-5 py-3.5 rounded-[14px] bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] text-[14px] font-semibold text-center font-body">
                    ❌ Something went wrong. Please try again or email me directly.
                  </motion.div>
                )}
                {sendStatus === "empty" && (
                  <motion.div key="empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="px-5 py-3.5 rounded-[14px] bg-[#fffbeb] text-[#d97706] border border-[#fde68a] text-[14px] font-semibold text-center font-body">
                    ⚠️ Please fill in all fields before sending.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="py-10 px-[clamp(20px,5vw,80px)] border-t border-[#eee] bg-cream">
        <div className="max-w-[1280px] mx-auto flex justify-between items-center flex-wrap gap-4">
          <div className="font-sora font-extrabold text-[20px] tracking-[-1.5px]">
            MI<span className="text-accent">.</span>
          </div>
          <p className="text-[13px] text-[#999]">© 2026 Muhammad Ibrahim. Crafted with precision.</p>
          <div className="flex gap-6">
            <a href="https://www.linkedin.com/in/muhammad-ibrahim-933172222/" target="_blank" rel="noopener noreferrer"
              className="text-[13px] text-[#999] no-underline hover:text-ink transition-colors">LinkedIn</a>
            <a href="mailto:laftan033@gmail.com"
              className="text-[13px] text-[#999] no-underline hover:text-ink transition-colors">Email</a>
          </div>
        </div>
      </footer>

      {/* ── CHATBOT ─────────────────────────────────────────────────────── */}
      <ChatBot />

      {/* ── SCROLL TO TOP ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {scrollY > 500 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{ duration: 0.3, ease }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-997 w-12 h-12 rounded-full bg-ink text-cream flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:bg-accent hover:scale-110 hover:shadow-[0_12px_40px_rgba(16,185,129,0.3)] transition-all duration-300 cursor-pointer"
          >
            <ChevronUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Portfolio;
