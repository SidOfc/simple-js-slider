class Slider {
    constructor({selector, images, direction = 'ltr', speed = 3.5, auto = true}) {
        this.indexModifier    = direction.toLowerCase() === 'ltr' ? 1 : -1;
        this.container        = document.querySelector(selector);
        this.speed            = speed;
        this.auto             = auto;
        this.currentIndex     = 0;
        this.containerClass   = Slider.className();
        this.slideClass       = Slider.slideClassName();
        this.activeSlideClass = Slider.activeSlideClassName();

        this.container.classList.add(this.containerClass);
        this.style(this.container, {
            position: pos => pos == 'static' ? 'relative' : pos
        });

        images.forEach(url => {
            const img  = new Image();
            img.onload = this.insert.bind(this, img);
            img.src    = url;
        });
    }

    // next transitions between current slide and next slide
    next() {
        let nextIndex = this.currentIndex + this.indexModifier;

        if (nextIndex >= this.container.children.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = this.container.children.length - 1;
        if (this.auto) this.__timeout = setTimeout(this.next.bind(this), this.speed * 1000);

        // toggle classes off
        document.querySelector(`.${this.activeSlideClass}`).classList.remove(this.activeSlideClass);
        this.container.children[nextIndex].classList.add(this.activeSlideClass);

        this.currentIndex = nextIndex;
    }

    // insert an [Image img] into [Node this.container]
    // as a [Node] with a background-image.
    insert(img) {
        // style and append a newly created div element
        const slide = this.style(document.createElement('div'), {
            backgroundImage: `url(${img.src})`
        });

        slide.classList.add(this.slideClass);
        this.container.appendChild(slide);

        if (this.container.children.length === 1) {
            slide.classList.add(this.activeSlideClass);
            this.__timeout = setTimeout(this.next.bind(this), this.speed * 1000);
        }
    }

    // style a [Node node] with given [Object styles] of properties
    // when a value of a key is a function, it will be executed
    // given that styles' current value for that key as first argument.
    style(node, styles) {
        const nodeCss = window.getComputedStyle ? getComputedStyle(node, null)
                                                : node.currentStyle;

        Object.entries(styles).forEach(([prop, value]) => {
            if (typeof value === 'function') {
                value = value.call(this, nodeCss[prop]);
            }

            node.style[prop] = value;
        });

        return node;
    }

    static className() {
        if (this.__className) return this.__className;
        return this.__className = `slider-${Date.now()}`;
    }

    static slideClassName() {
        if (this.__slideClassName) return this.__slideClassName;
        return this.__slideClassName = `${this.className()}__slide`;
    }

    static activeSlideClassName() {
        if (this.__activeSlideClassName) return this.__activeSlideClassName;
        return this.__activeSlideClassName = `${this.className()}__slide--active`;
    }

    static stylesheetClassName() {
        if (this.__stylesheetClassName) return this.__stylesheetClassName;
        return this.__stylesheetClassName = `${this.className()}-stylesheet`;
    }

    static stylesheet() {
        if (document.querySelector(`.${this.stylesheetClassName()}`)) return;

        const css        = document.createElement('style');
        css.classList.add(this.stylesheetClassName());
        css.type         = 'text/css';
        css.innerText    = `
            .${this.slideClassName()} {
                background-position: center;
                background-size:     cover;
                background-repeat:   no-repeat;

                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                right: 0;
                opacity: 0;
                transition: opacity 2s ease-in-out;
            }

            .${this.activeSlideClassName()} {
                opacity: 1;
            }
        `.replace(/\n/g, ' ');

        document.querySelector('head').appendChild(css);
    }

    // alternative way of initializing
    static init(...args) {
        this.stylesheet();
        new this(...args);
    }
}
