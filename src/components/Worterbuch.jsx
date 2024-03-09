import React from "react";

const WorterbuchContext = React.createContext();
export default function Worterbuch({ children, wb }) {
  return (
    <WorterbuchContext.Provider value={wb}>
      {children}
    </WorterbuchContext.Provider>
  );
}

export function useWb() {
  return React.useContext(WorterbuchContext);
}
