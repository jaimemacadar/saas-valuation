import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const updateMobileState = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    mql.addEventListener("change", updateMobileState);

    // Configuração inicial
    updateMobileState();

    return () => mql.removeEventListener("change", updateMobileState);
  }, []);

  // Retorna false como fallback durante SSR/hidratação
  return isMobile ?? false;
}
