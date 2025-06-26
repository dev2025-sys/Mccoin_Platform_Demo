import { create } from "zustand";

type TabStore = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export const useTabStore = create<TabStore>((set) => ({
  activeTab: "profile",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
