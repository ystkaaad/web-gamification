import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Star, ArrowRight, Zap,Gift,Menu,X,ChevronDown,User,Sparkles,MapPin,MessageCircle,TrendingUp,Smartphone
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };
  const goToLogin = () => {
    setIsMenuOpen(false);
    navigate('/login');
  };
  const navLinks = [
    { name: 'Cara Kerja', id: 'cara-kerja' },
    { name: 'Benefit', id: 'benefit' },
    { name: 'Testimoni', id: 'testimoni' },
    { name: 'FAQ', id: 'faq' }
  ];

  return (
    <div className="bg-white min-h-screen selection:bg-orange-200 overflow-x-hidden">
      {/* Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-[110] transition-all duration-500 ${
        isScrolled || isMenuOpen ? 'bg-white border-b border-orange-100 py-3 shadow-sm' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-11 h-11 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform">N</div>
            <span className={`text-2xl font-black tracking-tighter text-[#0F172A]`}>Ngolabify</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <button 
                key={link.id} 
                onClick={() => scrollToSection(link.id)}
                className={`text-[11px] font-black uppercase tracking-widest transition-all text-slate-500 hover:text-orange-500`}
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Registration/Login buttons removed per user request */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={goToLogin}
              className="flex items-center gap-2 px-8 py-3 bg-orange-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
            >
              Masuk Member
            </button>
          </div>

          {/* Burger Button */}
          <button className="md:hidden p-2 z-[120] relative" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? (
              <X size={28} className="text-slate-900" />
            ) : (
              <Menu size={28} className="text-[#0F172A]" />
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`md:hidden fixed inset-0 bg-white z-[105] transition-all duration-500 flex flex-col p-10 pt-32 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col gap-8">
            {navLinks.map((link) => (
              <button 
                key={link.id} 
                onClick={() => scrollToSection(link.id)}
                className="text-3xl font-black text-[#0F172A] text-left italic hover:text-orange-500 transition-colors"
              >
                {link.name}
              </button>
            ))}
          </div>
          
          <div className="mt-auto space-y-3">
            <button 
              className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-100 flex items-center justify-center gap-3"
              onClick={goToLogin}
            >
              <User size={24} /> Masuk Sekarang
            </button>
            <button 
              className="w-full py-5 bg-white border-2 border-orange-100 text-orange-600 rounded-2xl font-black text-lg"
              onClick={() => { setIsMenuOpen(false); scrollToSection('faq'); }}
            >
              Pusat Bantuan
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-white text-slate-900 pt-20">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-orange-100/50 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10 w-full">
          <div className="space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 bg-orange-50 px-6 py-2.5 rounded-full border border-orange-100">
              <Sparkles size={18} className="text-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">The Future of Loyalty</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter text-[#0F172A]">
              Bukan Sekadar <br/><span className="text-orange-500 italic underline decoration-orange-100">Jajan Biasa.</span>
            </h1>
            
            <p className="text-lg text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Transformasi setiap gigitan menjadi poin berharga. Ngolabify menghubungkan ratusan outlet favorit dalam satu ekosistem reward yang seru dan menguntungkan.
            </p>
            
          {/* Hero Section CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-5 pt-4">
              <button 
                onClick={goToLogin}
                className="group w-full sm:w-auto bg-orange-500 text-white px-12 py-6 rounded-3xl font-black text-lg hover:shadow-[0_20px_40px_rgba(251,146,60,0.3)] transition-all hover:-translate-y-2 active:scale-95 flex items-center justify-center gap-4"
              >
                Mulai Sekarang <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </button>
              <button 
                onClick={() => scrollToSection('cara-kerja')}
                className="w-full sm:w-auto bg-orange-50 border border-orange-100 text-orange-600 px-10 py-6 rounded-3xl font-black text-lg hover:bg-orange-100 transition-all flex items-center justify-center gap-3"
              >
                Lihat Cara Kerja
              </button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 opacity-60">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-[#0F172A]">10K+</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active Members</span>
              </div>
              <div className="w-px h-10 bg-slate-200"></div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-[#0F172A]">500+</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Partner Outlets</span>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative z-10 bg-gradient-to-br from-orange-200 to-orange-400 aspect-[4/5] rounded-[4rem] shadow-2xl p-2 rotate-3 overflow-hidden group">
               <img 
                 src="https://images.unsplash.com/photo-1629814249584-bd4d53cf0e7d?q=80&w=2071&auto=format&fit=crop" 
                 className="w-full h-full object-cover rounded-[3.5rem] group-hover:scale-110 transition-transform duration-[3000ms]"
                 alt="Loyalty Experience"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent"></div>
               <div className="absolute bottom-12 left-12 right-12 bg-white px-8 py-6 rounded-[2.5rem] border border-orange-100 shadow-xl">
                  <p className="text-[#0F172A] font-black text-xl italic tracking-tight">"Sangat mudah, cukup scan dan dapat poin. Bakso favorit jadi terasa gratis!"</p>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <User size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#0F172A]">Budi Santoso</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Platinum Member</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cara Kerja Section */}
      <section id="cara-kerja" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-20">
             <span className="text-orange-600 font-black text-[10px] uppercase tracking-[0.4em]">Simple Steps</span>
             <h2 className="text-4xl md:text-6xl font-black text-[#0F172A] tracking-tighter italic">Bagaimana Ngolabify <br/><span className="text-orange-600">Bekerja?</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                step: "01", 
                title: "Scan & Jajan", 
                desc: "Kunjungi outlet favoritmu, lakukan transaksi, dan cukup scan QR di kasir.",
                icon: Smartphone,
                color: "bg-orange-50 text-orange-600"
              },
              { 
                step: "02", 
                title: "Kumpulkan Poin", 
                desc: "Poin masuk secara real-time. Semakin sering jajan, semakin tinggi levelmu.",
                icon: Zap,
                color: "bg-orange-50 text-orange-600"
              },
              { 
                step: "03", 
                title: "Klaim Reward", 
                desc: "Tukarkan poinmu di Marketplace untuk diskon atau menu gratis!",
                icon: Gift,
                color: "bg-orange-50 text-orange-600"
              }
            ].map((item, idx) => (
              <div key={idx} className="group bg-white p-12 rounded-[3.5rem] border border-orange-50 hover:shadow-2xl hover:border-orange-200 transition-all duration-500 hover:-translate-y-4 text-center md:text-left">
                <div className={`w-20 h-20 ${item.color} rounded-3xl flex items-center justify-center mx-auto md:mx-0 mb-8 shadow-inner group-hover:scale-110 transition-transform`}>
                  <item.icon size={36} />
                </div>
                <span className="text-5xl font-black text-slate-100 mb-4 block group-hover:text-orange-100 transition-colors">{item.step}</span>
                <h3 className="text-2xl font-black text-[#0F172A] mb-4">{item.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefit Section */}
      <section id="benefit" className="py-32 px-6 bg-orange-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-8">
            <span className="text-orange-600 font-black text-[10px] uppercase tracking-[0.4em]">All-in-One Rewards</span>
            <h2 className="text-4xl md:text-7xl font-black text-[#0F172A] tracking-tighter italic leading-[0.9]">Kenapa Bergabung <br/>dengan Kami?</h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed mx-auto max-w-2xl">Kami merancang sistem yang adil dan menguntungkan bagi penikmat kuliner maupun pebisnis.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10 text-left">
              <div className="p-8 bg-white rounded-[2.5rem] border border-orange-100 shadow-sm group hover:bg-orange-500 transition-all">
                <CheckCircle2 size={32} className="text-orange-600 group-hover:text-white mb-6" />
                <h4 className="text-[#0F172A] group-hover:text-white font-black text-xl mb-2">Member Rewards</h4>
                <p className="text-slate-500 group-hover:text-white/80 text-sm">Cashback, level eksklusif, dan akses menu khusus.</p>
              </div>
              <div className="p-8 bg-white rounded-[2.5rem] border border-orange-100 shadow-sm group hover:bg-orange-500 transition-all">
                <TrendingUp size={32} className="text-orange-600 group-hover:text-white mb-6" />
                <h4 className="text-[#0F172A] group-hover:text-white font-black text-xl mb-2">Affiliate Integration</h4>
                <p className="text-slate-500 group-hover:text-white/80 text-sm">Status Affiliate tersinkronisasi otomatis dengan sistem membership utama.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimoni Section */}
      <section id="testimoni" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="space-y-4 max-w-2xl">
              <span className="text-orange-600 font-black text-[10px] uppercase tracking-[0.4em]">Real Stories</span>
              <h2 className="text-4xl md:text-6xl font-black text-[#0F172A] tracking-tighter italic leading-none">Apa Kata <br/>Keluarga <span className="text-orange-700">Ngolabify?</span></h2>
            </div>
            <div className="flex gap-4">
              <button className="w-14 h-14 bg-white border border-orange-100 rounded-2xl flex items-center justify-center text-[#0F172A] hover:bg-orange-50 transition-all"><ArrowRight size={20} className="rotate-180" /></button>
              <button className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center text-white hover:bg-orange-500 transition-all shadow-xl shadow-orange-100"><ArrowRight size={20} /></button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Rina Amelia",
                role: "Mahasiswi & Member",
                text: "Dulu sering jajan tapi nggak dapet apa-apa. Sekarang jajan bakso malah bisa dapet voucher mie yamin gratis. Nagih banget!",
                avatar: "https://i.pravatar.cc/150?u=rina"
              },
              {
                name: "Hendra Wijaya",
                role: "Foodie Blogger",
                text: "Sistem leveling-nya seru, kayak main game tapi dapet makanan beneran. Level Platinum diskonnya nggak main-main!",
                avatar: "https://i.pravatar.cc/150?u=hendra"
              },
              {
                name: "Siska Putri",
                role: "Afiliator Business",
                text: "Iseng ajak temen sekantor gabung, eh sekarang tiap bulan dapet komisi poin yang lumayan buat makan siang gratis sebulan penuh.",
                avatar: "https://i.pravatar.cc/150?u=siska"
              }
            ].map((t, idx) => (
              <div key={idx} className="bg-white p-10 rounded-[3rem] border border-orange-50 shadow-sm hover:shadow-xl transition-all">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-orange-600 fill-orange-600" />)}
                </div>
                <p className="text-slate-600 font-medium italic text-lg leading-relaxed mb-8">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <img src={t.avatar} className="w-14 h-14 rounded-2xl object-cover" alt="" />
                  <div>
                    <h4 className="font-black text-[#0F172A]">{t.name}</h4>
                    <p className="text-[10px] font-bold text-orange-700 uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 px-6 bg-slate-50/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-20">
             <span className="text-orange-600 font-black text-[10px] uppercase tracking-[0.4em]">Help Center</span>
             <h2 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tighter italic">Pertanyaan <span className="text-orange-700">Populer</span></h2>
          </div>

          <div className="space-y-4">
            {[
              { q: "Gimana cara dapet poin lebih banyak?", a: "Selain jajan, kamu bisa dapet poin dengan menyelesaikan misi harian atau mengikuti mini-games yang tersedia di dashboard." },
              { q: "Apa bedanya Member dan Afiliator?", a: "Member fokus pada reward gamifikasi (Poin & Badge), sementara status Afiliator dikelola oleh sistem membership eksternal dan memberikan akses ke dashboard bisnis khusus." }
            ].map((f, idx) => (
              <div key={idx} className="bg-white rounded-[2rem] border border-orange-100 overflow-hidden transition-all">
                <button 
                   onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                   className="w-full p-8 flex items-center justify-between text-left"
                >
                   <span className="text-lg font-black text-[#0F172A] pr-8">{f.q}</span>
                   <div className={`shrink-0 w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}>
                     <ChevronDown size={20} />
                   </div>
                </button>
                <div className={`transition-all duration-300 overflow-hidden ${openFaq === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-8 pb-8 pt-0 text-slate-500 font-medium leading-relaxed">
                    {f.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="bg-white pt-32 pb-12 px-6 border-t border-orange-100">
        <div className="max-w-7xl mx-auto">
           <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-[4rem] p-12 md:p-24 text-center space-y-10 relative overflow-hidden shadow-2xl shadow-orange-100">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full"></div>
              <div className="relative z-10 space-y-6">
                <h2 className="text-4xl md:text-7xl font-black text-white italic tracking-tighter leading-none">Sudah Siap Jajan <br/>Lebih Seru?</h2>
                <p className="text-white/80 font-medium max-w-xl mx-auto text-lg">Ribuan member sudah menikmati makan gratis tiap minggu. Jangan sampai ketinggalan!</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                   <button 
                     onClick={goToLogin}
                     className="w-full sm:w-auto px-16 py-6 bg-white text-orange-600 rounded-3xl font-black text-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
                   >
                     Masuk Sekarang
                   </button>
                </div>
              </div>
           </div>

           <div className="mt-32 pt-12 border-t border-orange-100 grid md:grid-cols-4 gap-12 text-slate-400">
              <div className="space-y-6 col-span-1 md:col-span-1">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black">N</div>
                    <span className="text-[#0F172A] font-black text-xl tracking-tighter">Ngolabify</span>
                 </div>
                 <p className="text-sm leading-relaxed">Platform gamifikasi loyalitas modern untuk ekosistem kuliner terbaik di Indonesia.</p>
                 <div className="flex gap-4">
                    <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all cursor-pointer"><Smartphone size={18} /></div>
                    <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all cursor-pointer"><MessageCircle size={18} /></div>
                    <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all cursor-pointer"><MapPin size={18} /></div>
                 </div>
              </div>

              <div>
                <h5 className="text-[#0F172A] font-black text-xs uppercase tracking-widest mb-6">Menu</h5>
                <ul className="space-y-4 text-sm font-bold">
                  {navLinks.map(item => (
                    <li key={item.id} onClick={() => scrollToSection(item.id)} className="hover:text-orange-500 cursor-pointer transition-colors">{item.name}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="text-[#0F172A] font-black text-xs uppercase tracking-widest mb-6">Bantuan</h5>
                <ul className="space-y-4 text-sm font-bold">
                  {['Customer Care', 'Syarat & Ketentuan', 'Kebijakan Privasi', 'Keamanan Data'].map(item => (
                    <li key={item} className="hover:text-orange-500 cursor-pointer transition-colors">{item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-orange-50 p-8 rounded-[2rem] border border-orange-100">
                <h5 className="text-[#0F172A] font-black text-xs uppercase tracking-widest mb-4">Newsletter</h5>
                <p className="text-xs mb-6 font-medium text-slate-500">Dapatkan info promo & misi terbaru langsung ke emailmu.</p>
                <div className="flex gap-2">
                  <input type="email" placeholder="Email kamu" className="bg-white border border-orange-100 rounded-xl px-4 py-3 text-xs w-full focus:outline-none focus:border-orange-500 transition-all text-slate-900" />
                  <button className="bg-orange-500 text-white p-3 rounded-xl hover:bg-orange-600 transition-all"><ArrowRight size={18} /></button>
                </div>
              </div>
           </div>

           <div className="mt-12 text-center text-[10px] text-slate-300 font-black uppercase tracking-widest">
              © 2024 Ngolabify Gamification Platform. All Rights Reserved.
           </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;