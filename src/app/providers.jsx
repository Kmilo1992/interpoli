'use client'

import { HeroUIProvider } from "@heroui/react";

const Providers = () => {
  return (
    <HeroUIProvider>
      {children}
    </HeroUIProvider>
  );
};

export default Providers;