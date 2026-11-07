import { createContext, useContext, useEffect, useState } from "react";
import { SettingsRepository, OrderRepository } from "@/repositories/storage";

const WorkshopContext = createContext(null);
export function WorkshopProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  async function load() {
    try {
      const [config, rows] = await Promise.all([SettingsRepository.load(), OrderRepository.list()]);
      setSettings(config);
      setOrders(rows);
      setError("");
    } catch (e) {
      setError(e.message || "Não foi possível abrir os dados locais.");
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function saveSettings(next) {
    await SettingsRepository.save(next);
    setSettings(next);
  }
  async function saveOrder(order, editing = false) {
    const saved = await OrderRepository.save(order, editing);
    setOrders(await OrderRepository.list());
    return saved;
  }
  return (
    <WorkshopContext.Provider
      value={{ settings, orders, error, reload: load, saveSettings, saveOrder }}
    >
      {children}
    </WorkshopContext.Provider>
  );
}
export function useWorkshop() {
  return useContext(WorkshopContext);
}
