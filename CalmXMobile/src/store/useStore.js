import { create } from 'zustand';

const useStore = create((set) => ({
    user: null,
    token: null,
    moods: [],
    setUser: (user) => set({ user }),
    setToken: (token) => set({ token }),
    setMoods: (moods) => set({ moods }),
    logout: () => set({ user: null, token: null, moods: [] }),
}));

export default useStore;
