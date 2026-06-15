import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { user, loginWithGoogle, logout } = useAuth();
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (response: any) => {
    if (response.credential) {
      try {
        await loginWithGoogle(response.credential);
        navigate('/listings');
      } catch (err: any) {
        setError(err.response?.data?.error || 'Google sign-in failed');
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#f8f5fd] font-sans">
      {/* Abstract Background Elements */}
      <div 
        className="absolute bottom-0 right-0 h-full w-[60%] bg-[#3a205d] opacity-90" 
        style={{ clipPath: 'polygon(100% 40%, 100% 100%, 0 100%)' }}
      ></div>
      <div className="absolute -left-[20%] top-0 h-[600px] w-[600px] rounded-full bg-[#f0e6fa] blur-3xl"></div>
      
      {/* Light grid pattern overlay for texture */}
      <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4a2b75 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="relative mx-auto flex min-h-screen max-w-[1400px] flex-col items-center justify-center px-6 pb-32 pt-12 lg:flex-row lg:justify-between lg:px-16 xl:px-24">
        
        {/* Left Column: Typography & Actions */}
        <div className="z-10 flex w-full flex-col justify-center lg:w-[45%]">
          <h1 className="mb-4 text-7xl font-bold tracking-tight text-[#2d1b4e] sm:text-8xl" style={{ fontFamily: "'Playfair Display', serif" }}>
            ThriftCircle
          </h1>
          <h2 className="mb-6 text-[2.5rem] font-extrabold leading-tight text-[#1a1025] sm:text-5xl lg:text-[3.2rem]">
            Buy, sell and lend within VIT campus
          </h2>
          <p className="mb-10 max-w-md text-lg font-medium text-gray-600 sm:text-xl">
            Connect with fellow students, save money, and reduce waste with easy campus exchanges.
          </p>

          <div className="w-full max-w-md">
            {user ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 rounded-full bg-white/80 px-6 py-4 shadow-sm backdrop-blur-md">
                  {user.avatar_url && (
                    <img src={user.avatar_url} alt="Avatar" className="h-12 w-12 rounded-full border-2 border-purple-200" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-500">Welcome back,</p>
                    <p className="text-lg font-bold text-[#2d1b4e]">{user.name}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => navigate('/listings')}
                    className="flex-1 rounded-full bg-[#3a205d] px-6 py-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#2d1b4e] hover:shadow-[#3a205d]/30"
                  >
                    Go to Browse
                  </button>
                  <button
                    onClick={() => logout()}
                    className="rounded-full bg-white px-6 py-4 text-sm font-bold text-red-500 shadow-sm transition-all hover:bg-red-50"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-4">
                <div className="w-max overflow-hidden rounded-full shadow-[0_8px_30px_rgb(58,32,93,0.12)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgb(58,32,93,0.2)]">
                  <div className="bg-white px-2 py-1 flex items-center justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError('Google sign-in failed')}
                      useOneTap
                      shape="pill"
                      size="large"
                      text="signin_with"
                      theme="outline"
                      hosted_domain="vitstudent.ac.in"
                    />
                  </div>
                </div>
                {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
                
                <div className="pl-4">
                  <button
                    onClick={() => navigate('/listings')}
                    className="group text-[15px] font-semibold text-gray-600 transition-colors hover:text-[#3a205d]"
                  >
                    or <span className="underline underline-offset-4 font-bold text-[#3a205d]">Browse listings as a Guest</span> <span className="inline-block transition-transform group-hover:translate-x-1">&rarr;</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Illustration */}
        <div className="z-10 mt-12 flex w-full items-center justify-center lg:mt-0 lg:w-[50%] lg:justify-end">
          <div className="relative w-full max-w-lg lg:max-w-2xl xl:max-w-3xl">
            <img 
              src="/hero-illustration.png" 
              alt="Students exchanging items" 
              className="relative z-10 w-full object-contain mix-blend-multiply scale-110 lg:translate-x-12 opacity-95" 
            />
          </div>
        </div>
      </div>

      {/* Bottom Feature Bar */}
      <div className="absolute bottom-8 left-1/2 z-20 flex w-[90%] max-w-5xl -translate-x-1/2 flex-wrap items-center justify-between gap-4 rounded-3xl bg-white/95 px-6 py-4 shadow-[0_8px_40px_rgb(58,32,93,0.15)] backdrop-blur-xl md:flex-nowrap md:rounded-full md:px-12 md:py-6">
        
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0e6fa] text-[#4a2b75]">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <span className="text-xs font-bold tracking-widest text-[#3a205d]">STUDENT COMMUNITY</span>
        </div>

        <div className="hidden h-8 w-px bg-purple-200 md:block"></div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0e6fa] text-[#4a2b75]">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </div>
          <span className="text-xs font-bold tracking-widest text-[#3a205d]">CAMPUS EXCHANGES</span>
        </div>

        <div className="hidden h-8 w-px bg-purple-200 md:block"></div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0e6fa] text-[#4a2b75]">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <span className="text-xs font-bold tracking-widest text-[#3a205d]">SUSTAINABLE CHOICES</span>
        </div>

      </div>
    </div>
  );
};
