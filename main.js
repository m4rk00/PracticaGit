import gsap from "https://cdn.skypack.dev/gsap@3.10.4";
import ScrollTrigger from "https://cdn.skypack.dev/gsap@3.10.4/dist/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

/* --
  Known issue: On mobile the first & last cards will never have their titles visible because they will not reach the trigger position 
  It would be a good solution to show the title of those card when reach the top or the bottom of the page.
  -- */

let isTouchDevice = window.matchMedia('(hover: none)').matches;

/* Add mouse listeners on every card */
const elLinks = document.querySelectorAll('a');
const elItems = document.querySelectorAll('li');
if (!isTouchDevice) {
    elLinks.forEach(elLink => {
        elLink.addEventListener('mouseleave', () => onLinkLeave(elLink));
        elLink.addEventListener('mouseenter', () => onLinkEnter(elLink));
    });
}

/* Create the fade-in animation of the cards */
elItems.forEach(elItem => {
    /* Create a fade-in of the card title for touch devices */
    if (isTouchDevice) {
        titleFadeIn(elItem);
    }

    // Skip the transition if the element is already in the viewport
    const bbox = elItem.getBoundingClientRect();
    if (bbox.bottom > 0 && bbox.top < window.innerHeight) {
        // Fade in the card when the image is loaded
        const elImage = elItem.querySelector('img');
        // If the image is already loaded (from the cache), fade-in instantly
        if (elImage.complete) {
            gsap.to(elItem, {
                opacity: 1,
                duration: 0.5,
                ease: 'power1.out',
                delay: Math.random() * 0.5 + 0.1
            });
        } else {
            // Else, wait for the image to load before fade-ing in
            elImage.addEventListener('load', () => {
                gsap.to(elItem, {
                    opacity: 1,
                    duration: 0.5,
                    ease: 'power1.out',
                    delay: Math.random() * 0.5 + 0.1
                });
            });
        }
        return;
    }

    gsap.from(elItem, {
        y: innerWidth > 960 ? 150 : 50,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
            once: true,
            trigger: elItem,
            start: "top bottom",
            end: "top bottom",
            toggleActions: "play none play play"
        }
    });
    gsap.fromTo(elItem, {
        opacity: 0
    }, {
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
            once: true,
            trigger: elItem,
            start: "top bottom",
            end: "top bottom",
            toggleActions: "play none play play"
        }
    });
});

function titleFadeIn(elItem) {
    const elTitle = elItem.querySelector('span');
    gsap.set(elTitle, {
        y: 0
    });
    gsap.fromTo(elTitle, {
        opacity: 0
    }, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.inOut",
        scrollTrigger: {
            trigger: elItem,
            start: "center 75%",
            end: "center 40%",
            toggleActions: "play reverse restart reverse"
        }
    });
}

/* When the mouse is entering */
function onLinkEnter(elHoveredLink) {
    /* Remove the blur & all translations on the hover card */
    gsap.to(elHoveredLink, {
        filter: 'blur(0px)',
        x: 0,
        y: 0,
        scale: 1.2,
        overwrite: true,
        duration: 0.6,
        ease: 'power3.out'
    });

    /* Move the elements away from the hovered card */
    elLinks.forEach(elLink => {
        // Do nothing with the hovered link
        if (elLink === elHoveredLink) return;
        // Calculate the x & y translations
        let x = (elLink.bbox.x - elHoveredLink.bbox.x) * 0.2;
        let y = (elLink.bbox.y - elHoveredLink.bbox.y) * 0.2;
        gsap.to(elLink, {
            filter: 'blur(15px)',
            scale: 0.8,
            x,
            y,
            overwrite: true,
            duration: 0.6,
            ease: 'power2.out'
        });
    });
}

/* When the mouse is leaving a card */
function onLinkLeave(elLink) {
    gsap.to(elLinks, {
        filter: 'blur(0px)',
        x: 0,
        y: 0,
        scale: 1,
        delay: 0.1,
        overwrite: true
    });
}

/* Calculate the bounding rects of each card */
/* We do it only on resize to avoid calculating it on every hover */
function calculateBboxes() {
    elLinks.forEach(elLink => {
        elLink.bbox = elLink.getBoundingClientRect();
    });
}
window.addEventListener('resize', calculateBboxes);
const resizeObserver = new ResizeObserver(() => {
    calculateBboxes();
});
elLinks.forEach(elLink => {
    resizeObserver.observe(elLink);
});
calculateBboxes();