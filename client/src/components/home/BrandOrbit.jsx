import React, { useRef, useEffect } from "react";
import "../../style/componentsCss/home/brandOrbit.css";

const BrandOrbit = () => {
  const orbitRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const orbit = orbitRef.current;

    if (!orbit) {
      return;
    }

    const handleMouseMove = (event) => {
      const rect = orbit.getBoundingClientRect();

      const mouseX =
        (event.clientX - rect.left) / rect.width;

      const mouseY =
        (event.clientY - rect.top) / rect.height;

      const x = (mouseX - 0.5) * 2;
      const y = (mouseY - 0.5) * 2;

      const rotateX = y * -10;
      const rotateY = x * 10;

      const stretchX = 1 + Math.abs(x) * 0.08;
      const stretchY = 1 + Math.abs(y) * 0.04;

      const moveX = x * 12;
      const moveY = y * 8;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        orbit.style.setProperty(
          "--orbit-rotate-x",
          `${rotateX}deg`
        );

        orbit.style.setProperty(
          "--orbit-rotate-y",
          `${rotateY}deg`
        );

        orbit.style.setProperty(
          "--orbit-scale-x",
          stretchX
        );

        orbit.style.setProperty(
          "--orbit-scale-y",
          stretchY
        );

        orbit.style.setProperty(
          "--orbit-move-x",
          `${moveX}px`
        );

        orbit.style.setProperty(
          "--orbit-move-y",
          `${moveY}px`
        );

        orbit.style.setProperty(
          "--orbit-glow",
          `${0.12 + Math.abs(x) * 0.18}`
        );
      });
    };

    const handleMouseLeave = () => {
      orbit.style.setProperty(
        "--orbit-rotate-x",
        "0deg"
      );

      orbit.style.setProperty(
        "--orbit-rotate-y",
        "0deg"
      );

      orbit.style.setProperty(
        "--orbit-scale-x",
        "1"
      );

      orbit.style.setProperty(
        "--orbit-scale-y",
        "1"
      );

      orbit.style.setProperty(
        "--orbit-move-x",
        "0px"
      );

      orbit.style.setProperty(
        "--orbit-move-y",
        "0px"
      );

      orbit.style.setProperty(
        "--orbit-glow",
        "0.12"
      );
    };

    orbit.addEventListener(
      "mousemove",
      handleMouseMove
    );

    orbit.addEventListener(
      "mouseleave",
      handleMouseLeave
    );

    return () => {
      orbit.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      orbit.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );

      if (animationFrameRef.current) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
      }
    };
  }, []);

  return (
    <section className="brand-orbit-section">

      {/* ================= TITLE ================= */}

      <div className="brand-orbit-title">

        <span></span>

        BRANDS YOU'LL FIND

        <span></span>

      </div>


      {/* ================= ORBIT ================= */}

      <div
        className="brand-orbit"
        ref={orbitRef}
      >

        {/* Mouse glow */}

        <div className="brand-mouse-glow"></div>


        {/* ================= OUTER RING ================= */}

        <div className="brand-ring brand-ring-outer">

          <div className="brand-name brand-one">
            APPLE
          </div>

          <div className="brand-name brand-two">
            SAMSUNG
          </div>

          <div className="brand-name brand-three">
            NIKE
          </div>

          <div className="brand-name brand-four">
            SONY
          </div>

          <div className="brand-name brand-five">
            ADIDAS
          </div>

          <div className="brand-name brand-six">
            JBL
          </div>

        </div>


        {/* ================= INNER RING ================= */}

        <div className="brand-ring brand-ring-inner">

          <div className="brand-name inner-one">
            PUMA
          </div>

          <div className="brand-name inner-two">
            LG
          </div>

          <div className="brand-name inner-three">
            HP
          </div>

          <div className="brand-name inner-four">
            SONY
          </div>

        </div>


        {/* ================= CENTER ================= */}

        <div className="brand-orbit-center">

          <span>
            SHOP
          </span>

          <strong>
            SHOPNET
          </strong>

          <small>
            DISCOVER MORE
          </small>

        </div>

      </div>


      {/* ================= HINT ================= */}

      <div className="brand-orbit-hint">
        MOVE YOUR MOUSE AROUND
      </div>

    </section>
  );
};

export default BrandOrbit;