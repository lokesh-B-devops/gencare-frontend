import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Phone, Mail, Lock } from 'lucide-react';
import RoleSelector from '../components/RoleSelector';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'patient',
        phone: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelect = (role) => {
        setFormData({ ...formData, role });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || 'Registration failed');
                return;
            }

            alert('Registration successful! Please login.');
            navigate('/');
        } catch (err) {
            console.error('Registration error:', err);
            alert('Failed to connect to server');
        }
    };

    return (
        <div className="min-h-screen bg-white md:bg-slate-50/50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
                <div className="flex justify-center mb-6">
                    <div className="h-16 w-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-slate-200 animate-bounce-slow">
                        <UserPlus className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h2 className="text-center text-4xl font-black text-slate-800 tracking-tighter mb-2">
                    Create Identity
                </h2>
                <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    Join the Elite GENCARE Network
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="bg-white py-10 px-6 md:px-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] sm:rounded-[3rem] border border-slate-50">
                    <form className="space-y-8" onSubmit={handleSubmit}>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Select Role</label>
                            <RoleSelector selectedRole={formData.role} onSelectRole={handleRoleSelect} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                                    Full Name
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        className="block w-full pl-12 pr-4 py-4 border border-slate-100 rounded-[1.2rem] md:rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 hover:bg-white focus:bg-white text-sm font-medium placeholder:text-slate-300"
                                        placeholder="Jane Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="phone" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                                    Mobile Number
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                        <Phone size={18} />
                                    </div>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        className="block w-full pl-12 pr-4 py-4 border border-slate-100 rounded-[1.2rem] md:rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 hover:bg-white focus:bg-white text-sm font-medium placeholder:text-slate-300"
                                        placeholder="+1 (555) 000-0000"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                                Email Registry
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full pl-12 pr-4 py-4 border border-slate-100 rounded-[1.2rem] md:rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 hover:bg-white focus:bg-white text-sm font-medium placeholder:text-slate-300"
                                    placeholder="patient@gencare.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                                Secure Key
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="block w-full pl-12 pr-4 py-4 border border-slate-100 rounded-[1.2rem] md:rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 hover:bg-white focus:bg-white text-sm font-medium placeholder:text-slate-300"
                                    placeholder="••••••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex justify-center py-5 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl shadow-indigo-100 text-xs font-black uppercase tracking-[0.2em] text-white bg-slate-900 hover:bg-slate-800 transition-all active:scale-95 duration-300"
                        >
                            Register Securely
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-50 text-center">
                        <p className="text-xs text-slate-400 font-medium">
                            Already a member?{' '}
                            <Link to="/" className="font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest ml-1">
                                Authorize
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
