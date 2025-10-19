import { useState, useEffect } from "react";

export function useOpeningDelay() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // No delay on mobile
      setShowContent(true);
    } else {
      // 1 second delay on desktop for opening sequence
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  return showContent;
}
