import { motion, AnimatePresence } from "motion/react";
import { Utensils, Clock, MapPin, Phone, Instagram, Facebook, ChevronRight, ShieldCheck, Car, Truck, Wind, Sparkles, User, Mail, Leaf, Flame, X, MessageSquare, Send, Loader2, ShoppingBag, Plus, Minus, CheckCircle, CreditCard, Wallet, Smartphone, Timer, Bike, Star, Ticket, Gift, Tags } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/src/lib/utils";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const FOOD_IMAGES = {
  morning: [
    { id: 'idly', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', label: 'Soft Idly' },
    { id: 'dosa', url: 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&q=80', label: 'Crispy Dosa' },
    { id: 'medu vadai', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80', label: 'Medu Vadai' },
    { id: 'pongal', url: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=800&q=80', label: 'Traditional Pongal' },
  ],
  evening: [
    { id: 'white rice', url: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=800&q=80', label: 'White Rice' },
    { id: 'chicken mutton', url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80', label: 'Chicken / Mutton' },
    { id: 'fish', url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80', label: 'Fish Fry' },
    { id: 'parotta', url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80', label: 'Malabar Parotta' },
  ]
};

const FACILITIES = [
  { icon: ShieldCheck, title: "Hygienic & Clean", desc: "Strict quality standards in our kitchen.", color: "text-blue-500" },
  { icon: Sparkles, title: "Neat & Tidy", desc: "A pleasant dining environment for families.", color: "text-turmeric" },
  { icon: Car, title: "Parking Facility", desc: "Ample space for your vehicles.", color: "text-clay" },
  { icon: Truck, title: "Home Delivery", desc: "Hot food delivered to your doorstep.", color: "text-terracotta" },
  { icon: Wind, title: "A/C & Non-A/C", desc: "Choose your comfort sector.", color: "text-banana-leaf" },
];

const REVIEWS = [
  { id: 1, name: "Logesh", rating: 5, text: "Super taste! Authentic ah irukku", date: "2 days ago" },
  { id: 2, name: "Kumar", rating: 4, text: "Fast delivery 🔥", date: "1 week ago" },
  { id: 3, name: "Ramya", rating: 5, text: "Traditional clay pot cooking is unique and healthy.", date: "3 days ago" },
  { id: 4, name: "Sathish", rating: 5, text: "Hygienic and very natural taste. Loved the fish curry!", date: "Yesterday" }
];

const OFFERS = [
  { 
    id: 1, 
    title: "Chithirai Festival Celebration", 
    desc: "First Order – 10% OFF", 
    code: "SIVA10", 
    icon: Ticket,
    color: "bg-terracotta/10 text-terracotta",
    border: "border-terracotta/20"
  },
  { 
    id: 2, 
    title: "Temple City Special", 
    desc: "🍗 Combo Offer – Save ₹50", 
    code: "COMBO50", 
    icon: Gift,
    color: "bg-turmeric/10 text-turmeric",
    border: "border-turmeric/20"
  },
  { 
    id: 3, 
    title: "Puthandu Delivery", 
    desc: "🚚 Free Delivery above ₹299", 
    code: "FREEDEL", 
    icon: Truck,
    color: "bg-banana-leaf/10 text-banana-leaf",
    border: "border-banana-leaf/20"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning');
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [cart, setCart] = useState<{ id: string, name: string, price: number, quantity: number, image: string }[]>([]);
  const [orderStep, setOrderStep] = useState<'menu' | 'form' | 'tracking'>('menu');
  const [orderStatus, setOrderStatus] = useState<'confirmed' | 'preparing' | 'delivery' | 'delivered'>('confirmed');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Hi 👋 Need help? I can help you with our menu, location, or facilities!' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [locationError, setLocationError] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'upi' | 'cod' | 'card'>('cod');
  const [userRating, setUserRating] = useState(0);
  const [isRated, setIsRated] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const addToCart = (item: { id: string, name: string, price: number, image: string }) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const DELIVERY_MENU = {
    southIndian: [
      { id: 'd-idly', name: 'Soft Idly (2pcs)', price: 14, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80' },
      { id: 'd-dosa', name: 'Ghee Roast Dosa', price: 30, image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=400&q=80' },
      { id: 'd-vadai', name: 'Medu Vadai', price: 10, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80' },
      { id: 'd-pongal', name: 'Ven Pongal', price: 40, image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=400&q=80' },
    ],
    nonVeg: [
      { id: 'd-rice', name: 'White Rice', price: 80, image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=400&q=80' },
      { id: 'd-curry', name: 'Chicken / Mutton', price: 80, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80' },
      { id: 'd-fish', name: 'Fish Fry', price: 50, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80' },
      { id: 'd-parotta', name: 'Malabar Parotta', price: 12, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=80' },
    ]
  };
  const handleUPIPayment = () => {
    // UPI Deep Link Format: upi://pay?pa=<VPA>&pn=<Name>&am=<Amount>&cu=INR
    // For most UPI apps, <number>@upi is a common default, but we'll use a clean format
    const vpa = "8428241254@upi"; // Common UPI format for phone numbers
    const name = encodeURIComponent("SIVA MANPAANAI UNAVAGAM");
    const amount = cartTotal.toString();
    const note = encodeURIComponent("Order from Siva Manpaanai");
    const upiUrl = `upi://pay?pa=${vpa}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;
    
    window.location.href = upiUrl;
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = userInput.trim();
    setUserInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      console.log("Chatbot: Sending message...", { hasKey: !!process.env.GEMINI_API_KEY });
      
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'undefined') {
        throw new Error("GEMINI_API_KEY is missing or invalid.");
      }

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: userMessage,
        config: {
          systemInstruction: `You are a helpful AI assistant for "SIVA MANPAANAI UNAVAGAM", a traditional clay pot restaurant in Dindigul. 
          Address: SALAIPUDHUR VATHALAGUNDU road, DINDIGUL. 
          Contact: 8428241254.
          Owner: Siva.
          Designer: Muruga Pandi Logesh.
          Specialty: Clay pot cooking, hygienic, organic, traditional taste.
          Morning Menu: Idly (RS.7), Dosa (RS.30), Medu Vadai (RS.10), Pongal (RS.40).
          Evening Menu: White Rice (RS.80), Chicken/Mutton (RS.80), Fish (RS.50), Parotta (RS.12).
          Offers: 1. 10% OFF on first order (Code: SIVA10), 2. Save RS.50 on Combo/Family packs (Code: COMBO50), 3. Free Delivery above RS.299 (Code: FREEDEL).
          Facilities: Hygienic kitchen, Parking, Home Delivery, A/C & Non-A/C.
          Keep answers short, professional, and friendly. Use emojis where appropriate.`,
        }
      });

      const aiText = response.text || "I'm sorry, I couldn't understand that. How else can I help you?";
      setChatMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
      console.error("Chatbot Connection Error Details:", error);
      let errorMessage = "Sorry, I'm having trouble connecting right now. Please try again later!";
      
      if (error instanceof Error) {
        if (error.message.includes("API_KEY")) {
          errorMessage = "Chatbot is currently unavailable (API Key missing). Please check settings.";
        } else if (error.message.includes("model")) {
          errorMessage = "Chatbot is having trouble with the AI model. Please try again later.";
        }
      }
      
      setChatMessages(prev => [...prev, { role: 'ai', text: errorMessage }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Reset selected food when tab changes
  useEffect(() => {
    setSelectedFoodId(FOOD_IMAGES[activeTab][0].id);
  }, [activeTab]);

  const currentMenu = activeTab === 'morning' ? [
    { id: 'idly', name: 'Idly', price: 'RS.7', desc: 'Hygienically steamed, served in clay bowls.', ingredients: ['Rice', 'Urad Dal', 'Clay Pot Water'] },
    { id: 'dosa', name: 'Dosa', price: 'RS.30', desc: 'Golden crispy, made with premium ghee.', ingredients: ['Fermented Batter', 'Ghee', 'Ginger'] },
    { id: 'medu vadai', name: 'Medu Vadai', price: 'RS.10', desc: 'Freshly fried, light and crunchy.', ingredients: ['Black Gram', 'Pepper', 'Curry Leaves'] },
    { id: 'pongal', name: 'PONGAL', price: 'RS.40', desc: 'Traditional clay pot pongal.', ingredients: ['Moong Dal', 'Pepper', 'Cumin', 'Ghee'] },
  ] : [
    { id: 'white rice', name: 'White Rice', price: 'RS.80', desc: 'Our specialty, slow-cooked to perfection.', ingredients: ['Basmati Rice', 'Clay Pot Steam'] },
    { id: 'chicken mutton', name: 'Chicken Mutton', price: 'RS.80', desc: 'Spicy and tender meat curry.', ingredients: ['Country Chicken', 'Hand-ground Spices'] },
    { id: 'fish', name: 'Fish', price: 'RS.50', desc: 'Fresh catch, marinated in secret spices.', ingredients: ['Sea Fish', 'Chilli', 'Turmeric'] },
    { id: 'parotta', name: 'Parotta', price: 'RS.12', desc: 'Layered, flaky, and absolutely clean.', ingredients: ['Wheat Flour', 'Oil', 'Love'] },
  ];

  const galleryImages = [
    ...FOOD_IMAGES[activeTab].filter(img => img.id === selectedFoodId),
    ...FOOD_IMAGES[activeTab].filter(img => img.id !== selectedFoodId)
  ].slice(0, 4);

  return (
    <div className="min-h-screen selection:bg-terracotta selection:text-white overflow-x-hidden bg-vibrant-mesh">
      <AnimatePresence mode="wait">
        {!isLoaded ? (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-clay flex flex-col items-center justify-center text-white"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute -inset-8 bg-terracotta/20 rounded-full blur-2xl animate-pulse" />
              <img 
                src="/siva_image.jpg.jpeg" 
                alt="Siva Owner" 
                className="w-32 h-32 rounded-full border-4 border-turmeric shadow-2xl relative z-10 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=200&q=80";
                }}
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-8 text-center space-y-4"
            >
              <h2 className="font-display text-4xl font-black tracking-tighter">SIVA MANPAANAI</h2>
              <div className="flex items-center justify-center gap-2">
                <Leaf className="w-4 h-4 text-banana-leaf animate-bounce" />
                <p className="font-tamil text-lg font-bold text-turmeric/90 italic tracking-wide">
                  "சுவையில் பாரம்பரியம், ஆரோக்கியத்தில் உறுதி"
                </p>
                <Flame className="w-4 h-4 text-terracotta animate-pulse" />
              </div>
            </motion.div>
            <div className="mt-12 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="w-full h-full bg-turmeric"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-terracotta/10 shadow-lg shadow-clay/5">
              <div className="max-w-7xl mx-auto px-4 h-36 md:h-44 flex items-center justify-between">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-5 md:gap-8"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 260, 
                      damping: 20, 
                      delay: 0.5 
                    }}
                    className="relative shrink-0"
                  >
                    {/* Glowing Ring - Enhanced */}
                    <div className="absolute -inset-3 bg-gradient-to-r from-terracotta via-turmeric to-banana-leaf rounded-full blur-md opacity-80 animate-pulse" />
                    <div className="absolute -inset-1 bg-white rounded-full" />
                    
                    {/* Circular Image Container - Larger */}
                    <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-full border-[6px] border-white shadow-2xl overflow-hidden bg-clay/5 flex items-center justify-center ring-4 ring-terracotta/10">
                      <img 
                        src="/siva_image.jpg.jpeg" 
                        alt="Siva Owner" 
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                          if (fallback) (fallback as HTMLElement).style.display = 'flex';
                        }}
                        referrerPolicy="no-referrer"
                      />
                      <div className="fallback-icon hidden w-full h-full items-center justify-center bg-clay/10">
                        <User className="w-12 h-12 md:w-20 md:h-20 text-clay/30" />
                      </div>
                    </div>
                    
                    {/* Verification Badge - Larger */}
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 md:p-1.5 rounded-full border-4 border-white shadow-xl">
                      <svg className="w-4 h-4 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                    </div>
                  </motion.div>

                  <div className="flex flex-col">
                    <h1 className="font-display text-3xl md:text-7xl font-black tracking-tighter leading-none text-gradient-colorful py-1">
                      SIVA MANPAANAI UNAVAGAM
                    </h1>
                    <span className="font-tamil text-sm md:text-2xl font-bold text-clay/70 mt-1 md:mt-2">
                      சிவா மண்பானை உணவகம்
                    </span>
                  </div>
                </motion.div>
                <nav className="hidden lg:flex items-center gap-8 font-bold text-xs uppercase tracking-[0.2em] text-clay/80">
                  <a href="#menu" className="hover:text-terracotta transition-colors">Menu</a>
                  <a href="#facilities" className="hover:text-terracotta transition-colors">Facilities</a>
                  <a href="tel:8428241254" className="flex items-center gap-2 hover:text-terracotta transition-colors group">
                    <Phone className="w-4 h-4 group-hover:animate-bounce" />
                    8428241254
                  </a>
                  <button 
                    onClick={() => setIsDeliveryOpen(true)}
                    className="bg-gradient-to-r from-terracotta to-clay text-white px-8 py-3 rounded-2xl hover:scale-105 transition-all shadow-xl shadow-terracotta/20 font-black"
                  >
                    ORDER NOW
                  </button>
                </nav>
              </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
              {/* Left Side: Content */}
              <div className="lg:col-span-7 space-y-20">
                <section className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <span className="h-px w-12 bg-terracotta" />
                      <span className="text-terracotta font-black text-xs uppercase tracking-[0.3em]">Premium Clay Pot Dining</span>
                    </div>
                    <h2 className="text-6xl md:text-8xl font-display font-black leading-[0.85] text-clay tracking-tighter">
                      The Heart of <br />
                      <span className="text-gradient-colorful italic">Dindigul's</span> Taste
                    </h2>
                    <p className="text-xl text-clay/70 max-w-xl mt-8 leading-relaxed font-medium">
                      Located at <span className="bg-turmeric/20 text-clay font-black px-2 py-1 rounded-lg border border-turmeric/10">SALAIPUDHUR VATHALAGUNDU road, DINDIGUL</span>. 
                      We bring you the finest clay pot delicacies in a clean, hygienic, and family-friendly atmosphere.
                    </p>
                  </motion.div>

                  <div className="flex flex-wrap gap-4 pt-4">
                    <motion.a 
                      href="tel:8428241254"
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-3 text-sm font-bold text-clay bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl border border-clay/5 shadow-lg shadow-clay/5"
                    >
                      <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-terracotta" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-clay/40">Call Us</p>
                        <p>8428241254</p>
                      </div>
                    </motion.a>
                    <motion.a 
                      href="https://maps.app.goo.gl/JD9UHaWFegpqwjCE8"
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-3 text-sm font-bold text-clay bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl border border-clay/5 shadow-lg shadow-clay/5 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-banana-leaf/10 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-banana-leaf" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-clay/40">Our Location</p>
                        <p>SALAIPUDHUR, DINDIGUL</p>
                      </div>
                    </motion.a>
                    <motion.button 
                      onClick={() => setIsDeliveryOpen(true)}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-3 text-sm font-bold text-white bg-terracotta px-8 py-4 rounded-2xl shadow-xl shadow-terracotta/20"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      ORDER NOW
                    </motion.button>
                  </div>
                </section>

                {/* Facilities Grid */}
                <section id="facilities" className="space-y-10">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-display font-black text-clay">World-Class Facilities</h3>
                    <p className="text-clay/50 font-medium">We prioritize your comfort and health above all else.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {FACILITIES.map((f, i) => (
                      <motion.div
                        key={f.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="p-8 bg-white/40 backdrop-blur-sm rounded-[32px] border border-white/50 shadow-xl shadow-clay/5 hover:bg-white transition-all group"
                      >
                        <f.icon className={cn("w-10 h-10 mb-4 transition-transform group-hover:scale-110", f.color)} />
                        <h4 className="text-lg font-bold text-clay mb-2">{f.title}</h4>
                        <p className="text-sm text-clay/60 leading-relaxed font-medium">{f.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* Festive Offers Section */}
                <section className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-turmeric/5 -skew-y-3 transform origin-left" />
                  <div className="relative space-y-10 py-12 px-2">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-terracotta/10 text-terracotta rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
                          <Sparkles className="w-3 h-3" />
                          Festive Specials
                        </div>
                        <h3 className="text-3xl font-display font-black text-clay">Chithirai Festival Offers</h3>
                        <p className="text-clay/50 font-medium italic">Celebrate the spirit of Madurai with these exclusive deals!</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {OFFERS.map((offer, i) => (
                        <motion.div
                          key={offer.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className={cn(
                            "group relative p-8 rounded-[40px] border shadow-2xl shadow-clay/5 flex flex-col items-center text-center gap-4 transition-all hover:-translate-y-2",
                            "bg-white/80 backdrop-blur-md",
                            offer.border
                          )}
                        >
                          <div className={cn("p-4 rounded-3xl", offer.color)}>
                            <offer.icon className="w-8 h-8" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-clay/40">{offer.title}</p>
                            <h4 className="text-xl font-display font-black text-clay tracking-tight">{offer.desc}</h4>
                          </div>
                          <div className="px-6 py-2 bg-clay/5 rounded-2xl border border-dashed border-clay/20 flex items-center gap-2 group-hover:border-clay/40 transition-colors">
                            <Tags className="w-3 h-3 text-clay/40" />
                            <span className="text-xs font-black text-clay/80 tracking-widest uppercase">{offer.code}</span>
                          </div>
                          
                          {/* Festive Decoration */}
                          <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-30 transition-opacity">
                            <Leaf className="w-6 h-6 rotate-45 text-banana-leaf" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Menu Section */}
                <section id="menu" className="space-y-12">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-clay/10 pb-8">
                    <div className="space-y-2">
                      <h3 className="text-4xl font-display font-black text-clay">Our Signature Menu</h3>
                      <p className="text-clay/50 font-medium">Handcrafted with love in traditional clay pots.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-clay/5 p-1.5 rounded-2xl">
                      <button
                        onClick={() => setActiveTab('morning')}
                        className={cn(
                          "px-6 py-3 rounded-xl text-sm font-black transition-all",
                          activeTab === 'morning' ? "bg-white text-terracotta shadow-lg shadow-terracotta/10" : "text-clay/40 hover:text-clay"
                        )}
                      >
                        MORNING
                      </button>
                      <button
                        onClick={() => setActiveTab('evening')}
                        className={cn(
                          "px-6 py-3 rounded-xl text-sm font-black transition-all",
                          activeTab === 'evening' ? "bg-white text-terracotta shadow-lg shadow-terracotta/10" : "text-clay/40 hover:text-clay"
                        )}
                      >
                        EVENING
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <AnimatePresence mode="wait">
                      {currentMenu.map((item, i) => (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: i * 0.1 }}
                          onClick={() => setSelectedFoodId(item.id)}
                          className={cn(
                            "p-8 bg-white rounded-[40px] border transition-all group cursor-pointer",
                            selectedFoodId === item.id ? "border-terracotta shadow-terracotta/20 shadow-2xl" : "border-clay/5 shadow-2xl shadow-clay/5 hover:shadow-terracotta/10"
                          )}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-black text-xl text-clay group-hover:text-terracotta transition-colors">{item.name}</h4>
                            <span className="font-display font-black text-terracotta bg-terracotta/5 px-4 py-1 rounded-full text-sm">{item.price}</span>
                          </div>
                          <p className="text-sm text-clay/60 leading-relaxed font-medium mb-4">{item.desc}</p>
                          <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-clay/30">Ingredients (Click to view)</p>
                            <div className="flex flex-wrap gap-2">
                              {item.ingredients.map((ing) => (
                                <button
                                  key={ing}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedFoodId(item.id);
                                  }}
                                  className="text-[10px] bg-clay/5 hover:bg-terracotta hover:text-white px-2 py-1 rounded-md transition-colors font-bold"
                                >
                                  {ing}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </section>

                {/* Customer Reviews Section */}
                <section className="space-y-12">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-display font-black text-clay text-gradient-colorful inline-block">Customer Love</h3>
                    <p className="text-clay/50 font-medium">Hear what our foodies have to say.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {REVIEWS.map((review, i) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="p-8 bg-white/60 backdrop-blur-md rounded-[32px] border border-white shadow-xl shadow-clay/5 flex flex-col gap-4 group hover:bg-white transition-all cursor-default"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex gap-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-turmeric text-turmeric" />
                            ))}
                            {[...Array(5 - review.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-clay/10" />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-clay/30 uppercase tracking-widest">{review.date}</span>
                        </div>
                        <p className="text-clay/80 font-bold italic leading-relaxed text-sm">
                          "{review.text}"
                        </p>
                        <div className="flex items-center gap-3 pt-4 mt-auto border-t border-clay/5">
                          <div className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center font-black text-terracotta text-[10px]">
                            {review.name[0]}
                          </div>
                          <p className="text-[11px] font-black text-clay uppercase tracking-wider">{review.name}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Side: Image Gallery */}
              <div className="lg:col-span-5 relative">
                <div className="lg:sticky lg:top-32 space-y-12">
                  <div className="relative group">
                    <div className="absolute -inset-12 bg-gradient-to-br from-turmeric/40 via-terracotta/30 to-banana-leaf/30 rounded-[80px] blur-3xl group-hover:opacity-100 transition-opacity opacity-60 animate-pulse" />
                    <div className="relative grid grid-cols-2 gap-8">
                      <AnimatePresence mode="popLayout">
                        {galleryImages.map((img, i) => (
                          <motion.div
                            key={img.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8, y: 40, rotate: i % 2 === 0 ? -4 : 4 }}
                            animate={{ opacity: 1, scale: 1, y: 0, rotate: i % 2 === 0 ? -4 : 4 }}
                            exit={{ opacity: 0, scale: 0.8, y: -40 }}
                            transition={{ 
                              type: "spring",
                              stiffness: 200,
                              damping: 25,
                            }}
                            className={cn(
                              "relative aspect-[4/5] rounded-[48px] overflow-hidden shadow-2xl border-[8px] border-white group/img",
                              i === 0 && "col-span-2 aspect-[16/11]"
                            )}
                          >
                            <img
                              src={img.url}
                              alt={img.label}
                              className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-1000 ease-out"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-10">
                              <span className="text-white font-display text-2xl font-black tracking-tight leading-none mb-2">{img.label}</span>
                              <span className="text-white/70 text-xs font-black uppercase tracking-[0.2em]">Siva Manpaanai Heritage</span>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Floating Badge */}
                  <motion.div
                    animate={{ 
                      y: [0, -20, 0],
                      rotate: [0, 8, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -right-8 top-1/2 -translate-y-1/2 bg-gradient-to-br from-banana-leaf to-emerald-700 text-white p-10 rounded-full shadow-2xl shadow-banana-leaf/40 border-[8px] border-white z-20 hidden xl:flex flex-col items-center justify-center text-center"
                  >
                    <Utensils className="w-12 h-12 mb-2" />
                    <span className="text-[14px] font-black uppercase tracking-tighter leading-none">100% Organic</span>
                    <span className="text-[14px] font-black uppercase tracking-tighter leading-none">Clay Pot</span>
                  </motion.div>
                </div>
              </div>
            </main>

            {/* Footer */}
            <footer className="bg-clay text-white py-24 mt-32 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-terracotta via-turmeric to-banana-leaf" />
              <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
                <div className="space-y-8">
                  <h3 className="font-display text-3xl font-black text-gradient-colorful bg-white/10 p-2 inline-block rounded-lg">SIVA MANPAANAI</h3>
                  <div className="space-y-1">
                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-4">Web Designer</p>
                    <div className="flex items-center gap-6">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        className="relative group"
                      >
                        {/* Creative Animated Frame */}
                        <div className="absolute -inset-2 bg-gradient-to-tr from-turmeric via-white to-terracotta rounded-2xl opacity-40 group-hover:opacity-100 transition duration-500 animate-tilt" />
                        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
                          <img 
                            src="/logesh.jpeg" 
                            alt="Muruga Pandi Logesh" 
                            className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://picsum.photos/seed/designer/200/200";
                            }}
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-clay/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </motion.div>
                      <div>
                        <p className="font-cursive text-4xl text-turmeric drop-shadow-lg">Muruga Pandi Logesh</p>
                        <div className="flex flex-col gap-1 mt-1">
                          <a 
                            href="https://instagram.com/loxsh_07" 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[10px] text-white/30 font-bold hover:text-white transition-colors flex items-center gap-1"
                          >
                            <Instagram className="w-3 h-3" /> @loxsh_07
                          </a>
                          <a 
                            href="mailto:murugapandi4646@gmail.com" 
                            className="text-[10px] text-white/30 font-bold hover:text-white transition-colors flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" /> murugapandi4646@gmail.com
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-white/50 leading-relaxed font-medium">
                    Experience the authentic taste of Dindigul at <span className="bg-white/10 text-turmeric font-black px-2 py-1 rounded-lg">SALAIPUDHUR VATHALAGUNDU road</span>. 
                    Clean, hygienic, and traditionally cooked.
                  </p>
                  <div className="flex gap-6">
                    <a href="https://instagram.com/s.saran1997" target="_blank" rel="noreferrer" className="flex items-center gap-3 group">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-terracotta group-hover:scale-110 transition-all">
                        <Instagram className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-white/40">Hotel Instagram</p>
                        <p className="font-bold">s.saran1997</p>
                      </div>
                    </a>
                    <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-terracotta hover:scale-110 transition-all">
                      <Facebook className="w-6 h-6" />
                    </a>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <h4 className="font-display text-xl font-black uppercase tracking-widest">Quick Links</h4>
                  <ul className="space-y-4 text-white/50 font-bold text-sm">
                    <li><a href="#menu" className="hover:text-terracotta transition-colors">OUR MENU</a></li>
                    <li><a href="#facilities" className="hover:text-terracotta transition-colors">FACILITIES</a></li>
                    <li><a href="tel:8428241254" className="hover:text-white transition-colors">CALL US</a></li>
                    <li><a href="https://maps.app.goo.gl/JD9UHaWFegpqwjCE8" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LOCATION</a></li>
                  </ul>
                </div>

                <div className="space-y-8">
                  <h4 className="font-display text-xl font-black uppercase tracking-widest">Visit Us</h4>
                  <div className="space-y-4 text-white/50 font-medium">
                    <a 
                      href="https://maps.app.goo.gl/JD9UHaWFegpqwjCE8" 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-start gap-3 group/loc hover:text-white transition-colors"
                    >
                      <MapPin className="w-5 h-5 text-terracotta shrink-0 group-hover/loc:animate-bounce" />
                      <p className="text-turmeric font-black bg-white/5 px-2 py-1 rounded-lg">SALAIPUDHUR VATHALAGUNDU road, DINDIGUL</p>
                    </a>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-terracotta shrink-0" />
                      <p>+91 84282 41254</p>
                    </div>
                  </div>

                  {/* Creative Frame for Screenshot - Moved here */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    onClick={() => setIsModalOpen(true)}
                    className="relative group shrink-0 cursor-pointer mt-8"
                  >
                    <div className="absolute -inset-4 bg-gradient-to-br from-terracotta/20 via-turmeric/20 to-banana-leaf/20 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative p-3 bg-white/5 backdrop-blur-md rounded-[32px] border border-white/10 shadow-2xl">
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-white/20">
                        <img 
                          src="/Screenshot 2026-04-13 171009.png" 
                          alt="Restaurant Highlight" 
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://picsum.photos/seed/restaurant/400/300";
                          }}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-clay/40 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30">
                            <Sparkles className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>
                      {/* Decorative Corner */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-turmeric rounded-tr-xl" />
                      <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-terracotta rounded-bl-xl" />
                    </div>
                  </motion.div>
                </div>
              </div>
              
              <div className="max-w-7xl mx-auto px-4 mt-24 pt-12 border-t border-white/5 flex flex-col items-center justify-center gap-8 text-center">
                <div className="flex-1">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="flex flex-col items-center gap-3 mb-8"
                  >
                    <div className="flex items-center gap-3">
                      <Leaf className="w-5 h-5 text-banana-leaf animate-bounce" />
                      <p className="text-xl md:text-3xl font-tamil font-bold italic text-turmeric/80 tracking-wide">
                        "சுவையில் பாரம்பரியம், ஆரோக்கியத்தில் உறுதி"
                      </p>
                      <Flame className="w-5 h-5 text-terracotta animate-pulse" />
                    </div>
                    <div className="flex gap-2">
                      <Sparkles className="w-3 h-3 text-turmeric animate-spin-slow" />
                      <Sparkles className="w-3 h-3 text-banana-leaf animate-spin-slow" />
                    </div>
                  </motion.div>
                  <div className="text-white/20 text-xs font-black tracking-[0.4em] uppercase">
                    © 2024 Siva Manpaanai Unavagam • Traditionally Crafted
                  </div>
                </div>
              </div>
            </footer>

            {/* Food Delivery Section */}
            <AnimatePresence>
              {isDeliveryOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[400] bg-clay overflow-y-auto"
                >
                  {/* Delivery Header */}
                  <div className="sticky top-0 z-10 bg-clay/80 backdrop-blur-xl border-b border-white/5 p-6">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setIsDeliveryOpen(false)}
                          className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-white/50 hover:text-white"
                        >
                          <ChevronRight className="w-6 h-6 rotate-180" />
                        </button>
                        <div>
                          <h3 className="text-white font-black text-2xl tracking-tighter">Food Delivery</h3>
                          <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Siva Manpaanai Unavagam</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                          <p className="text-turmeric font-black text-sm">7:00 AM – 11:00 PM</p>
                          <p className="text-white/30 text-[10px] uppercase font-bold">Delivery Hours</p>
                        </div>
                        <button 
                          onClick={() => setOrderStep('menu')}
                          className="relative p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group"
                        >
                          <ShoppingBag className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                          {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-6 h-6 bg-terracotta text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-clay shadow-lg animate-bounce">
                              {cart.reduce((acc, i) => acc + i.quantity, 0)}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="relative max-w-7xl mx-auto px-4 py-12 space-y-20 pb-32">
                    {/* Background Attractive Text with Animation */}
                    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-[0.03]">
                      <motion.div 
                        animate={{ 
                          x: ["0%", "-50%"],
                        }}
                        transition={{ 
                          duration: 40, 
                          repeat: Infinity, 
                          ease: "linear" 
                        }}
                        className="flex whitespace-nowrap"
                      >
                        <h2 className="text-[18vw] font-black tracking-tighter text-white pr-20">
                          SIVA MANPAANAI UNAVAGAM
                        </h2>
                        <h2 className="text-[18vw] font-black tracking-tighter text-white pr-20">
                          SIVA MANPAANAI UNAVAGAM
                        </h2>
                      </motion.div>
                    </div>

                    {orderStep === 'menu' && (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-9 space-y-20">
                          {/* 1. Delivery Banner */}
                          <motion.section 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="relative rounded-[40px] overflow-hidden bg-gradient-to-br from-terracotta to-clay p-12 md:p-16 text-center md:text-left"
                          >
                            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                              <Utensils className="w-full h-full rotate-12" />
                            </div>
                            <div className="relative z-10 space-y-8 max-w-2xl">
                              <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
                              >
                                <Timer className="w-4 h-4 text-turmeric" />
                                <span className="text-white font-bold text-xs uppercase tracking-widest">Fast & Reliable</span>
                              </motion.div>
                              <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tighter">
                                Hot & Fresh Food <br />
                                <span className="text-turmeric">Delivered to Your Doorstep</span>
                              </h2>
                              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <button 
                                  onClick={() => {
                                    const el = document.getElementById('delivery-menu');
                                    el?.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  className="bg-white text-clay px-8 py-4 rounded-2xl font-black hover:scale-105 transition-all shadow-xl shadow-black/20"
                                >
                                  ORDER NOW
                                </button>
                                <button 
                                  onClick={() => setIsDeliveryOpen(false)}
                                  className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-black hover:bg-white/20 transition-all"
                                >
                                  VIEW MENU
                                </button>
                              </div>
                            </div>
                          </motion.section>

                          {/* 2. Why Order From Us */}
                          <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[
                              { icon: "👨🍳", title: "Freshly prepared", color: "bg-orange-500/10" },
                              { icon: "🚚", title: "Fast delivery", color: "bg-blue-500/10" },
                              { icon: "🌶️", title: "Custom spice", color: "bg-red-500/10" },
                              { icon: "🥡", title: "Hygienic packing", color: "bg-green-500/10" },
                              { icon: "🏨", title: "Hotel quality", color: "bg-purple-500/10" },
                            ].map((item, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={cn("p-4 rounded-3xl border border-white/5 flex flex-col items-center text-center gap-2", item.color)}
                              >
                                <span className="text-2xl">{item.icon}</span>
                                <p className="text-white/80 font-bold text-[10px] uppercase tracking-widest">{item.title}</p>
                              </motion.div>
                            ))}
                          </section>

                          {/* 3. Menu Categories */}
                          <section id="delivery-menu" className="space-y-20">
                            {/* South Indian */}
                            <div className="space-y-10">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-banana-leaf/20 flex items-center justify-center">
                                  <span className="text-2xl">🍛</span>
                                </div>
                                <h3 className="text-3xl font-black text-white tracking-tight">South Indian Specials</h3>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {DELIVERY_MENU.southIndian.map((item, i) => (
                                  <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group bg-white/5 rounded-[32px] overflow-hidden border border-white/5 hover:border-white/10 transition-all"
                                  >
                                    <div className="relative h-48 overflow-hidden">
                                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl font-black text-clay text-sm">
                                        RS.{item.price}
                                      </div>
                                    </div>
                                    <div className="p-6 space-y-4">
                                      <h4 className="text-white font-black text-lg tracking-tight">{item.name}</h4>
                                      <button 
                                        onClick={() => addToCart(item)}
                                        className="w-full bg-white/5 hover:bg-terracotta text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group/btn"
                                      >
                                        <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
                                        ADD TO CART
                                      </button>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>

                            {/* Non-Veg Specials */}
                            <div className="space-y-10">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-terracotta/20 flex items-center justify-center">
                                  <span className="text-2xl">🍗</span>
                                </div>
                                <h3 className="text-3xl font-black text-white tracking-tight">Non-Veg Specials</h3>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {DELIVERY_MENU.nonVeg.map((item, i) => (
                                  <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group bg-white/5 rounded-[32px] overflow-hidden border border-white/5 hover:border-white/10 transition-all"
                                  >
                                    <div className="relative h-48 overflow-hidden">
                                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl font-black text-clay text-sm">
                                        RS.{item.price}
                                      </div>
                                    </div>
                                    <div className="p-6 space-y-4">
                                      <h4 className="text-white font-black text-lg tracking-tight">{item.name}</h4>
                                      <button 
                                        onClick={() => addToCart(item)}
                                        className="w-full bg-white/5 hover:bg-terracotta text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group/btn"
                                      >
                                        <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
                                        ADD TO CART
                                      </button>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </section>

                          {/* 6. Delivery Areas */}
                          <section className="bg-white/5 rounded-[40px] p-12 border border-white/5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                              <div className="space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-turmeric/20 flex items-center justify-center">
                                  <MapPin className="w-6 h-6 text-turmeric" />
                                </div>
                                <h4 className="text-white font-black text-xl">Delivery Areas</h4>
                                <p className="text-white/40 text-sm leading-relaxed">
                                  We cover all nearby areas within 10 KM of our restaurant.
                                </p>
                              </div>
                              <div className="space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-banana-leaf/20 flex items-center justify-center">
                                  <Bike className="w-6 h-6 text-banana-leaf" />
                                </div>
                                <h4 className="text-white font-black text-xl">Charges</h4>
                                <p className="text-white/40 text-sm leading-relaxed">
                                  <span className="text-banana-leaf font-bold">FREE DELIVERY</span> within 5 KM. <br />
                                  Nominal charge applies after 5 KM.
                                </p>
                              </div>
                              <div className="space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-terracotta/20 flex items-center justify-center">
                                  <Clock className="w-6 h-6 text-terracotta" />
                                </div>
                                <h4 className="text-white font-black text-xl">Delivery Time</h4>
                                <p className="text-white/40 text-sm leading-relaxed">
                                  Average delivery time: <br />
                                  <span className="text-white font-bold">20 – 35 mins</span>
                                </p>
                              </div>
                            </div>
                          </section>
                        </div>

                        {/* Right Side: Creative Owner Image */}
                        <div className="lg:col-span-3 sticky top-32 h-fit space-y-8 flex flex-col items-center">
                          <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative group w-full max-w-[280px]"
                          >
                            {/* Creative Animated Frame - Liquid Aura */}
                            <motion.div 
                              animate={{ 
                                borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 50% 60% 40% 60%", "40% 60% 70% 30% / 40% 50% 60% 50%"],
                                rotate: [0, 120, 240, 360]
                              }}
                              transition={{ 
                                duration: 15, 
                                repeat: Infinity, 
                                ease: "linear" 
                              }}
                              className="absolute -inset-4 bg-gradient-to-tr from-terracotta via-turmeric to-banana-leaf blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"
                            />
                            
                            {/* Creative Frame Shape */}
                            <div className="relative aspect-[4/5] rounded-[50px] overflow-hidden border-[8px] border-white/10 shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-700">
                              <img 
                                src="/siva_image.jpg.jpeg" 
                                alt="Siva Owner" 
                                className="w-full h-full object-cover scale-110 group-hover:scale-105 transition-transform duration-1000"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=800&q=80";
                                }}
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-clay via-transparent to-transparent opacity-80" />
                              <div className="absolute bottom-6 left-6 right-6">
                                <motion.div
                                  initial={{ y: 20, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{ delay: 0.5 }}
                                >
                                  <p className="text-turmeric font-black text-[8px] uppercase tracking-[0.4em] mb-2">Our Visionary</p>
                                  <h3 className="text-white text-xl font-black tracking-tighter">Siva</h3>
                                  <div className="h-0.5 w-8 bg-terracotta mt-2 mb-2" />
                                  <p className="text-white/70 text-[10px] font-medium leading-relaxed italic">
                                    "Bringing the authentic soul of Dindigul to your home."
                                  </p>
                                </motion.div>
                              </div>
                            </div>

                            {/* Floating Decorative Elements */}
                            <motion.div 
                              animate={{ 
                                y: [0, -10, 0],
                                rotate: [0, 10, -10, 0]
                              }}
                              transition={{ duration: 5, repeat: Infinity }}
                              className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-clay/5 z-20"
                            >
                              <Sparkles className="w-6 h-6 text-terracotta" />
                            </motion.div>
                          </motion.div>

                          <div className="bg-white/5 rounded-[32px] p-6 border border-white/5 space-y-4 w-full max-w-[280px]">
                            <h4 className="text-white font-black text-lg">Need Help?</h4>
                            <p className="text-white/40 text-xs leading-relaxed">
                              Call us directly for bulk orders or special requests.
                            </p>
                            <a 
                              href="tel:8428241254"
                              className="flex items-center gap-3 p-3 bg-terracotta rounded-xl text-white font-black text-sm hover:scale-105 transition-all"
                            >
                              <Phone className="w-5 h-5" />
                              8428241254
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {orderStep === 'form' && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12"
                      >
                        {/* Order Summary */}
                        <div className="space-y-8">
                          <h3 className="text-3xl font-black text-white tracking-tight">Order Summary</h3>
                          <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 space-y-6">
                            {cart.map(item => (
                              <div key={item.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl overflow-hidden">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                    <p className="text-white font-bold text-sm">{item.name}</p>
                                    <p className="text-white/30 text-xs">RS.{item.price} x {item.quantity}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button onClick={() => removeFromCart(item.id)} className="p-1 hover:text-terracotta text-white/30 transition-colors"><Minus className="w-4 h-4" /></button>
                                  <span className="text-white font-black text-sm">{item.quantity}</span>
                                  <button onClick={() => addToCart(item)} className="p-1 hover:text-banana-leaf text-white/30 transition-colors"><Plus className="w-4 h-4" /></button>
                                </div>
                              </div>
                            ))}
                            <div className="pt-6 border-t border-white/5 space-y-2">
                              <div className="flex justify-between text-white/40 text-sm">
                                <span>Subtotal</span>
                                <span>RS.{cartTotal}</span>
                              </div>
                              <div className="flex justify-between text-white/40 text-sm">
                                <span>Delivery Fee</span>
                                <span className="text-banana-leaf font-bold">FREE</span>
                              </div>
                              <div className="flex justify-between text-white font-black text-xl pt-4">
                                <span>Total</span>
                                <span className="text-turmeric">RS.{cartTotal}</span>
                              </div>
                            </div>
                          </div>

                          {/* 7. Payment Options */}
                          <div className="space-y-6">
                            <h4 className="text-white font-black text-xl">Payment Method</h4>
                            <div className="grid grid-cols-1 gap-4">
                              {[
                                { id: 'upi', icon: Smartphone, label: 'UPI (GPay / PhonePe / Paytm)', desc: 'Pay instantly via GPay' },
                                { id: 'cod', icon: Wallet, label: 'Cash on Delivery', desc: 'Pay when food arrives' },
                                { id: 'card', icon: CreditCard, label: 'Card Payment', desc: 'Visa / Mastercard' },
                              ].map(method => (
                                <button
                                  key={method.id}
                                  onClick={() => {
                                    // @ts-ignore
                                    setSelectedPayment(method.id);
                                    if (method.id === 'upi') handleUPIPayment();
                                  }}
                                  className={cn(
                                    "flex items-center gap-4 p-6 border rounded-2xl transition-all text-left group relative overflow-hidden",
                                    selectedPayment === method.id 
                                      ? "bg-terracotta/10 border-terracotta shadow-lg shadow-terracotta/5" 
                                      : "bg-white/5 border-white/5 hover:bg-white/10"
                                  )}
                                >
                                  <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                    selectedPayment === method.id ? "bg-terracotta" : "bg-white/5 group-hover:bg-terracotta"
                                  )}>
                                    <method.icon className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-white font-bold">{method.label}</p>
                                    <p className="text-white/30 text-xs">{method.desc}</p>
                                  </div>
                                  {selectedPayment === method.id && (
                                    <motion.div 
                                      layoutId="activePayment"
                                      className="absolute right-6 w-6 h-6 bg-terracotta rounded-full flex items-center justify-center shadow-lg"
                                    >
                                      <CheckCircle className="w-4 h-4 text-white" />
                                    </motion.div>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* 8. Order Form */}
                        <div className="space-y-8">
                          <h3 className="text-3xl font-black text-white tracking-tight">Delivery Details</h3>
                          <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 space-y-6">
                            <div className="space-y-2">
                              <label className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Customer Name</label>
                              <input 
                                type="text" 
                                placeholder="Your Name" 
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full bg-white/5 border-none rounded-2xl px-6 py-4 text-white font-medium focus:ring-2 focus:ring-terracotta/20 outline-none transition-all" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Phone Number</label>
                              <input 
                                type="tel" 
                                placeholder="Your Phone" 
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full bg-white/5 border-none rounded-2xl px-6 py-4 text-white font-medium focus:ring-2 focus:ring-terracotta/20 outline-none transition-all" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Delivery Address</label>
                              <motion.textarea 
                                rows={4} 
                                placeholder="Your Full Address" 
                                value={address}
                                onChange={(e) => {
                                  setAddress(e.target.value);
                                  if (locationError) setLocationError(false);
                                }}
                                animate={locationError ? { x: [-10, 10, -10, 10, 0] } : {}}
                                transition={{ duration: 0.4 }}
                                className={cn(
                                  "w-full bg-white/5 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 outline-none transition-all resize-none",
                                  locationError ? "text-red-500 ring-2 ring-red-500/50" : "text-white focus:ring-terracotta/20"
                                )} 
                              />
                              {locationError && (
                                <motion.p 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2"
                                >
                                  <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                                  Location exceeds 20-30KM delivery limit!
                                </motion.p>
                              )}
                            </div>
                            <button 
                              onClick={() => {
  if (!customerName || !phoneNumber || !address) {
    return;
  }

  const validKeywords = ['dindigul', 'vathalagundu', 'salaipudhur', 'vattalagundu', 'dindugal', 'dindigul road', 'vathalagundu road'];
  const isWithinRange = validKeywords.some(keyword => 
    address.toLowerCase().includes(keyword)
  );

  if (!isWithinRange) {
    setLocationError(true);
    return;
  }

  // ✅ WhatsApp message generate
  const orderLines = cart.map(item => 
    `• ${item.name} x${item.quantity} = RS.${item.price * item.quantity}`
  ).join('\n');

  const message = 
    `🍛 *New Order - Siva Manpaanai Unavagam*\n\n` +
    `👤 Name: ${customerName}\n` +
    `📞 Phone: ${phoneNumber}\n` +
    `📍 Address: ${address}\n\n` +
    `🛒 *Order Details:*\n${orderLines}\n\n` +
    `💰 *Total: RS.${cartTotal}*\n\n` +
    `⏰ Please confirm the order!`;

  const encodedMsg = encodeURIComponent(message);
  const restaurantNumber = '918428241254'; // 91 = India country code
  window.open(`https://wa.me/${restaurantNumber}?text=${encodedMsg}`, '_blank');

  // Proceed to tracking
  setOrderStep('tracking');
  setTimeout(() => setOrderStatus('preparing'), 3000);
  setTimeout(() => setOrderStatus('delivery'), 8000);
  setTimeout(() => setOrderStatus('delivered'), 15000);
}}
                              className="w-full bg-terracotta text-white py-5 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-terracotta/20"
                            >
                              PLACE ORDER
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {orderStep === 'tracking' && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl mx-auto text-center space-y-12"
                      >
                        <div className="relative inline-block">
                          <div className="absolute -inset-8 bg-banana-leaf/20 rounded-full blur-3xl animate-pulse" />
                          <div className="relative w-32 h-32 rounded-full bg-banana-leaf/20 flex items-center justify-center mx-auto">
                            <CheckCircle className="w-16 h-16 text-banana-leaf animate-bounce" />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-4xl font-black text-white tracking-tighter">Order Confirmed!</h3>
                          <p className="text-white/40 font-medium">Your delicious food is on the way.</p>
                        </div>

                        {/* 5. Live Order Tracking */}
                        <div className="bg-white/5 rounded-[40px] p-10 border border-white/5 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                            <motion.div 
                              initial={{ width: "0%" }}
                              animate={{ 
                                width: orderStatus === 'confirmed' ? '25%' : 
                                       orderStatus === 'preparing' ? '50%' : 
                                       orderStatus === 'delivery' ? '75%' : '100%' 
                              }}
                              className="h-full bg-banana-leaf transition-all duration-1000"
                            />
                          </div>
                          <div className="grid grid-cols-4 gap-4">
                            {[
                              { id: 'confirmed', label: 'Confirmed', icon: CheckCircle },
                              { id: 'preparing', label: 'Preparing', icon: Utensils },
                              { id: 'delivery', label: 'On Way', icon: Bike },
                              { id: 'delivered', label: 'Delivered', icon: ShoppingBag },
                            ].map((step, i) => {
                              const isActive = orderStatus === step.id;
                              const isPast = ['confirmed', 'preparing', 'delivery', 'delivered'].indexOf(orderStatus) >= i;
                              return (
                                <div key={step.id} className="space-y-4">
                                  <div className={cn(
                                    "w-12 h-12 rounded-2xl mx-auto flex items-center justify-center transition-all duration-500",
                                    isActive ? "bg-banana-leaf text-white scale-110 shadow-lg shadow-banana-leaf/20" : 
                                    isPast ? "bg-banana-leaf/20 text-banana-leaf" : "bg-white/5 text-white/20"
                                  )}>
                                    <step.icon className="w-6 h-6" />
                                  </div>
                                  <p className={cn(
                                    "text-[10px] uppercase font-black tracking-widest",
                                    isActive ? "text-white" : isPast ? "text-banana-leaf/60" : "text-white/10"
                                  )}>{step.label}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Customer Rating Section (Only shown after order is placed/delivered) */}
                        {orderStatus === 'delivered' && !isRated && (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/10 backdrop-blur-md rounded-[32px] p-8 border border-white/10 space-y-6"
                          >
                            <div className="space-y-2">
                              <h4 className="text-white font-black text-xl tracking-tight">Rate Your Experience</h4>
                              <p className="text-white/40 text-xs">How was your food and delivery?</p>
                            </div>
                            <div className="flex justify-center gap-3">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <motion.button
                                  key={star}
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => setUserRating(star)}
                                  className="p-1 focus:outline-none"
                                >
                                  <Star 
                                    className={cn(
                                      "w-10 h-10 transition-colors",
                                      star <= userRating ? "fill-turmeric text-turmeric" : "text-white/10"
                                    )} 
                                  />
                                </motion.button>
                              ))}
                            </div>
                            {userRating > 0 && (
                              <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => setIsRated(true)}
                                className="bg-terracotta text-white px-8 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-terracotta/20"
                              >
                                SUBMIT RATING
                              </motion.button>
                            )}
                          </motion.div>
                        )}

                        {isRated && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-banana-leaf/10 rounded-[32px] p-8 border border-banana-leaf/20"
                          >
                            <Sparkles className="w-8 h-8 text-banana-leaf mx-auto mb-4" />
                            <h4 className="text-banana-leaf font-black text-xl mb-2">Thank you for your feedback!</h4>
                            <p className="text-white/40 text-xs">We value your opinion and strive to improve our service.</p>
                          </motion.div>
                        )}

                        <button 
                          onClick={() => {
                            setIsDeliveryOpen(false);
                            setOrderStep('menu');
                            setCart([]);
                            setOrderStatus('confirmed');
                            setUserRating(0);
                            setIsRated(false);
                          }}
                          className="text-white/40 hover:text-white font-bold text-sm underline underline-offset-8 transition-colors"
                        >
                          Back to Home
                        </button>
                      </motion.div>
                    )}
                  </div>

                  {/* Floating Cart Bar */}
                  {cart.length > 0 && orderStep === 'menu' && (
                    <motion.div 
                      initial={{ y: 100 }}
                      animate={{ y: 0 }}
                      className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-50"
                    >
                      <div className="bg-white rounded-[32px] p-4 shadow-2xl flex items-center justify-between gap-6 border border-clay/5">
                        <div className="flex items-center gap-4 pl-4">
                          <div className="w-12 h-12 rounded-2xl bg-terracotta/10 flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-terracotta" />
                          </div>
                          <div>
                            <p className="text-clay font-black text-lg leading-none">RS.{cartTotal}</p>
                            <p className="text-clay/40 text-[10px] uppercase font-bold tracking-widest">{cart.length} Items in cart</p>
                          </div>
                          {cartTotal < 299 ? (
                            <div className="hidden md:flex flex-col gap-1 pr-4 border-l border-clay/5 pl-4">
                              <p className="text-[10px] font-black text-terracotta uppercase tracking-tighter shrink-0">Add RS.{299 - cartTotal} for FREE DELIVERY</p>
                              <div className="w-32 h-1 bg-clay/5 rounded-full overflow-hidden shrink-0">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(cartTotal / 299) * 100}%` }}
                                  className="h-full bg-banana-leaf"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="hidden md:flex flex-col gap-1 pr-4 border-l border-clay/5 pl-4">
                              <p className="text-[10px] font-black text-banana-leaf uppercase tracking-tighter">🎉 FREE DELIVERY APPLIED</p>
                              <div className="w-32 h-1 bg-banana-leaf rounded-full shrink-0" />
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => setOrderStep('form')}
                          className="bg-clay text-white px-10 py-4 rounded-2xl font-black hover:bg-terracotta transition-all flex items-center gap-3"
                        >
                          PROCEED TO CHECKOUT
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {isModalOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsModalOpen(false)}
                  className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
                >
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                  >
                    <X className="w-10 h-10" />
                  </motion.button>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative max-w-5xl w-full aspect-video rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl"
                  >
                    <img 
                      src="/Screenshot 2026-04-13 171009.png" 
                      alt="Full Screen Highlight" 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://picsum.photos/seed/restaurant/1200/800";
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Chatbot */}
            <div className="fixed bottom-6 right-6 z-[300]">
              <AnimatePresence>
                {isChatOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    className="absolute bottom-20 right-0 w-[320px] md:w-[380px] bg-white rounded-[32px] shadow-2xl border border-clay/10 overflow-hidden flex flex-col"
                  >
                    {/* Chat Header */}
                    <div className="bg-gradient-to-r from-terracotta to-clay p-6 text-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                          <Sparkles className="w-5 h-5 text-turmeric" />
                        </div>
                        <div>
                          <p className="font-black text-sm tracking-tight">Siva AI Assistant</p>
                          <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Online Now</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsChatOpen(false)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 h-[400px] overflow-y-auto p-6 space-y-4 bg-clay/5">
                      {chatMessages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                            "flex",
                            msg.role === 'user' ? "justify-end" : "justify-start"
                          )}
                        >
                          <div className={cn(
                            "max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-sm",
                            msg.role === 'user' 
                              ? "bg-terracotta text-white rounded-tr-none" 
                              : "bg-white text-clay rounded-tl-none"
                          )}>
                            {msg.text}
                          </div>
                        </motion.div>
                      ))}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white text-clay p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-terracotta" />
                            <span className="text-xs font-bold text-clay/40">Siva AI is typing...</span>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 bg-white border-t border-clay/5">
                      <div className="relative flex items-center gap-2">
                        <input 
                          type="text" 
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Ask me anything..."
                          className="w-full bg-clay/5 border-none rounded-2xl px-5 py-3 text-sm font-medium focus:ring-2 focus:ring-terracotta/20 outline-none transition-all"
                        />
                        <button 
                          onClick={handleSendMessage}
                          disabled={!userInput.trim() || isTyping}
                          className="p-3 bg-terracotta text-white rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg shadow-terracotta/20"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat Toggle Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500",
                  isChatOpen 
                    ? "bg-clay text-white rotate-90" 
                    : "bg-terracotta text-white hover:bg-clay"
                )}
              >
                {isChatOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
                {!isChatOpen && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-turmeric rounded-full border-2 border-white flex items-center justify-center"
                  >
                    <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                  </motion.div>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
