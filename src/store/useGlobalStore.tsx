import { create } from 'zustand';
import { persist } from 'zustand/middleware';  // 需要引入 persist middleware

interface user{
    email: string;
    username: string;
}

