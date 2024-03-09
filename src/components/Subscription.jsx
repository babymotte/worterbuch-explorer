import React from "react";

const SubscriptionContext = React.createContext();

export default function Subscription({ children, subscribe, unsubscribe }) {
  return (
    <SubscriptionContext.Provider value={{ subscribe, unsubscribe }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return React.useContext(SubscriptionContext);
}
