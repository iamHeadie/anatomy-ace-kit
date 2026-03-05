import { createContext, useContext, useState } from "react";

export type ViewerMode = "moveable" | "labelled";

interface ViewModeContextType {
  viewMode: ViewerMode;
  setViewMode: (mode: ViewerMode) => void;
}

const ViewModeContext = createContext<ViewModeContextType>({
  viewMode: "moveable",
  setViewMode: () => {},
});

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewerMode>("moveable");
  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeContext);
}
