class Slider {
    constructor({selector, images, direction = 'ltr', speed = 3.5, auto = true, pager = true, color = '#09c', pagerOutside = false, sync = false}) {
        this.indexModifier = direction.toLowerCase() === 'ltr' ? 1 : -1;
        this.container     = document.querySelector(selector);
        this.speed         = speed;
        this.auto          = auto;
        this.currentIndex  = 0;
        this.color         = color[0] === '#' ? color : `#${color}`;
        this.inner         = document.createElement('div');
        this.pagerOutside  = pagerOutside;
        this.sync          = sync;

        this.inner.classList.add(Slider.innerClassName);
        this.container.classList.add(Slider.className);
        this.container.appendChild(this.inner);
        this.style(this.container, {
            position:     pos          => pos == 'static' ? 'relative' : pos,
            marginBottom: marginBottom => pagerOutside    ? '3.5rem'   : marginBottom
        });

        if (pager) {
            this.orbContainer = this.style(document.createElement('div'), {
                transform: transform => pagerOutside ? 'translate3d(0, calc(100% + 1.75rem), 0)' : transform
            });
            this.orbContainer.classList.add(Slider.orbContainerClassName);
            this.container.appendChild(this.orbContainer);
        }

        images.forEach(settings => {
            const obj  = typeof settings === 'string' ? {url: settings} : settings;
            const img  = new Image();
            if (this.sync) {
                this.insert(img, obj);
            } else {
                img.onload = this.insert.bind(this, img, obj);
            }
            img.src = obj.url;
        });
    }

    // next transitions between current slide and next slide
    next(index = NaN) {
        let nextIndex  = !isNaN(index) ? index : this.currentIndex + this.indexModifier;
        let slideCount = this.inner.children.length;

        if (slideCount === 1) return;

        if (nextIndex >= slideCount) nextIndex = 0;
        if (nextIndex < 0) nextIndex = slideCount - 1;
        clearTimeout(this.__timeout);
        if (this.auto) this.__timeout = setTimeout(this.next.bind(this), this.speed * 1000);

        // toggle classes off
        document.querySelector(`.${Slider.activeSlideClassName}`).classList.remove(Slider.activeSlideClassName);
        this.inner.children[nextIndex].classList.add(Slider.activeSlideClassName);

        if (this.orbContainer) {
            document.querySelector(`.${Slider.activeOrbClassName}`).classList.remove(Slider.activeOrbClassName);
            this.orbContainer.children[nextIndex].classList.add(Slider.activeOrbClassName);
        }

        this.currentIndex = nextIndex;
    }

    // insert an [Image img] into [Node this.inner]
    // as a [Node] with a background-image.
    insert(img, properties) {
        // style and append a newly created div element
        const first = this.inner.children.length === 0;
        const slide = this.style(document.createElement('div'), {
            backgroundImage: `url(${properties.url})`,
            backgroundSize:  properties.contain ? 'contain' : 'cover'
        });

        if (properties.banner) {
            const text = this.style(document.createElement('span'), {
                padding:         '0.4rem 0',
                backgroundColor: this.color,
                color:           '#fff',
                textTransform:   'uppercase',
                fontSize:        '1.5rem',
                boxShadow:       `0.4rem 0 0 ${this.color}, -0.4rem 0 0 ${this.color}`,
                lineHeight:      '2'
            });

            const banner = this.style(document.createElement('div'), {
                position:  'absolute',
                bottom:    properties.banner.bottom ? (this.pagerOutside ? '0.9rem' : '3.15rem') : 'auto',
                top:       properties.banner.bottom ? 'auto'    : '0.9rem',
                right:     properties.banner.right  ? '1.4rem'  : 'auto',
                left:      properties.banner.right  ? 'auto'    : '1.4rem',
                textAlign: properties.banner.right  ? 'right'   : 'left',
                maxWidth: '60%'

            });

            text.innerText = properties.banner.content;

            banner.appendChild(text);
            slide.appendChild(banner);
        }

        slide.classList.add(Slider.slideClassName);
        this.inner.appendChild(slide);

        if (this.orbContainer) {
            const inner = this.style(document.createElement('div'), {backgroundColor: this.color});
            const orb   = this.style(document.createElement('div'), {borderColor:  this.color});
            orb.onclick = this.next.bind(this, this.inner.children.length - 1);

            orb.classList.add(Slider.orbClassName);
            inner.classList.add(Slider.orbInnerClassName);
            orb.appendChild(inner);
            this.orbContainer.appendChild(orb);

            setTimeout(() => orb.classList.add(Slider.loadedOrbClassName), 30);
            if (first) setTimeout(() => orb.classList.add(Slider.activeOrbClassName), 10);
        }

        if (first) {
            setTimeout(() => slide.classList.add(Slider.activeSlideClassName), 10);
            if (this.auto) this.__timeout = setTimeout(this.next.bind(this), this.speed * 1000);
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

    static get innerClassName() {
        if (this.__innerClassName) return this.__innerClassName;
        return this.__innerClassName = `slider-${Date.now()}__inner`;
    }

    static get className() {
        if (this.__className) return this.__className;
        return this.__className = `slider-${Date.now()}`;
    }

    static get slideClassName() {
        if (this.__slideClassName) return this.__slideClassName;
        return this.__slideClassName = `${this.className}__slide`;
    }

    static get orbContainerClassName() {
        if (this.__orbContainerClassName) return this.__orbContainerClassName;
        return this.__orbContainerClassName = `${this.className}__orbs`;
    }

    static get orbClassName() {
        if (this.__orbClassName) return this.__orbClassName;
        return this.__orbClassName = `${this.className}__orb`;
    }

    static get orbInnerClassName() {
        if (this.__orbInnerClassName) return this.__orbInnerClassName;
        return this.__orbInnerClassName = `${this.className}__orb-inner`;
    }


    static get activeOrbClassName() {
        if (this.__activeOrbClassName) return this.__activeOrbClassName;
        return this.__activeOrbClassName = `${this.orbClassName}--active`;
    }

    static get loadedOrbClassName() {
        if (this.__loadedOrbClassName) return this.__loadedOrbClassName;
        return this.__loadedOrbClassName = `${this.orbClassName}--loaded`;
    }

    static get activeSlideClassName() {
        if (this.__activeSlideClassName) return this.__activeSlideClassName;
        return this.__activeSlideClassName = `${this.slideClassName}--active`;
    }

    static get stylesheetClassName() {
        if (this.__stylesheetClassName) return this.__stylesheetClassName;
        return this.__stylesheetClassName = `${this.className}-stylesheet`;
    }

    static stylesheet() {
        if (document.querySelector(`.${this.stylesheetClassName}`)) return;

        const css        = document.createElement('style');
        css.classList.add(this.stylesheetClassName);
        css.type         = 'text/css';
        css.innerText    = `
            .${this.slideClassName} {
                position: absolute;
                top:      0;
                left:     0;
                bottom:   0;
                right:    0;

                background-position: center;
                background-size:     cover;
                background-repeat:   no-repeat;

                opacity:    0;
                transition: opacity 2s ease-in-out;
            }

            .${this.innerClassName} {
                position: absolute;
                top:      0;
                left:     0;
                bottom:   0;
                right:    0;
                z-index:  10;
            }

            .${this.activeSlideClassName} {
                opacity: 1;
            }

            .${this.orbClassName} {
                position: relative;

                width:  1.5rem;
                height: 1.5rem;

                margin:        0 0.5rem;
                border-radius: 100%;
                border:        2px solid #222;
                transition:    transform 0.5s ease-in-out;
                transform:     scale(0);
                cursor:        pointer;
            }

            .${this.orbClassName} .${this.orbInnerClassName} {
                position:  absolute;
                top:       50%;
                left:      50%;
                transform: translate3d(-50%, -50%, 0);

                content: '';
                display: block;
                width:   calc(100% - 5px);
                height:  calc(100% - 5px);

                border-radius:    100%;
                background-color: #222;
                opacity:          0;
                transition:       opacity 0.5s ease-in-out;
            }

            .${this.loadedOrbClassName} {
                transform: scale(1);
            }

            .${this.activeOrbClassName} .${this.orbInnerClassName} {
                opacity: 1;
            }

            .${this.orbContainerClassName} {
                position: absolute;
                left:     0;
                bottom:   0.75rem;
                z-index:  100;

                width:  100%;
                height: 1.5rem;

                display:         flex;
                flex-flow:       row nowrap;
                align-items:     center;
                justify-content: center;
            }
        `.replace(/[\s\n]+/g, ' ');

        document.querySelector('head').appendChild(css);
    }

    // alternative way of initializing
    static init(...args) {
        this.stylesheet();
        new this(...args);
    }
}
