import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const LoginForm = ({ role }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            console.log("Google Login success, sending to backend...");
            const response = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tokenId: credentialResponse.credential }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || 'Google Login failed');
                return;
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));

            if (data.role === 'patient') navigate('/patient');
            else if (data.role === 'doctor') navigate('/doctor');
            else if (data.role === 'guardian') navigate('/guardian');
        } catch (err) {
            console.error('Google Login error:', err);
            alert('Failed to connect to server');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, password: formData.password }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || 'Login failed');
                return;
            }

            // Store token and redirect
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));

            if (data.role === 'patient') navigate('/patient');
            else if (data.role === 'doctor') navigate('/doctor');
            else if (data.role === 'guardian') navigate('/guardian');
        } catch (err) {
            console.error('Login error:', err);
            alert('Failed to connect to server');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="text-center sm:text-left">
                <h1 className="text-3xl font-black text-slate-800 tracking-tighter mb-2">Secure Portal Access</h1>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">Biometric-Shielded Login</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                            <Mail size={20} />
                        </div>
                        <input
                            type="email"
                            required
                            className="block w-full pl-12 pr-4 py-4 md:py-5 border border-slate-100 rounded-[1.5rem] md:rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 hover:bg-white focus:bg-white text-sm md:text-base font-medium placeholder:text-slate-300"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                            <Lock size={20} />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            className="block w-full pl-12 pr-12 py-4 md:py-5 border border-slate-100 rounded-[1.5rem] md:rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 hover:bg-white focus:bg-white text-sm md:text-base font-medium placeholder:text-slate-300"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-indigo-600 transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between text-[11px] md:text-xs">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-200 rounded-lg cursor-pointer"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-slate-400 font-bold uppercase tracking-wider cursor-pointer">
                            Keep me logged in
                        </label>
                    </div>
                    <a href="#" className="font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">
                        Recovery?
                    </a>
                </div>

                <button
                    type="submit"
                    className="w-full flex justify-center py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-slate-200 text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all active:scale-95"
                >
                    Initiate Session
                </button>
            </form>

            <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="px-4 bg-white text-[10px] md:text-[11px] font-black text-slate-300 uppercase tracking-widest">or bridge with</span>
                </div>
            </div>

            <div className="flex justify-center">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => alert('Google Login Failed')}
                    useOneTap
                    theme="outline"
                    shape="pill"
                    width="100%"
                />
            </div>

            <div className="text-center mt-8">
                <p className="text-xs md:text-sm text-slate-500 font-medium">
                    New to the platform?{' '}
                    <Link to="/register" className="font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest ml-1">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;
