// load-reveal.js — staggered fade-up of .reveal blocks. Vanilla IIFE.
// One mechanism covers both cases: the first IntersectionObserver callback is
// everything already on screen (the load stagger), every later one is a scroll
// reveal. Each block reveals once. Motion itself is gated in CSS.
(function () {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
        Array.prototype.forEach.call(els, function (el) { el.classList.add('in'); });
        return;
    }

    var io = new IntersectionObserver(function (entries, obs) {
        var n = 0;
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            obs.unobserve(entry.target);
            var el = entry.target;
            setTimeout(function () { el.classList.add('in'); }, 60 + (n++) * 60);
        });
    }, { rootMargin: '0px 0px -8% 0px' });

    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
})();
