import React from 'react';
import { User, Stethoscope, Users } from 'lucide-react';

const RoleSelector = ({ selectedRole, onSelectRole }) => {
    const roles = [
        { id: 'patient', label: 'Patient', icon: User, color: 'bg-rose-100 text-rose-600' },
        { id: 'doctor', label: 'Doctor', icon: Stethoscope, color: 'bg-blue-100 text-blue-600' },
        { id: 'guardian', label: 'Guardian', icon: Users, color: 'bg-green-100 text-green-600' },
    ];

    return (
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-10">
            {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                    <button
                        key={role.id}
                        onClick={() => onSelectRole(role.id)}
                        className={`
                            flex flex-col items-center justify-center p-5 rounded-[2rem] transition-all duration-500 w-[6.5rem] h-[6.5rem] md:w-32 md:h-32 border-2 group
                            ${isSelected ? 'border-indigo-500 bg-white shadow-2xl shadow-indigo-100 scale-105 active:scale-95' : 'border-slate-50 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-white active:scale-95'}
                        `}
                        role="radio"
                        aria-checked={isSelected}
                    >
                        <div className={`p-3 rounded-2xl mb-3 transition-colors duration-300 ${isSelected ? role.color : 'bg-white text-slate-300 group-hover:bg-slate-50'}`}>
                            <Icon size={24} />
                        </div>
                        <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest transition-colors ${isSelected ? 'text-slate-800' : 'text-slate-400'}`}>
                            {role.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default RoleSelector;
