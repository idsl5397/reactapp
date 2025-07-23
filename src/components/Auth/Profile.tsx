'use client';
import React, { useState, useEffect, useRef } from 'react';
import { User, Lock, Eye, EyeOff, Save, Edit3, Shield, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import {Toaster} from "react-hot-toast";
import Breadcrumbs from "@/components/Breadcrumbs";

interface TextInputProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    icon?: React.ElementType;
}
interface PasswordInputProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    showPassword: boolean;
    onToggleShow: () => void;
    showStrength?: boolean;
}

const UserProfilePage = ({ isPasswordExpired = false }) => {
    // 個人資料狀態
    const [nickname, setNickname] = useState('王小明');
    const [mobile, setMobile] = useState('0912345678');
    const [unit, setUnit] = useState('資訊部');

    // 密碼修改狀態
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // 密碼顯示狀態
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // 頁面狀態
    const [activeTab, setActiveTab] = useState(isPasswordExpired ? 'password' : 'profile');
    const [isLoading, setIsLoading] = useState(false);

    // 用於自動滾動到密碼修改區塊
    const passwordSectionRef = useRef<HTMLDivElement | null>(null);

    const breadcrumbItems = [
        { label: "首頁", href: "/" },
        { label: "個人資料" }
    ];

    useEffect(() => {
        if (isPasswordExpired && passwordSectionRef.current) {
            passwordSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [isPasswordExpired]);

    // 處理個人資料更新
    const handleUpdateProfile = async () => {
        setIsLoading(true);
        try {
            // 模擬 API 調用
            await new Promise(resolve => setTimeout(resolve, 1500));
            // 這裡可以替換為 toast 通知
            alert('個人資料已成功更新！');
        } catch (error) {
            alert('更新失敗，請稍後再試');
        } finally {
            setIsLoading(false);
        }
    };

    // 處理密碼修改
    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            alert('請填寫所有密碼欄位');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('新密碼與確認密碼不一致');
            return;
        }

        if (newPassword.length < 8) {
            alert('新密碼長度至少需要8個字符');
            return;
        }

        setIsLoading(true);
        try {
            // 模擬 API 調用
            await new Promise(resolve => setTimeout(resolve, 1500));
            alert('密碼已成功修改！');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            alert('密碼修改失敗，請檢查舊密碼是否正確');
        } finally {
            setIsLoading(false);
        }
    };

    // 密碼強度檢查
    const getPasswordStrength = (password:any) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (strength <= 2) return { level: 'weak', text: '弱', color: 'bg-red-500' };
        if (strength === 3) return { level: 'medium', text: '中等', color: 'bg-yellow-500' };
        if (strength === 4) return { level: 'strong', text: '強', color: 'bg-green-500' };
        return { level: 'very-strong', text: '很強', color: 'bg-emerald-500' };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    const TextInput: React.FC<TextInputProps> = ({ label, value, onChange, placeholder, icon: Icon }) => (
        <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
                {label}
            </label>
            <div className="relative group">
                {Icon && (
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-200">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus:border-transparent bg-white hover:border-slate-300 text-slate-900 placeholder-slate-400`}
                />
            </div>
        </div>
    );

    const PasswordInput: React.FC<PasswordInputProps> = ({ label, value, onChange, showPassword, onToggleShow, showStrength = false }) => (
        <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
                {label}
            </label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Lock size={18} />
                </div>
                <input
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    className="w-full pl-12 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white hover:border-slate-300 text-slate-900"
                />
                <button
                    type="button"
                    onClick={onToggleShow}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200 focus:outline-none"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            {showStrength && value && (
                <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-600">密碼強度</span>
                        <span className={`text-xs font-semibold ${
                            passwordStrength.level === 'weak' ? 'text-red-600' :
                                passwordStrength.level === 'medium' ? 'text-yellow-600' :
                                    passwordStrength.level === 'strong' ? 'text-green-600' :
                                        'text-emerald-600'
                        }`}>
                            {passwordStrength.text}
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${passwordStrength.color}`}
                            style={{ width: `${Math.min((passwordStrength.level === 'weak' ? 25 : passwordStrength.level === 'medium' ? 50 : passwordStrength.level === 'strong' ? 75 : 100), 100)}%` }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                {/* 頁面標題區域 */}
                <div className="bg-gradient-to-r from-slate-50 border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <Breadcrumbs items={breadcrumbItems}/>
                        <div className="mt-6">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                個人資料設定
                            </h1>
                            <div
                                className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mt-4"></div>
                        </div>

                    </div>
                </div>

                <div className="max-w-5xl mx-auto p-6">
                    {isPasswordExpired && (
                        <div
                            className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl shadow-sm">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <AlertTriangle className="w-6 h-6 text-red-600"/>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-red-900">密碼已過期</h3>
                                    <p className="text-red-700 mt-1">為了您的帳戶安全，請立即修改密碼以繼續使用服務</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div
                        className="bg-white/80 rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
                        {/* Tab 導航 */}
                        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200/60">
                            <nav className="flex space-x-1 px-8 py-2">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-medium text-sm ${
                                        activeTab === 'profile'
                                            ? 'bg-white shadow-md text-indigo-600 border border-slate-200/60'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                                    }`}
                                >
                                    <Edit3 size={18}/>
                                    <span>個人資料</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('password')}
                                    className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-medium text-sm relative ${
                                        activeTab === 'password'
                                            ? 'bg-white shadow-md text-indigo-600 border border-slate-200/60'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                                    } ${isPasswordExpired ? '!text-red-600' : ''}`}
                                >
                                    <Shield size={18}/>
                                    <span>密碼安全</span>
                                    {isPasswordExpired && (
                                        <div
                                            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                    )}
                                </button>
                            </nav>
                        </div>

                        <div className="p-8">
                            {/* 個人資料表單 */}
                            {activeTab === 'profile' && (
                                <div className="max-w-2xl">
                                    <div className="mb-8">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <Sparkles className="w-6 h-6 text-indigo-500"/>
                                            <h2 className="text-2xl font-bold text-slate-900">個人資料</h2>
                                        </div>
                                        <p className="text-slate-600">更新您的基本資訊，讓系統更好地為您服務</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <TextInput
                                                label="顯示名稱"
                                                value={nickname}
                                                onChange={(e) => setNickname(e.target.value)}
                                                placeholder="請輸入您的顯示名稱"
                                                icon={User}
                                            />
                                        </div>

                                        <div>
                                            <TextInput
                                                label="聯絡電話"
                                                value={mobile}
                                                onChange={(e) => setMobile(e.target.value)}
                                                placeholder="請輸入手機號碼"
                                            />
                                        </div>
                                    </div>

                                    <TextInput
                                        label="所屬單位"
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                        placeholder="請輸入您的所屬單位"
                                    />

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="button"
                                            onClick={handleUpdateProfile}
                                            disabled={isLoading}
                                            className="flex items-center space-x-3 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div
                                                        className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                                                    <span>儲存中...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={18}/>
                                                    <span>儲存變更</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* 密碼修改表單 */}
                            {activeTab === 'password' && (
                                <div ref={passwordSectionRef} className="max-w-2xl">
                                    <div className="mb-8">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <Shield className="w-6 h-6 text-emerald-500"/>
                                            <h2 className="text-2xl font-bold text-slate-900">
                                                密碼安全
                                                {isPasswordExpired && (
                                                    <span
                                                        className="ml-3 text-sm text-red-600 bg-red-100 px-3 py-1 rounded-full">必須修改</span>
                                                )}
                                            </h2>
                                        </div>
                                        <p className="text-slate-600">定期更新密碼有助於保護您的帳戶安全</p>
                                    </div>

                                    <div className="space-y-6">
                                        <PasswordInput
                                            label="目前密碼"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            showPassword={showOldPassword}
                                            onToggleShow={() => setShowOldPassword(!showOldPassword)}
                                        />

                                        <PasswordInput
                                            label="新密碼"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            showPassword={showNewPassword}
                                            onToggleShow={() => setShowNewPassword(!showNewPassword)}
                                            showStrength={true}
                                        />

                                        <PasswordInput
                                            label="確認新密碼"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            showPassword={showConfirmPassword}
                                            onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
                                        />

                                        {/* 密碼要求提示 */}
                                        <div
                                            className="bg-gradient-to-r from-slate-50 to-indigo-50/50 p-6 rounded-2xl border border-slate-200/60">
                                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                                                <CheckCircle className="w-5 h-5 text-emerald-500 mr-2"/>
                                                密碼安全要求
                                            </h4>
                                            <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-700">
                                                <div
                                                    className={`flex items-center space-x-2 ${newPassword.length >= 12 ? 'text-emerald-600' : ''}`}>
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${newPassword.length >= 12 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                                    <span>至少12個字元</span>
                                                </div>
                                                <div
                                                    className={`flex items-center space-x-2 ${/[A-Z]/.test(newPassword) ? 'text-emerald-600' : ''}`}>
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                                    <span>包含大寫字母</span>
                                                </div>
                                                <div
                                                    className={`flex items-center space-x-2 ${/[a-z]/.test(newPassword) ? 'text-emerald-600' : ''}`}>
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${/[a-z]/.test(newPassword) ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                                    <span>包含小寫字母</span>
                                                </div>
                                                <div
                                                    className={`flex items-center space-x-2 ${/[0-9]/.test(newPassword) ? 'text-emerald-600' : ''}`}>
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                                    <span>包含數字</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <button
                                                type="button"
                                                onClick={handleChangePassword}
                                                disabled={isLoading}
                                                className="flex items-center space-x-3 px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <div
                                                            className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                                                        <span>修改中...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Shield size={18}/>
                                                        <span>更新密碼</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserProfilePage;