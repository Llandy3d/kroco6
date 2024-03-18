import { createContext, useContext } from "react";

const Context = createContext(false);

interface DragEnabledProps {
  children: React.ReactNode;
}

function DragEnabled({ children }: DragEnabledProps) {
  return <Context.Provider value={true}>{children}</Context.Provider>;
}

function useDragEnabled() {
  return useContext(Context);
}

export { DragEnabled, useDragEnabled };
