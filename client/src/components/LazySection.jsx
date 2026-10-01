import React, { useEffect, useRef, useState } from "react";

const LazySection = ({
  children,
  minHeight = "300px",
  rootMargin = "300px",
}) => {
  const sectionRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);

          // Stop observing after first render
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold: 0.01,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin]);

  return (
    <div
      ref={sectionRef}
      style={{
        minHeight: shouldRender ? "auto" : minHeight,
      }}
    >
      {shouldRender ? children : null}
    </div>
  );
};

export default LazySection;