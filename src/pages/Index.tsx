// // src/pages/Index.tsx

// import React, { useState } from 'react'; // ⭐️ IMPORT useState ⭐️
// import { Leaf, ChevronRight, Smartphone, BarChart3, MessageSquareMore, Award, Target, Shield, CloudRain, CreditCard, Wrench, FlaskConical, TrendingUp, Bot } from 'lucide-react'; // ⭐️ IMPORT Bot ⭐️
// import { Link, useNavigate } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Layout } from '@/components/layout/Layout';
// import { useAuth } from '@/contexts/AuthContext';
// import { Tractor, Warehouse, TestTube, Users, Sprout, ArrowRight, Star } from 'lucide-react';
// import heroImage from '@/assets/hero-farm.jpg';
// import feature1Image from '@/assets/feature1.jpg';
// import feature2Image from '@/assets/feature2.jpg';
// import feature3Image from '@/assets/feature3.jpg';
// import { ChatBot } from '@/components/ChatBot';

// import Footer from '@/components/Footer';

// // IMPORTANT LINKS IMAGES (Assumed assets)
// import indiaGovLogo from '@/assets/india-gov-logo.png';
// import meityLogo from '@/assets/meity-logo.png';
// import azadiLogo from '@/assets/azadi-logo.png';
// import landResourcesLogo from '@/assets/land-resources-logo.png';
// import janSamarthLogo from '@/assets/jan-samarth-logo.png';

// // TESTIMONIAL AVATARS (Assumed assets)
// import avatarRavi from '@/assets/avatar-ravi.jpg';
// import avatarSunita from '@/assets/avatar-sunita.jpg';
// import avatarAmit from '@/assets/avatar-amit.jpg';
// import avatarPriya from '@/assets/avatar-priya.jpg';
// import avatarRajesh from '@/assets/avatar-rajesh.jpg';


// const Index: React.FC = () => {
//     const { t } = useTranslation();
//     const { user, isAdmin } = useAuth();
//     const navigate = useNavigate();

//     // ⭐️ ADD CHAT STATE HERE ⭐️
//     const [isChatOpen, setIsChatOpen] = useState(false);

//     // ✅ CORRECTED: Define Feature Data with raw translation keys (titleKey, descriptionKey).
//     const features = [
//         { icon: Tractor, titleKey: 'tools.title', descriptionKey: 'tools.subtitle', image: feature1Image, link: '/tools' },
//         { icon: Warehouse, titleKey: 'warehouse.title', descriptionKey: 'warehouse.subtitle', image: feature2Image, link: '/warehouse' },
//         { icon: TestTube, titleKey: 'soil.title', descriptionKey: 'soil.subtitle', image: feature3Image, link: '/soil-check' }
//     ];

//     // ✅ NEW: Define Testimonial Data using only raw translation keys.
//     const rawTestimonialData = [
//         // Keys for the testimonials you provided:
//         { nameKey: 'testimonial.amit_name', roleKey: 'testimonial.amit_role', feedbackKey: 'testimonial.amit_feedback', avatar: avatarAmit, rating: 5 },
//         { nameKey: 'testimonial.sunita_name', roleKey: 'testimonial.sunita_role', feedbackKey: 'testimonial.sunita_feedback', avatar: avatarSunita, rating: 5 },
//         { nameKey: 'testimonial.ravi_name', roleKey: 'testimonial.ravi_role', feedbackKey: 'testimonial.ravi_feedback', avatar: avatarRavi, rating: 5 },
//         { nameKey: 'testimonial.priya_name', roleKey: 'testimonial.priya_role', feedbackKey: 'testimonial.priya_feedback', avatar: avatarPriya, rating: 4 },
//         { nameKey: 'testimonial.rajesh_name', roleKey: 'testimonial.rajesh_role', feedbackKey: 'testimonial.rajesh_feedback', avatar: avatarRajesh, rating: 5 }
//     ];

//     // Re-integrated Important Links Data (unchanged)
//     const importantLinks = [
//         { src: indiaGovLogo, alt: 'India Government National Portal', href: 'https://www.india.gov.in/' },
//         { src: meityLogo, alt: 'Ministry of Electronics and Information Technology', href: 'https://www.meity.gov.in/' },
//         { src: azadiLogo, alt: 'Azadi Ka Amrit Mahotsav', href: 'https://amritmahotsav.nic.in/' },
//         { src: landResourcesLogo, alt: 'Department of Land Resources', href: 'https://dolr.gov.in/' },
//         { src: janSamarthLogo, alt: 'Jan Samarth', href: 'https://www.jansamarth.in/' },
//         // Duplicates for seamless scroll
//         { src: indiaGovLogo, alt: 'India Government National Portal', href: 'https://www.india.gov.in/' },
//         { src: meityLogo, alt: 'Ministry of Electronics and Information Technology', href: 'https://www.meity.gov.in/' },
//         { src: azadiLogo, alt: 'Azadi Ka Amrit Mahotsav', href: 'https://amritmahotsav.nic.in/' },
//         { src: landResourcesLogo, alt: 'Department of Land Resources', href: 'https://dolr.gov.in/' },
//         { src: janSamarthLogo, alt: 'Jan Samarth', href: 'https://www.jansamarth.in/' },
//     ];

//     return (
//         <Layout>
//             {/* ⭐️ PASS STATE TO CHATBOT ⭐️ */}
//             <ChatBot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />

//             {/* ⭐️ RE-ADD FLOATING BUTTON LOGIC HERE ⭐️ */}
//             {!isChatOpen && (
//                 <Button
//                     onClick={() => setIsChatOpen(true)}
//                     className="fixed bottom-8 right-8 flex items-center justify-center gap-3 rounded-full shadow-lg bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 z-50 px-7 py-7"
//                 >
//                     <Bot className="text-white" style={{ width: '30px', height: '30px' }} />
//                     <span className="text-white font-semibold text-2xl">AI</span>
//                 </Button>
//             )}

//             {/* Hero Section */}
//             <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
//                 <div
//                     className="absolute inset-0 bg-cover bg-center bg-no-repeat"
//                     style={{ backgroundImage: `url(${heroImage})` }}
//                 >
//                     <div className="absolute inset-0 bg-black/20" />
//                 </div>

//                 <div className="relative z-10 container mx-auto px-4 text-center text-white">
//                     <div className="max-w-4xl mx-auto">
//                         <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
//                             {t('hero.title')}
//                         </h1>
//                         <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
//                             {t('hero.subtitle')}
//                         </p>
//                         <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                             {/* Conditional Button Logic */}
//                             <Button asChild size="lg" className="bg-gradient-to-r from-green-600 to-emerald-700 hover:bg-primary/90 text-primary-foreground shadow-strong transition">
//                                 <Link to={user ? '/tools' : '/auth'}>
//                                     {t('hero.getStarted')}
//                                     <ArrowRight className="ml-2 h-5 w-5" />
//                                 </Link>
//                             </Button>
//                             <Button asChild variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/30 transition">
//                                 <Link to="/tools">{t('hero.learnMore')}</Link>
//                             </Button>
//                         </div>
//                     </div>
//                 </div>
//             </section>


//             <section className="pt-10 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
//                 <div className="absolute inset-0 bg-gradient-to-br from-green-100/30 via-amber-50/20 to-green-50/30 pointer-events-none"></div>
//                 <div className="max-w-7xl mx-auto relative">
//                     <div className="grid md:grid-cols-2 gap-16 items-center">
//                         <div className="space-y-8 animate-fade-in">
//                             <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg">
//                                 <Leaf className="w-4 h-4" />
//                                 Smart Farming Revolution
//                             </div>
//                             <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
//                                 Growing the Future with <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Smart Agriculture</span>
//                             </h1>
//                             <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
//                                 Join thousands of farmers transforming their operations with AI-powered insights, modern tools, and real-time market intelligence.
//                             </p>
//                             <div className="flex items-center gap-8 pt-2">
//                                 <div>
//                                     <div className="text-4xl font-bold text-green-600">10K+</div>
//                                     <div className="text-gray-600 font-medium">Active Farmers</div>
//                                 </div>
//                                 <div>
//                                     <div className="text-4xl font-bold text-amber-600">500+</div>
//                                     <div className="text-gray-600 font-medium">Tools Available</div>
//                                 </div>
//                                 <div>
//                                     <div className="text-4xl font-bold text-emerald-600">98%</div>
//                                     <div className="text-gray-600 font-medium">Satisfaction</div>
//                                 </div>
//                             </div>
//                             <div className="flex flex-wrap gap-4 pt-4">
//                                 <Link to="tools"><button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-5 rounded-full hover:from-green-700 hover:to-emerald-700 transition-all hover:shadow-2xl hover:scale-105 font-bold flex items-center gap-2 text-lg">
//                                     Explore Now <ChevronRight className="w-5 h-5" />
//                                 </button></Link>
//                                 <button className="bg-white text-green-700 border-2 border-green-600 px-10 py-5 rounded-full hover:bg-green-50 transition-all hover:shadow-xl font-bold text-lg">
//                                     Watch Demo
//                                 </button>
//                             </div>
//                         </div>
//                         <div className="relative">
//                             <div className="relative">
//                                 <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-3xl h-[500px] shadow-2xl overflow-hidden relative">
//                                     <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
//                                     <div className="absolute inset-0 flex items-center justify-center">
//                                         <Tractor className="w-48 h-48 text-white/30" strokeWidth={1} />
//                                     </div>
//                                     <div className="absolute bottom-8 left-8 right-8">
//                                         <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl">
//                                             <div className="flex items-center justify-between">
//                                                 <div className="flex items-center gap-3">
//                                                     <Smartphone className="w-10 h-10 text-green-600" />
//                                                     <div>
//                                                         <div className="font-bold text-gray-900">Modern Platform</div>
//                                                         <div className="text-sm text-gray-600">Access from anywhere</div>
//                                                     </div>
//                                                 </div>
//                                                 <BarChart3 className="w-8 h-8 text-amber-500" />
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                                 <div className="absolute -top-6 -right-6 bg-gradient-to-br from-amber-400 to-orange-500 p-6 rounded-2xl shadow-2xl animate-bounce-slow">
//                                     <div className="text-center">
//                                         <div className="text-3xl font-bold text-white">AI</div>
//                                         <div className="text-xs text-white/90 font-semibold">Powered</div>
//                                     </div>
//                                 </div>
//                                 <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-2xl hover:scale-110 transition-transform">
//                                     <div className="flex items-center gap-3">
//                                         <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-3 rounded-full">
//                                             <MessageSquareMore className="w-7 h-7 text-white" />
//                                         </div>
//                                         <div>
//                                             <p className="text-sm font-bold text-gray-900">24/7 AI Assistant</p>
//                                             <p className="text-xs text-gray-500">Instant Support</p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </section>


//             {/* About Section */}
//             <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
//                 <div className="max-w-7xl mx-auto">
//                     <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
//                         <div>
//                             <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
//                                 Our Story
//                             </div>
//                             <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Revolutionizing Agriculture Through Innovation</h2>
//                             <p className="text-lg text-gray-600 leading-relaxed mb-6">
//                                 KrishiSanjivni was born from a simple vision: to bridge the gap between traditional farming wisdom and modern technology. We understand the daily challenges farmers face, from unpredictable weather to fluctuating market prices.
//                             </p>
//                             <p className="text-lg text-gray-600 leading-relaxed mb-6">
//                                 Our platform combines cutting-edge AI, real-time data analytics, and a deep understanding of agricultural practices to deliver solutions that truly make a difference. We're not just building software; we're cultivating a community of forward-thinking farmers.
//                             </p>
//                             <div className="space-y-4">
//                                 <div className="flex items-start gap-4">
//                                     <div className="bg-green-100 p-2 rounded-lg mt-1">
//                                         <Shield className="w-6 h-6 text-green-600" />
//                                     </div>
//                                     <div>
//                                         <h4 className="font-bold text-gray-900 mb-1">Trusted & Secure</h4>
//                                         <p className="text-gray-600">Bank-grade security protecting your data and transactions</p>
//                                     </div>
//                                 </div>
//                                 <div className="flex items-start gap-4">
//                                     <div className="bg-amber-100 p-2 rounded-lg mt-1">
//                                         <Users className="w-6 h-6 text-amber-600" />
//                                     </div>
//                                     <div>
//                                         <h4 className="font-bold text-gray-900 mb-1">Community-First</h4>
//                                         <p className="text-gray-600">Built with farmers, for farmers, supporting local communities</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="relative">
//                             <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl h-96 shadow-2xl overflow-hidden relative">
//                                 <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
//                                 <div className="absolute inset-0 flex items-center justify-center">
//                                     <Sprout className="w-40 h-40 text-white/30" strokeWidth={1} />
//                                 </div>
//                                 <div className="absolute bottom-6 left-6 right-6">
//                                     <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl">
//                                         <div className="text-2xl font-bold text-gray-900 mb-1">Sustainable Growth</div>
//                                         <p className="text-sm text-gray-600">Empowering 10,000+ farmers across India</p>
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-xl">
//                                 <div className="text-center">
//                                     <div className="text-3xl font-bold text-green-600">2025</div>
//                                     <div className="text-xs text-gray-600 font-medium">Founded</div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="grid md:grid-cols-4 gap-6">
//                         <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all hover:-translate-y-2 border border-green-100">
//                             <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
//                                 <Users className="w-8 h-8 text-white" />
//                             </div>
//                             <h3 className="text-2xl font-bold text-gray-900 mb-3">Farmer-Centric</h3>
//                             <p className="text-gray-600">Built by understanding real challenges faced by farmers in their daily operations</p>
//                         </div>
//                         <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-xl transition-all hover:-translate-y-2 border border-amber-100">
//                             <div className="bg-gradient-to-br from-amber-500 to-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
//                                 <Target className="w-8 h-8 text-white" />
//                             </div>
//                             <h3 className="text-2xl font-bold text-gray-900 mb-3">Technology-Driven</h3>
//                             <p className="text-gray-600">Leveraging AI and modern tools to provide actionable insights and solutions</p>
//                         </div>
//                         <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all hover:-translate-y-2 border border-green-100">
//                             <div className="bg-gradient-to-br from-green-600 to-emerald-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
//                                 <Award className="w-8 h-8 text-white" />
//                             </div>
//                             <h3 className="text-2xl font-bold text-gray-900 mb-3">Trusted Partner</h3>
//                             <p className="text-gray-600">Supporting sustainable and profitable farming practices across communities</p>
//                         </div>
//                         <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl transition-all hover:-translate-y-2 border border-blue-100">
//                             <div className="bg-gradient-to-br from-blue-500 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
//                                 <Leaf className="w-8 h-8 text-white" />
//                             </div>
//                             <h3 className="text-2xl font-bold text-gray-900 mb-3">Eco-Friendly</h3>
//                             <p className="text-gray-600">Promoting sustainable practices that protect our environment for future generations</p>
//                         </div>
//                     </div>
//                 </div>
//             </section>


//             {/* Features Section */}
//             <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
//                 <div className="max-w-7xl mx-auto">
//                     <div className="text-center mb-16">
//                         <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Comprehensive Features</h2>
//                         <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//                             Everything you need to modernize your farming operations
//                         </p>
//                     </div>
//                     <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//                         {/* Tool Rentals */}
//                         <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100">
//                             <div className="bg-gradient-to-br from-orange-500 to-amber-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
//                                 <Wrench className="w-7 h-7 text-white" />
//                             </div>
//                             <h3 className="text-xl font-bold text-gray-900 mb-3">Tool Rentals</h3>
//                             <p className="text-gray-600 mb-4">Book agricultural tools and machinery for sowing, harvesting, and all farm operations</p>
//                             <Link to="/tools"><button className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-1 group " >
//                                 Explore <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//                             </button></Link>
//                         </div>

//                         {/* Warehouse Booking */}
//                         <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100">
//                             <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
//                                 <Warehouse className="w-7 h-7 text-white" />
//                             </div>
//                             <h3 className="text-xl font-bold text-gray-900 mb-3">Warehouse Storage</h3>
//                             <p className="text-gray-600 mb-4">Find and book warehouse space with details on capacity and storage conditions</p>
//                             <Link to="warehouse"><button className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-1 group">
//                                 Book Now <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//                             </button></Link>
//                         </div>

//                         {/* Soil Testing */}
//                         <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100">
//                             <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
//                                 <FlaskConical className="w-7 h-7 text-white" />
//                             </div>
//                             <h3 className="text-xl font-bold text-gray-900 mb-3">Soil Analysis</h3>
//                             <p className="text-gray-600 mb-4">Log soil checks, get NPK/pH readings, and receive fertilizer recommendations</p>
//                             <Link to="soil-check"><button className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-1 group">
//                                 Get Analysis <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//                             </button></Link>
//                         </div>

//                         {/* Market Info */}
//                         <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100">
//                             <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
//                                 <TrendingUp className="w-7 h-7 text-white" />
//                             </div>
//                             <h3 className="text-xl font-bold text-gray-900 mb-3">Market Information</h3>
//                             <p className="text-gray-600 mb-4">View local Mandi prices and crop demand insights in real-time</p>
//                             <Link to="market-prices"><button className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-1 group">
//                                 View Prices <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//                             </button></Link>
//                         </div>

//                         {/* Finance */}
//                         <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100">
//                             <div className="bg-gradient-to-br from-yellow-500 to-amber-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
//                                 <CreditCard className="w-7 h-7 text-white" />
//                             </div>
//                             <h3 className="text-xl font-bold text-gray-900 mb-3">Finance & Schemes</h3>
//                             <p className="text-gray-600 mb-4">Guidance on credit cards, insurance, subsidies, and government schemes</p>
//                             <Link to="resources"><button className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-1 group">
//                                 Learn More <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//                             </button></Link>
//                         </div>

//                         {/* Weather */}
//                         <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100">
//                             <div className="bg-gradient-to-br from-cyan-500 to-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
//                                 <CloudRain className="w-7 h-7 text-white" />
//                             </div>
//                             <h3 className="text-xl font-bold text-gray-900 mb-3">Weather & Advisory</h3>
//                             <p className="text-gray-600 mb-4">Hyper-local weather updates, pest alerts, and irrigation guidance</p>
//                             <Link to="weather"><button className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-1 group">
//                                 Get Updates <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//                             </button></Link>
//                         </div>

//                         {/* AI Assistant - Span 2 columns on larger screens */}
//                         <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 lg:col-span-2">
//                             <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
//                                 <MessageSquareMore className="w-7 h-7 text-white" />
//                             </div>
//                             <h3 className="text-xl font-bold text-white mb-3">AI Assistance</h3>
//                             <p className="text-green-50 mb-4">Smart chatbot providing step-by-step guidance, answering queries, and assisting with administrative questions 24/7</p>
//                             <button
//                                 // ⭐️ ADD onClick HANDLER TO OPEN CHAT ⭐️
//                                 onClick={() => setIsChatOpen(true)}
//                                 className="bg-white text-green-700 px-6 py-3 rounded-full font-semibold hover:bg-green-50 transition-all inline-flex items-center gap-2 hover:shadow-lg"
//                             >
//                                 Chat Now <ChevronRight className="w-4 h-4" />
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </section>


//             {/* 3. RE-INTEGRATED SECTION: Testimonials */}
//             <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
//                 <div className="container mx-auto px-4">
//                     <div className="text-center mb-16">
//                         {/* ✅ CORRECTED: Testimonial Header/Subtitle Keys */}
//                         <h2 className="text-4xl font-bold mb-4 text-foreground">{t('testimonial.section_title')}</h2>
//                         <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t('testimonial.section_subtitle')}</p>
//                     </div>
//                     <div className="grid md:grid-cols-3 gap-8">
//                         {rawTestimonialData.slice(0, 3).map((item, i) => ( // Use rawTestimonialData
//                             <Card key={i} className="group p-6 text-center relative overflow-hidden hover:shadow-lg transition-transform hover:-translate-y-1">
//                                 <div className="flex justify-center mb-4">
//                                     {[...Array(item.rating)].map((_, starIndex) => <Star key={starIndex} className="h-6 w-6 text-yellow-400 fill-current" />)}
//                                     {[...Array(5 - item.rating)].map((_, starIndex) => <Star key={starIndex + item.rating} className="h-6 w-6 text-gray-300" />)}
//                                 </div>
//                                 <img src={item.avatar} alt={t(item.nameKey)} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary/20 group-hover:border-primary transition-all duration-300" />
//                                 <p className="text-muted-foreground mb-4 text-sm italic">"{t(item.feedbackKey)}"</p>
//                                 {/* Hover overlay for name and role */}
//                                 <div className="absolute inset-x-0 bottom-0 bg-primary/80 text-white py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
//                                     <h4 className="text-lg font-semibold">{t(item.nameKey)}</h4>
//                                     <span className="text-sm opacity-90">{t(item.roleKey)}</span>
//                                 </div>
//                             </Card>
//                         ))}
//                     </div>
//                     <div className="grid md:grid-cols-2 gap-8 mt-8 max-w-4xl mx-auto"> {/* Bottom 2 testimonials */}
//                         {rawTestimonialData.slice(3, 5).map((item, i) => ( // Use rawTestimonialData
//                             <Card key={i + 3} className="group p-6 text-center relative overflow-hidden hover:shadow-lg transition-transform hover:-translate-y-1">
//                                 <div className="flex justify-center mb-4">
//                                     {[...Array(item.rating)].map((_, starIndex) => <Star key={starIndex} className="h-6 w-6 text-yellow-400 fill-current" />)}
//                                     {[...Array(5 - item.rating)].map((_, starIndex) => <Star key={starIndex + item.rating} className="h-6 w-6 text-gray-300" />)}
//                                 </div>
//                                 <img src={item.avatar} alt={t(item.nameKey)} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary/20 group-hover:border-primary transition-all duration-300" />
//                                 <p className="text-muted-foreground mb-4 text-sm italic">"{t(item.feedbackKey)}"</p>
//                                 {/* Hover overlay for name and role */}
//                                 <div className="absolute inset-x-0 bottom-0 bg-primary/80 text-white py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
//                                     <h4 className="text-lg font-semibold">{t(item.nameKey)}</h4>
//                                     <span className="text-sm opacity-90">{t(item.roleKey)}</span>
//                                 </div>
//                             </Card>
//                         ))}
//                     </div>
//                 </div>
//                 <div className="mt-16 bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
//                     <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
//                     <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
//                     <div className="relative z-10">
//                         <div className="grid md:grid-cols-4 gap-8 text-center">
//                             <div>
//                                 <div className="text-5xl font-bold text-white mb-2">10,000+</div>
//                                 <div className="text-green-100 font-medium">Active Farmers</div>
//                             </div>
//                             <div>
//                                 <div className="text-5xl font-bold text-white mb-2">50M+</div>
//                                 <div className="text-green-100 font-medium">Hectares Managed</div>
//                             </div>
//                             <div>
//                                 <div className="text-5xl font-bold text-white mb-2">98%</div>
//                                 <div className="text-green-100 font-medium">Satisfaction Rate</div>
//                             </div>
//                             <div>
//                                 <div className="text-5xl font-bold text-white mb-2">24/7</div>
//                                 <div className="text-green-100 font-medium">AI Support</div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {/* 4. RE-INTEGRATED SECTION: Marquee and Footer */}
//             <section
//                 className="py-10 overflow-hidden border-t-10 border-b-20 border-white/20"
//                 style={{
//                     background: "transparent linear-gradient(90deg, #B8D721 0%, #6CBE03 100%) 0% 0% no-repeat padding-box"
//                 }}
//             >
//                 <div className="text-center mb-8">
//                     <h2 className="text-4xl font-extrabold text-white tracking-wider">{t('index.links_title')}</h2> {/* ✅ CORRECTED: Marquee Title */}
//                 </div>
//                 <div className="relative w-full overflow-hidden">
//                     <div className="marquee-content flex space-x-20 justify-start">
//                         {importantLinks.map((link, index) => (
//                             <a
//                                 key={index}
//                                 href={link.href}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="link-item flex-shrink-0 flex items-center h-20 p-0 transition-opacity hover:opacity-100"
//                             >
//                                 <img
//                                     src={link.src}
//                                     alt={link.alt}
//                                     className="h-full object-contain w-auto max-w-none"
//                                 />
//                             </a>
//                         ))}
//                     </div>
//                 </div>
//             </section>

//             {/* 5. RE-INTEGRATED SECTION: Footer */}
//             <Footer />

//             {/* Note: Ensure the required CSS for the .marquee-content and .link-item is in your global stylesheet */}

//         </Layout>
//     );
// };

// export default Index;













































// src/pages/Index.tsx - Fully Internationalized
import React, { useState } from 'react';
import { Leaf, ChevronRight, Smartphone, BarChart3, MessageSquareMore, Award, Target, Shield, CloudRain, CreditCard, Wrench, FlaskConical, TrendingUp, Bot, ArrowRight, Star, Tractor, Warehouse, TestTube, Users, Sprout } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/Footer';

// Assuming asset imports are correct
import heroImage from '@/assets/hero-farm.jpg';
import feature1Image from '@/assets/feature1.jpg';
import feature2Image from '@/assets/feature2.jpg';
import feature3Image from '@/assets/feature3.jpg';
import { ChatBot } from '@/components/ChatBot';

// IMPORTANT LINKS IMAGES (Assumed assets)
import indiaGovLogo from '@/assets/india-gov-logo.png';
import meityLogo from '@/assets/meity-logo.png';
import azadiLogo from '@/assets/azadi-logo.png';
import landResourcesLogo from '@/assets/land-resources-logo.png';
import janSamarthLogo from '@/assets/jan-samarth-logo.png';

// TESTIMONIAL AVATARS (Assumed assets)
import avatarRavi from '@/assets/avatar-ravi.jpg';
import avatarSunita from '@/assets/avatar-sunita.jpg';
import avatarAmit from '@/assets/avatar-amit.jpg';
import avatarPriya from '@/assets/avatar-priya.jpg';
import avatarRajesh from '@/assets/avatar-rajesh.jpg';


const Index: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [isChatOpen, setIsChatOpen] = useState(false);

    // Placeholder data using translation keys (assuming corresponding image assets exist)
    const rawTestimonialData = [
        { nameKey: 'testimonial.amit_name', roleKey: 'testimonial.amit_role', feedbackKey: 'testimonial.amit_feedback', rating: 5, avatar: avatarAmit },
        { nameKey: 'testimonial.sunita_name', roleKey: 'testimonial.sunita_role', feedbackKey: 'testimonial.sunita_feedback', rating: 5, avatar: avatarSunita },
        { nameKey: 'testimonial.ravi_name', roleKey: 'testimonial.ravi_role', feedbackKey: 'testimonial.ravi_feedback', rating: 5, avatar: avatarRavi },
        { nameKey: 'testimonial.priya_name', roleKey: 'testimonial.priya_role', feedbackKey: 'testimonial.priya_feedback', rating: 4, avatar: avatarPriya },
        { nameKey: 'testimonial.rajesh_name', roleKey: 'testimonial.rajesh_role', feedbackKey: 'testimonial.rajesh_feedback', rating: 5, avatar: avatarRajesh }
    ];
    
    // Important Links Data
    const importantLinks = [
        { src: indiaGovLogo, alt: 'India Government National Portal', href: 'https://www.india.gov.in/' },
        { src: meityLogo, alt: 'Ministry of Electronics and Information Technology', href: 'https://www.meity.gov.in/' },
        { src: azadiLogo, alt: 'Azadi Ka Amrit Mahotsav', href: 'https://amritmahotsav.nic.in/' },
        { src: landResourcesLogo, alt: 'Department of Land Resources', href: 'https://dolr.gov.in/' },
        { src: janSamarthLogo, alt: 'Jan Samarth', href: 'https://www.jansamarth.in/' },
        // Duplicates for seamless scroll
        { src: indiaGovLogo, alt: 'India Government National Portal', href: 'https://www.india.gov.in/' },
        { src: meityLogo, alt: 'Ministry of Electronics and Information Technology', href: 'https://www.meity.gov.in/' },
        { src: azadiLogo, alt: 'Azadi Ka Amrit Mahotsav', href: 'https://amritmahotsav.nic.in/' },
        { src: landResourcesLogo, alt: 'Department of Land Resources', href: 'https://dolr.gov.in/' },
        { src: janSamarthLogo, alt: 'Jan Samarth', href: 'https://www.jansamarth.in/' },
    ];

    return (
        <Layout>
            {/* Chatbot and Floating Button */}
            <ChatBot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
            {!isChatOpen && (
                <Button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-8 right-8 flex items-center justify-center gap-3 rounded-full shadow-lg bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 z-50 px-7 py-7"
                >
                    <Bot className="text-white" style={{ width: '30px', height: '30px' }} />
                    <span className="text-white font-semibold text-2xl">{t('ai_button')}</span>
                </Button>
            )}

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${heroImage})` }}
                >
                    <div className="absolute inset-0 bg-black/20" />
                </div>
                <div className="relative z-10 container mx-auto px-4 text-center text-white">
                    <div className="max-w-4xl mx-auto">
                        {/* RESTORED H1 CLASSES */}
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight"> 
                            {t('hero.title')}
                        </h1>
                        {/* RESTORED P CLASSES */}
                        <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
                            {t('hero.subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" className="bg-gradient-to-r from-green-600 to-emerald-700 hover:bg-primary/90 text-primary-foreground shadow-strong transition">
                                <Link to={user ? '/tools' : '/auth'}>
                                    {t('hero.getStarted')}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/30 transition">
                                 <a href="/assets/demo.mp4" target="_blank" rel="noopener noreferrer">
    {t('hero.learnMore')}
  </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Section */}
            <section className="pt-10 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-100/30 via-amber-50/20 to-green-50/30 pointer-events-none"></div>
                <div className="max-w-7xl mx-auto relative">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8 animate-fade-in">
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg">
                                <Leaf className="w-4 h-4" />
                                {t('smart_farming_revolution')}
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
                                {t('growing_future_title_1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">{t('growing_future_title_2')}</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                                {t('growing_future_subtitle')}
                            </p>
                            <div className="flex items-center gap-8 pt-2">
                                <div><div className="text-4xl font-bold text-green-600">{t('stats.active_farmers_count')}</div><div className="text-gray-600 font-medium">{t('stats.active_farmers_label')}</div></div>
                                <div><div className="text-4xl font-bold text-amber-600">{t('stats.tools_available_count')}</div><div className="text-gray-600 font-medium">{t('stats.tools_available_label')}</div></div>
                                <div><div className="text-4xl font-bold text-emerald-600">{t('stats.satisfaction_rate_count')}</div><div className="text-gray-600 font-medium">{t('stats.satisfaction_rate_label')}</div></div>
                            </div>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <Link to="tools"><button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-5 rounded-full hover:from-green-700 hover:to-emerald-700 transition-all hover:shadow-2xl hover:scale-105 font-bold flex items-center gap-2 text-lg">
                                    {t('explore_now')} <ChevronRight className="w-5 h-5" />
                                </button></Link>
                                <button className="bg-white text-green-700 border-2 border-green-600 px-10 py-5 rounded-full hover:bg-green-50 transition-all hover:shadow-xl font-bold text-lg">
                                     <a href="/assets/demo.mp4" target="_blank" rel="noopener noreferrer">
    {t('watch_demo')}
  </a>
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="relative">
                                <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-3xl h-[500px] shadow-2xl overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Tractor className="w-48 h-48 text-white/30" strokeWidth={1} />
                                    </div>
                                    <div className="absolute bottom-8 left-8 right-8">
                                        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Smartphone className="w-10 h-10 text-green-600" />
                                                    <div><div className="font-bold text-gray-900">{t('modern_platform_title')}</div><div className="text-sm text-gray-600">{t('modern_platform_subtitle')}</div></div>
                                                </div>
                                                <BarChart3 className="w-8 h-8 text-amber-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -top-6 -right-6 bg-gradient-to-br from-amber-400 to-orange-500 p-6 rounded-2xl shadow-2xl animate-bounce-slow">
                                    <div className="text-center"><div className="text-3xl font-bold text-white">AI</div><div className="text-xs text-white/90 font-semibold">{t('ai_powered_label')}</div></div>
                                </div>
                                <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-2xl hover:scale-110 transition-transform">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-3 rounded-full"><MessageSquareMore className="w-7 h-7 text-white" /></div>
                                        <div><p className="text-sm font-bold text-gray-900">{t('ai_assistant_title')}</p><p className="text-xs text-gray-500">{t('ai_assistant_subtitle')}</p></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* About Section */}
            <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
                        <div>
                            <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">{t('about.story_label')}</div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t('about.title')}</h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-6">{t('about.p1')}</p>
                            <p className="text-lg text-gray-600 leading-relaxed mb-6">{t('about.p2')}</p>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="bg-green-100 p-2 rounded-lg mt-1"><Shield className="w-6 h-6 text-green-600" /></div>
                                    <div><h4 className="font-bold text-gray-900 mb-1">{t('about.feature_trusted_title')}</h4><p className="text-gray-600">{t('about.feature_trusted_subtitle')}</p></div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-amber-100 p-2 rounded-lg mt-1"><Users className="w-6 h-6 text-amber-600" /></div>
                                    <div><h4 className="font-bold text-gray-900 mb-1">{t('about.feature_community_title')}</h4><p className="text-gray-600">{t('about.feature_community_subtitle')}</p></div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl h-96 shadow-2xl overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                <div className="absolute inset-0 flex items-center justify-center"><Sprout className="w-40 h-40 text-white/30" strokeWidth={1} /></div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl"><div className="text-2xl font-bold text-gray-900 mb-1">{t('sustainable_growth_title')}</div><p className="text-sm text-gray-600">{t('sustainable_growth_subtitle')}</p></div>
                                </div>
                            </div>
                            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-xl">
                                <div className="text-center"><div className="text-3xl font-bold text-green-600">{t('founded_year')}</div><div className="text-xs text-gray-600 font-medium">{t('founded_label')}</div></div>
                            </div>
                        </div>
                    </div>
                    {/* Value Proposition Cards */}
                    <div className="grid md:grid-cols-4 gap-6">
                        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all hover:-translate-y-2 border border-green-100">
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"><Users className="w-8 h-8 text-white" /></div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('value.farmer_centric_title')}</h3><p className="text-gray-600">{t('value.farmer_centric_p')}</p>
                        </div>
                        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-xl transition-all hover:-translate-y-2 border border-amber-100">
                            <div className="bg-gradient-to-br from-amber-500 to-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"><Target className="w-8 h-8 text-white" /></div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('value.technology_driven_title')}</h3><p className="text-gray-600">{t('value.technology_driven_p')}</p>
                        </div>
                        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all hover:-translate-y-2 border border-green-100">
                            <div className="bg-gradient-to-br from-green-600 to-emerald-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"><Award className="w-8 h-8 text-white" /></div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('value.trusted_partner_title')}</h3><p className="text-gray-600">{t('value.trusted_partner_p')}</p>
                        </div>
                        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl transition-all hover:-translate-y-2 border border-blue-100">
                            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"><Leaf className="w-8 h-8 text-white" /></div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('value.eco_friendly_title')}</h3><p className="text-gray-600">{t('value.eco_friendly_p')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16"><h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t('features.title')}</h2><p className="text-xl text-gray-600 max-w-3xl mx-auto">{t('features.subtitle')}</p></div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Tool Rentals */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100">
                            <div className="bg-gradient-to-br from-orange-500 to-amber-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4"><Wrench className="w-7 h-7 text-white" /></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('feature.tools_title')}</h3><p className="text-gray-600 mb-4">{t('feature.tools_p')}</p><Link to="/tools"><button className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-1 group " >{t('feature.tools_action')} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></button></Link>
                        </div>

                        {/* Warehouse Booking */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4"><Warehouse className="w-7 h-7 text-white" /></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('feature.warehouse_title')}</h3><p className="text-gray-600 mb-4">{t('feature.warehouse_p')}</p><Link to="warehouse"><button className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-1 group">{t('feature.warehouse_action')} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></button></Link>
                        </div>

                        {/* Soil Testing */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100">
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4"><FlaskConical className="w-7 h-7 text-white" /></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('feature.soil_title')}</h3><p className="text-gray-600 mb-4">{t('feature.soil_p')}</p><Link to="soil-check"><button className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-1 group">{t('feature.soil_action')} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></button></Link>
                        </div>

                        {/* Market Info */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100">
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4"><TrendingUp className="w-7 h-7 text-white" /></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('feature.market_title')}</h3><p className="text-gray-600 mb-4">{t('feature.market_p')}</p><Link to="market-prices"><button className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-1 group">{t('feature.market_action')} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></button></Link>
                        </div>

                        {/* Finance */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100">
                            <div className="bg-gradient-to-br from-yellow-500 to-amber-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4"><CreditCard className="w-7 h-7 text-white" /></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('feature.finance_title')}</h3><p className="text-gray-600 mb-4">{t('feature.finance_p')}</p><Link to="resources"><button className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-1 group">{t('feature.finance_action')} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></button></Link>
                        </div>

                        {/* Weather */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100">
                            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4"><CloudRain className="w-7 h-7 text-white" /></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('feature.weather_title')}</h3><p className="text-gray-600 mb-4">{t('feature.weather_p')}</p><Link to="weather"><button className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-1 group">{t('feature.weather_action')} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></button></Link>
                        </div>

                        {/* AI Assistant */}
                        <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 lg:col-span-2">
                            <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4"><MessageSquareMore className="w-7 h-7 text-white" /></div>
                            <h3 className="text-xl font-bold text-white mb-3">{t('feature.ai_title')}</h3><p className="text-green-50 mb-4">{t('feature.ai_p')}</p>
                            <button onClick={() => setIsChatOpen(true)} className="bg-white text-green-700 px-6 py-3 rounded-full font-semibold hover:bg-green-50 transition-all inline-flex items-center gap-2 hover:shadow-lg">{t('feature.ai_action')} <ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials and Stats */}
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16"><h2 className="text-4xl font-bold mb-4 text-foreground">{t('testimonial.section_title')}</h2><p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t('testimonial.section_subtitle')}</p></div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {rawTestimonialData.slice(0, 3).map((item, i) => (
                            <Card key={i} className="group p-6 text-center relative overflow-hidden hover:shadow-lg transition-transform hover:-translate-y-1">
                                <div className="flex justify-center mb-4">
                                    {[...Array(item.rating)].map((_, starIndex) => <Star key={starIndex} className="h-6 w-6 text-yellow-400 fill-current" />)}
                                    {[...Array(5 - item.rating)].map((_, starIndex) => <Star key={starIndex + item.rating} className="h-6 w-6 text-gray-300" />)}
                                </div>
                                <img src={item.avatar} alt={t(item.nameKey)} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary/20 group-hover:border-primary transition-all duration-300" />
                                <p className="text-muted-foreground mb-4 text-sm italic">"{t(item.feedbackKey)}"</p>
                                <div className="absolute inset-x-0 bottom-0 bg-primary/80 text-white py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                                    <h4 className="text-lg font-semibold">{t(item.nameKey)}</h4>
                                    <span className="text-sm opacity-90">{t(item.roleKey)}</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                    {/* Bottom 2 testimonials */}
                    <div className="grid md:grid-cols-2 gap-8 mt-8 max-w-4xl mx-auto"> 
                        {rawTestimonialData.slice(3, 5).map((item, i) => ( 
                            <Card key={i + 3} className="group p-6 text-center relative overflow-hidden hover:shadow-lg transition-transform hover:-translate-y-1">
                                <div className="flex justify-center mb-4">
                                    {[...Array(item.rating)].map((_, starIndex) => <Star key={starIndex} className="h-6 w-6 text-yellow-400 fill-current" />)}
                                    {[...Array(5 - item.rating)].map((_, starIndex) => <Star key={starIndex + item.rating} className="h-6 w-6 text-gray-300" />)}
                                </div>
                                <img src={item.avatar} alt={t(item.nameKey)} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary/20 group-hover:border-primary transition-all duration-300" />
                                <p className="text-muted-foreground mb-4 text-sm italic">"{t(item.feedbackKey)}"</p>
                                <div className="absolute inset-x-0 bottom-0 bg-primary/80 text-white py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                                    <h4 className="text-lg font-semibold">{t(item.nameKey)}</h4>
                                    <span className="text-sm opacity-90">{t(item.roleKey)}</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                    <div className="mt-16 bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                        <div className="relative z-10">
                            <div className="grid md:grid-cols-4 gap-8 text-center">
                                <div><div className="text-5xl font-bold text-white mb-2">{t('stats.active_farmers_count')}</div><div className="text-green-100 font-medium">{t('stats.active_farmers_label')}</div></div>
                                <div><div className="text-5xl font-bold text-white mb-2">{t('stats.managed_hectares_count')}</div><div className="text-green-100 font-medium">{t('stats.managed_hectares_label')}</div></div>
                                <div><div className="text-5xl font-bold text-white mb-2">{t('stats.satisfaction_rate_count')}</div><div className="text-green-100 font-medium">{t('stats.satisfaction_rate_label')}</div></div>
                                <div><div className="text-5xl font-bold text-white mb-2">{t('stats.ai_support_count')}</div><div className="text-green-100 font-medium">{t('stats.ai_support_label')}</div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Marquee Section */}
            <section
                className="py-10 overflow-hidden border-t-10 border-b-20 border-white/20"
                style={{
                    background: "transparent linear-gradient(90deg, #B8D721 0%, #6CBE03 100%) 0% 0% no-repeat padding-box"
                }}
            >
                <div className="text-center mb-8"><h2 className="text-4xl font-extrabold text-white tracking-wider">{t('index.links_title')}</h2></div>
                <div className="relative w-full overflow-hidden">
                    <div className="marquee-content flex space-x-20 justify-start">
                        {importantLinks.map((link, index) => (
                            <a
                                key={index}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link-item flex-shrink-0 flex items-center h-20 p-0 transition-opacity hover:opacity-100"
                            >
                                <img
                                    src={link.src}
                                    alt={link.alt}
                                    className="h-full object-contain w-auto max-w-none"
                                />
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </Layout>
    );
};

export default Index;