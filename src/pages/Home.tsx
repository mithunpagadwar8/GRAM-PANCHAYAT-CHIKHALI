
import React, { useEffect, useState } from 'react';
import { AppSettings, Member, ImportantLink, BlogPost } from '../types';

interface HomeProps {
  settings: AppSettings;
  members: Member[];
  links: ImportantLink[];
  notices: BlogPost[];
}

export const Home: React.FC<HomeProps> = ({ settings, members, links, notices }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto Slider Logic (Right to Left)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % settings.sliderImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [settings.sliderImages]);

  // Categorize Members
  const sarpanch = members.find(m => m.type === 'sarpanch');
  const upsarpanch = members.find(m => m.type === 'upsarpanch');
  const policePatil = members.find(m => m.type === 'police_patil');
  const tantamukti = members.find(m => m.type === 'tantamukti');
  const pesaAdhyaksh = members.find(m => m.type === 'pesa');
  const regularMembers = members.filter(m => m.type === 'member');
  const staff = members.filter(m => m.type === 'staff');

  const SectionHeader = ({ title, icon, color = "text-gov-primary" }: { title: string, icon: string, color?: string }) => (
      <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-gray-200">
          <div className={`p-2 rounded bg-gray-100 ${color} text-xl`}>
             <i className={`fas ${icon}`}></i>
          </div>
          <h3 className={`text-2xl font-bold ${color} uppercase font-serif`}>{title}</h3>
      </div>
  );

  const ProfileCard = ({ member, highlight = false, badgeColor = "bg-blue-600" }: { member: Member, highlight?: boolean, badgeColor?: string }) => (
     <div className={`bg-white rounded-xl shadow-lg overflow-hidden border ${highlight ? 'border-orange-400 scale-105 z-10' : 'border-gray-200'} hover:shadow-2xl transition-all duration-300 text-center group`}>
        <div className={`h-2 ${badgeColor} w-full`}></div>
        <div className="p-6">
            <div className="relative w-28 h-28 mx-auto mb-4">
                <img src={member.photoUrl} alt={member.name} className="w-full h-full rounded-full object-cover border-4 border-white shadow-md group-hover:scale-110 transition-transform duration-300" />
                {highlight && <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black text-xs font-bold p-1 rounded-full shadow border border-white"><i className="fas fa-star"></i></div>}
            </div>
            <h4 className="text-lg font-bold text-gray-800 leading-tight mb-1">{member.name}</h4>
            <span className={`inline-block px-3 py-1 text-xs font-bold text-white rounded-full ${badgeColor} uppercase tracking-wider mb-3`}>
                {member.position}
            </span>
            <div className="text-gray-500 text-sm space-y-1 bg-gray-50 p-2 rounded">
                <p><i className="fas fa-phone-alt text-green-600 mr-2"></i> {member.mobile}</p>
                {member.address && <p><i className="fas fa-map-marker-alt text-red-500 mr-2"></i> {member.address}</p>}
            </div>
        </div>
     </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-0 font-sans">
      
      {/* Enhanced Slider Section */}
      <div className="relative h-[250px] md:h-[500px] overflow-hidden bg-gray-900 shadow-xl">
        {settings.sliderImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
             {/* Pan Animation Effect */}
            <img src={img} alt={`Slide ${index}`} className={`w-full h-full object-cover transform transition-transform duration-[10000ms] ease-linear ${index === currentSlide ? 'scale-110' : 'scale-100'}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            {/* Slider Caption */}
            <div className="absolute bottom-10 left-0 right-0 text-center text-white z-20 px-4">
                 <h2 className="text-2xl md:text-5xl font-bold drop-shadow-lg mb-2 text-yellow-400 animate-bounce">ग्रामपंचायत चिखली मध्ये आपले स्वागत आहे</h2>
                 <p className="text-sm md:text-lg text-gray-200 drop-shadow-md">"स्वच्छ भारत, स्वस्थ भारत - विकासाकडे आपली वाटचाल"</p>
            </div>
          </div>
        ))}
        {/* Navigation Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
             {settings.sliderImages.map((_, idx) => (
                 <button 
                    key={idx} 
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${idx === currentSlide ? 'bg-orange-500 w-8' : 'bg-white/50 hover:bg-white'}`}
                 ></button>
             ))}
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar: Notices & Links */}
        <div className="lg:col-span-1 space-y-8 order-2 lg:order-1">
             {/* Quick Actions Vertical */}
             <div className="grid grid-cols-2 gap-3">
                 <a href="#/tax" className="bg-white border-l-4 border-green-600 p-3 shadow hover:shadow-lg transition rounded flex flex-col items-center text-center group">
                     <i className="fas fa-rupee-sign text-2xl text-green-600 mb-2 group-hover:scale-110 transition"></i>
                     <span className="text-xs font-bold text-gray-700">Tax Payment<br/>(कर भरा)</span>
                 </a>
                 <a href="#/complaint" className="bg-white border-l-4 border-red-600 p-3 shadow hover:shadow-lg transition rounded flex flex-col items-center text-center group">
                     <i className="fas fa-bullhorn text-2xl text-red-600 mb-2 group-hover:scale-110 transition"></i>
                     <span className="text-xs font-bold text-gray-700">Complaint<br/>(तक्रार करा)</span>
                 </a>
                 <a href="#/schemes" className="bg-white border-l-4 border-blue-600 p-3 shadow hover:shadow-lg transition rounded flex flex-col items-center text-center group">
                     <i className="fas fa-hand-holding-heart text-2xl text-blue-600 mb-2 group-hover:scale-110 transition"></i>
                     <span className="text-xs font-bold text-gray-700">Schemes<br/>(योजना)</span>
                 </a>
                 <a href="#/meetings" className="bg-white border-l-4 border-purple-600 p-3 shadow hover:shadow-lg transition rounded flex flex-col items-center text-center group">
                     <i className="fas fa-users text-2xl text-purple-600 mb-2 group-hover:scale-110 transition"></i>
                     <span className="text-xs font-bold text-gray-700">Meetings<br/>(सभा)</span>
                 </a>
             </div>

             {/* Marquee Vertical / Notices */}
             <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-orange-600 text-white p-3 font-bold flex items-center justify-between">
                    <span><i className="fas fa-bell mr-2"></i> ताज्या सूचना</span>
                </div>
                <div className="h-64 overflow-hidden relative">
                    <div className="absolute inset-0 p-4 space-y-4 animate-[marquee-vertical_15s_linear_infinite] hover:pause">
                        {notices.filter(n => n.category === 'Notice').length > 0 ? (
                             notices.filter(n => n.category === 'Notice').map(notice => (
                                <div key={notice.id} className="border-b border-dashed pb-2">
                                    <p className="text-xs text-red-600 font-bold mb-1"><i className="far fa-calendar-alt"></i> {notice.publishDate}</p>
                                    <p className="text-sm font-bold text-gray-800 hover:text-blue-600 cursor-pointer">{notice.title}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 text-sm">No active notices</p>
                        )}
                    </div>
                </div>
                <style>{`
                    @keyframes marquee-vertical {
                        0% { transform: translateY(100%); }
                        100% { transform: translateY(-100%); }
                    }
                    .hover\\:pause:hover { animation-play-state: paused; }
                `}</style>
             </div>
             
             {/* Important Links */}
             <div className="bg-white rounded-lg shadow-lg border-t-4 border-blue-800">
                 <div className="p-3 bg-gray-100 border-b font-bold text-blue-900"><i className="fas fa-link mr-2"></i> महत्वाचे दुवे</div>
                 <ul className="divide-y">
                     {links.map(link => (
                         <li key={link.id}>
                             <a href={link.url} target="_blank" rel="noreferrer" className="block p-3 hover:bg-blue-50 text-gray-700 hover:text-blue-800 text-sm font-semibold transition">
                                 <i className="fas fa-angle-right mr-2 text-orange-500"></i> {link.title}
                             </a>
                         </li>
                     ))}
                 </ul>
             </div>
        </div>

        {/* Center Content: Members & Info */}
        <div className="lg:col-span-3 space-y-10 order-1 lg:order-2">
            
            {/* 1. Sarpanch & Upsarpanch (High Profile) */}
            <section>
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gov-primary font-serif uppercase tracking-widest">ग्रामपंचायत कार्यकारिणी</h2>
                    <div className="w-32 h-1 bg-orange-500 mx-auto mt-2"></div>
                </div>

                <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
                    {sarpanch && <div className="w-full md:w-80"><ProfileCard member={sarpanch} highlight={true} badgeColor="bg-orange-600" /></div>}
                    {upsarpanch && <div className="w-full md:w-80"><ProfileCard member={upsarpanch} highlight={true} badgeColor="bg-green-600" /></div>}
                </div>
            </section>

            {/* 2. Key Positions (Police Patil, Tantamukti, PESA) */}
            {(policePatil || tantamukti || pesaAdhyaksh) && (
            <section className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <SectionHeader title="महत्वाचे पदाधिकारी (Key Officials)" icon="fa-user-tie" color="text-blue-800" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {policePatil && <ProfileCard member={policePatil} badgeColor="bg-gray-800" />}
                    {tantamukti && <ProfileCard member={tantamukti} badgeColor="bg-red-700" />}
                    {pesaAdhyaksh && <ProfileCard member={pesaAdhyaksh} badgeColor="bg-green-800" />}
                </div>
            </section>
            )}

            {/* 3. Regular Members */}
            {regularMembers.length > 0 && (
            <section>
                <SectionHeader title="सन्माननीय सदस्य (Members)" icon="fa-users" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {regularMembers.map(m => (
                        <ProfileCard key={m.id} member={m} badgeColor="bg-blue-500" />
                    ))}
                </div>
            </section>
            )}

            {/* 4. Staff */}
            {staff.length > 0 && (
            <section>
                 <SectionHeader title="कर्मचारी वर्ग (Staff)" icon="fa-briefcase" color="text-gray-700" />
                 <div className="bg-white rounded-lg shadow overflow-hidden border">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-4">फोटो</th>
                                <th className="p-4">नाव</th>
                                <th className="p-4">पद</th>
                                <th className="p-4">संपर्क</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {staff.map(m => (
                                <tr key={m.id} className="hover:bg-gray-50">
                                    <td className="p-3"><img src={m.photoUrl} className="w-10 h-10 rounded-full object-cover" alt="staff" /></td>
                                    <td className="p-3 font-bold text-gray-800">{m.name}</td>
                                    <td className="p-3 text-sm text-gray-600">{m.position}</td>
                                    <td className="p-3 text-sm font-mono">{m.mobile}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </section>
            )}

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1a365d] text-white mt-16 border-t-8 border-orange-500">
        <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold text-2xl mb-4 font-serif text-orange-400">संपर्क माहिती</h4>
              <p className="text-gray-300 mb-2"><i className="fas fa-landmark mr-2"></i> {settings.panchayatName}</p>
              <p className="text-gray-300 text-sm leading-loose">
                मु. पो. {settings.address}<br/>
                तालुका: {settings.taluka}, जिल्हा: {settings.district}<br/>
                महाराष्ट्र राज्य - 442605
              </p>
              <p className="text-gray-300 mt-4"><i className="fas fa-phone mr-2"></i> {settings.contactNumber}</p>
            </div>
            
            <div className="text-center">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" className="w-16 h-auto mx-auto mb-4 invert brightness-0 opacity-50" />
                 <p className="text-sm text-gray-400">"लोकशाहीचा गाभा, ग्रामसभा"</p>
                 <div className="mt-4 flex justify-center gap-3">
                     <a href="#" className="bg-blue-600 p-2 rounded-full hover:bg-blue-500 transition"><i className="fab fa-facebook-f"></i></a>
                     <a href="#" className="bg-green-600 p-2 rounded-full hover:bg-green-500 transition"><i className="fab fa-whatsapp"></i></a>
                 </div>
            </div>

            <div>
              <h4 className="font-bold text-xl mb-4 font-serif text-orange-400">महत्वाच्या वेबसाईट</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                  <li><a href="https://rural.nic.in/" target="_blank" className="hover:text-white hover:underline">ग्रामीण विकास मंत्रालय</a></li>
                  <li><a href="https://rdd.maharashtra.gov.in/" target="_blank" className="hover:text-white hover:underline">ग्रामविकास विभाग महाराष्ट्र</a></li>
                  <li><a href="https://egramswaraj.gov.in/" target="_blank" className="hover:text-white hover:underline">ई-ग्राम स्वराज्य</a></li>
              </ul>
            </div>
        </div>
        <div className="bg-[#112240] py-4 text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} {settings.panchayatName}. All Rights Reserved. | Digital India Initiative
        </div>
      </footer>
      
    </div>
  );
};
