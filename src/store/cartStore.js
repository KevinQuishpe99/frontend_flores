import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // [{ arregloId, arreglo, cantidad, notas }]
      
      addItem: (arreglo) => {
        const items = get().items;
        const existingItem = items.find(item => item.arregloId === arreglo.id);
        
        if (existingItem) {
          // Si ya existe, aumentar cantidad
          set({
            items: items.map(item =>
              item.arregloId === arreglo.id
                ? { ...item, cantidad: item.cantidad + 1 }
                : item
            )
          });
        } else {
          // Si no existe, agregar nuevo
          set({
            items: [...items, {
              arregloId: arreglo.id,
              arreglo: arreglo,
              cantidad: 1,
              notas: ''
            }]
          });
        }
      },
      
      removeItem: (arregloId) => {
        set({
          items: get().items.filter(item => item.arregloId !== arregloId)
        });
      },
      
      updateQuantity: (arregloId, cantidad) => {
        if (cantidad <= 0) {
          get().removeItem(arregloId);
          return;
        }
        
        set({
          items: get().items.map(item =>
            item.arregloId === arregloId
              ? { ...item, cantidad }
              : item
          )
        });
      },
      
      updateNotas: (arregloId, notas) => {
        set({
          items: get().items.map(item =>
            item.arregloId === arregloId
              ? { ...item, notas }
              : item
          )
        });
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotal: () => {
        return get().items.reduce((total, item) => {
          return total + (item.arreglo.costo * item.cantidad);
        }, 0);
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.cantidad, 0);
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

