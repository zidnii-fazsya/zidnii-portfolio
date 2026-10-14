
'use client';

import {
    useRef,
    useLayoutEffect,
    useState,
} from 'react';

import {
    motion,
    useScroll,
    useSpring,
    useTransform,
    useMotionValue,
    useVelocity,
    useAnimationFrame,
} from 'motion/react';

import './ScrollVelocity.css';

function useElementWidth(ref) {
    const [width, setWidth] = useState(0);

    useLayoutEffect(() => {
        const element = ref.current;

        if (!element) return undefined;

        const updateWidth = () => {
            if (ref.current) {
                setWidth(ref.current.offsetWidth);
            }
        };

        updateWidth();

        const observer = new ResizeObserver(updateWidth);
        observer.observe(element);

        return () => observer.disconnect();
    }, [ref]);

    return width;
}

function VelocityText({
    children,
    baseVelocity,
    scrollContainerRef,
    className,
    damping,
    stiffness,
    numCopies,
    velocityMapping,
    parallaxClassName,
    scrollerClassName,
    parallaxStyle,
    scrollerStyle,
}) {
    const baseX = useMotionValue(0);
    const directionFactor = useRef(1);

    const scrollOptions = scrollContainerRef
        ? { container: scrollContainerRef }
        : {};

    const { scrollY } = useScroll(scrollOptions);
    const scrollVelocity = useVelocity(scrollY);

    const smoothVelocity = useSpring(scrollVelocity, {
        damping,
        stiffness,
    });

    const velocityFactor = useTransform(
        smoothVelocity,
        velocityMapping.input,
        velocityMapping.output,
        { clamp: false }
    );

    const copyRef = useRef(null);
    const copyWidth = useElementWidth(copyRef);

    const x = useTransform(baseX, (value) => {
        if (copyWidth <= 0) return '0px';

        const wrapped =
            ((value % copyWidth) + copyWidth) % copyWidth;

        return `${-wrapped}px`;
    });

    useAnimationFrame((_, delta) => {
        let direction = directionFactor.current;
        const factor = velocityFactor.get();

        if (factor < 0) {
            direction = -1;
        } else if (factor > 0) {
            direction = 1;
        }

        directionFactor.current = direction;

        const movement =
            direction *
            baseVelocity *
            (delta / 1000) *
            (1 + Math.abs(factor));

        baseX.set(baseX.get() + movement);
    });

    return (
        <div
            className={parallaxClassName}
            style={parallaxStyle}
        >
            <motion.div
                className={scrollerClassName}
                style={{
                    x,
                    ...scrollerStyle,
                }}
            >
                {Array.from(
                    { length: Math.max(2, numCopies) },
                    (_, index) => (
                        <span
                            className={className}
                            key={index}
                            ref={index === 0 ? copyRef : null}
                        >
                            {children}&nbsp;
                        </span>
                    )
                )}
            </motion.div>
        </div>
    );
}

export default function ScrollVelocity({
    scrollContainerRef,
    texts = [],
    velocity = 100,
    className = '',
    damping = 50,
    stiffness = 400,
    numCopies = 6,
    velocityMapping = {
        input: [0, 1000],
        output: [0, 5],
    },
    parallaxClassName = 'parallax',
    scrollerClassName = 'scroller',
    parallaxStyle,
    scrollerStyle,
}) {
    if (!Array.isArray(texts) || texts.length === 0) {
        return null;
    }

    return (
        <div className="scroll-velocity-container">
            {texts.map((text, index) => (
                <VelocityText
                    key={`${index}-${text}`}
                    scrollContainerRef={scrollContainerRef}
                    baseVelocity={
                        index % 2 === 0 ? velocity : -velocity
                    }
                    className={className}
                    damping={damping}
                    stiffness={stiffness}
                    numCopies={numCopies}
                    velocityMapping={velocityMapping}
                    parallaxClassName={parallaxClassName}
                    scrollerClassName={scrollerClassName}
                    parallaxStyle={parallaxStyle}
                    scrollerStyle={scrollerStyle}
                >
                    {text}
                </VelocityText>
            ))}
        </div>
    );
}
