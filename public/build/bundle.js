
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\App.svelte generated by Svelte v3.59.2 */

    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div0;
    	let t0;
    	let label;
    	let t2;
    	let table;
    	let tr0;
    	let th0;
    	let t4;
    	let th1;
    	let t6;
    	let th2;
    	let t8;
    	let tr1;
    	let td0;
    	let img0;
    	let img0_src_value;
    	let t9;
    	let td1;
    	let t11;
    	let td2;
    	let t13;
    	let tr2;
    	let td3;
    	let img1;
    	let img1_src_value;
    	let t14;
    	let td4;
    	let t16;
    	let td5;
    	let t18;
    	let tr3;
    	let td6;
    	let img2;
    	let img2_src_value;
    	let t19;
    	let td7;
    	let t21;
    	let td8;
    	let t23;
    	let tr4;
    	let td9;
    	let img3;
    	let img3_src_value;
    	let t24;
    	let td10;
    	let t26;
    	let td11;
    	let t28;
    	let tr5;
    	let td12;
    	let img4;
    	let img4_src_value;
    	let t29;
    	let td13;
    	let t31;
    	let td14;
    	let t33;
    	let tr6;
    	let td15;
    	let img5;
    	let img5_src_value;
    	let t34;
    	let td16;
    	let t36;
    	let td17;
    	let t38;
    	let div1;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			t0 = space();
    			label = element("label");
    			label.textContent = "What Are the Boys AKA Homies?";
    			t2 = space();
    			table = element("table");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "      Classic Image      ";
    			t4 = space();
    			th1 = element("th");
    			th1.textContent = "Iconic Name";
    			t6 = space();
    			th2 = element("th");
    			th2.textContent = "Accurate Description";
    			t8 = space();
    			tr1 = element("tr");
    			td0 = element("td");
    			img0 = element("img");
    			t9 = space();
    			td1 = element("td");
    			td1.textContent = "Chapati";
    			t11 = space();
    			td2 = element("td");
    			td2.textContent = "give an Description pls";
    			t13 = space();
    			tr2 = element("tr");
    			td3 = element("td");
    			img1 = element("img");
    			t14 = space();
    			td4 = element("td");
    			td4.textContent = "OofBoiGaming";
    			t16 = space();
    			td5 = element("td");
    			td5.textContent = "i need a Description guys";
    			t18 = space();
    			tr3 = element("tr");
    			td6 = element("td");
    			img2 = element("img");
    			t19 = space();
    			td7 = element("td");
    			td7.textContent = "Vertical";
    			t21 = space();
    			td8 = element("td");
    			td8.textContent = "please help i need a Description";
    			t23 = space();
    			tr4 = element("tr");
    			td9 = element("td");
    			img3 = element("img");
    			t24 = space();
    			td10 = element("td");
    			td10.textContent = "Abd";
    			t26 = space();
    			td11 = element("td");
    			td11.textContent = "man idk just give a Description please man";
    			t28 = space();
    			tr5 = element("tr");
    			td12 = element("td");
    			img4 = element("img");
    			t29 = space();
    			td13 = element("td");
    			td13.textContent = "Minefraftmirmi";
    			t31 = space();
    			td14 = element("td");
    			td14.textContent = "PLEASE DUDE JUST GIVE A Description";
    			t33 = space();
    			tr6 = element("tr");
    			td15 = element("td");
    			img5 = element("img");
    			t34 = space();
    			td16 = element("td");
    			td16.textContent = "Musab";
    			t36 = space();
    			td17 = element("td");
    			td17.textContent = "I AM BEGGING YOU PLEASE MAN GIVE A Description";
    			t38 = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "background svelte-1yvr3fx");
    			set_style(div0, "position", "fixed");
    			set_style(div0, "z-index", "-1");
    			add_location(div0, file, 5, 1, 29);
    			attr_dev(label, "class", "maintext svelte-1yvr3fx");
    			add_location(label, file, 7, 1, 159);
    			attr_dev(th0, "class", "svelte-1yvr3fx");
    			add_location(th0, file, 10, 3, 280);
    			attr_dev(th1, "class", "svelte-1yvr3fx");
    			add_location(th1, file, 11, 3, 348);
    			attr_dev(th2, "class", "svelte-1yvr3fx");
    			add_location(th2, file, 12, 3, 372);
    			add_location(tr0, file, 9, 2, 272);
    			if (!src_url_equal(img0.src, img0_src_value = "/resources/chapatiwithkebab.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Chapati");
    			attr_dev(img0, "class", "svelte-1yvr3fx");
    			add_location(img0, file, 15, 7, 424);
    			attr_dev(td0, "class", "svelte-1yvr3fx");
    			add_location(td0, file, 15, 3, 420);
    			set_style(td1, "font-weight", "500");
    			attr_dev(td1, "class", "svelte-1yvr3fx");
    			add_location(td1, file, 16, 3, 490);
    			attr_dev(td2, "class", "svelte-1yvr3fx");
    			add_location(td2, file, 17, 3, 536);
    			add_location(tr1, file, 14, 2, 412);
    			if (!src_url_equal(img1.src, img1_src_value = "/resources/khajoor.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "OofBoiGaming");
    			attr_dev(img1, "class", "svelte-1yvr3fx");
    			add_location(img1, file, 20, 7, 591);
    			attr_dev(td3, "class", "svelte-1yvr3fx");
    			add_location(td3, file, 20, 3, 587);
    			set_style(td4, "font-weight", "500");
    			attr_dev(td4, "class", "svelte-1yvr3fx");
    			add_location(td4, file, 21, 3, 653);
    			attr_dev(td5, "class", "svelte-1yvr3fx");
    			add_location(td5, file, 22, 3, 704);
    			add_location(tr2, file, 19, 2, 579);
    			if (!src_url_equal(img2.src, img2_src_value = "/resources/fries.webp")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Vertical");
    			attr_dev(img2, "class", "svelte-1yvr3fx");
    			add_location(img2, file, 25, 7, 761);
    			attr_dev(td6, "class", "svelte-1yvr3fx");
    			add_location(td6, file, 25, 3, 757);
    			set_style(td7, "font-weight", "500");
    			attr_dev(td7, "class", "svelte-1yvr3fx");
    			add_location(td7, file, 26, 3, 818);
    			attr_dev(td8, "class", "svelte-1yvr3fx");
    			add_location(td8, file, 27, 3, 865);
    			add_location(tr3, file, 24, 2, 749);
    			if (!src_url_equal(img3.src, img3_src_value = "/resources/sandwich.jpeg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Abd");
    			attr_dev(img3, "class", "svelte-1yvr3fx");
    			add_location(img3, file, 30, 7, 929);
    			attr_dev(td9, "class", "svelte-1yvr3fx");
    			add_location(td9, file, 30, 3, 925);
    			set_style(td10, "font-weight", "500");
    			attr_dev(td10, "class", "svelte-1yvr3fx");
    			add_location(td10, file, 31, 3, 984);
    			attr_dev(td11, "class", "svelte-1yvr3fx");
    			add_location(td11, file, 32, 3, 1026);
    			add_location(tr4, file, 29, 2, 917);
    			if (!src_url_equal(img4.src, img4_src_value = "/resources/pancake.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Mirmi");
    			attr_dev(img4, "class", "svelte-1yvr3fx");
    			add_location(img4, file, 35, 7, 1100);
    			attr_dev(td12, "class", "svelte-1yvr3fx");
    			add_location(td12, file, 35, 3, 1096);
    			set_style(td13, "font-weight", "500");
    			attr_dev(td13, "class", "svelte-1yvr3fx");
    			add_location(td13, file, 36, 3, 1155);
    			attr_dev(td14, "class", "svelte-1yvr3fx");
    			add_location(td14, file, 37, 3, 1208);
    			add_location(tr5, file, 34, 2, 1088);
    			if (!src_url_equal(img5.src, img5_src_value = "/resources/cherry.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "Musab");
    			attr_dev(img5, "class", "svelte-1yvr3fx");
    			add_location(img5, file, 40, 7, 1275);
    			attr_dev(td15, "class", "svelte-1yvr3fx");
    			add_location(td15, file, 40, 3, 1271);
    			set_style(td16, "font-weight", "500");
    			attr_dev(td16, "class", "svelte-1yvr3fx");
    			add_location(td16, file, 41, 3, 1329);
    			attr_dev(td17, "class", "svelte-1yvr3fx");
    			add_location(td17, file, 42, 3, 1373);
    			add_location(tr6, file, 39, 2, 1263);
    			attr_dev(table, "class", "datatable svelte-1yvr3fx");
    			set_style(table, "z-index", "100");
    			add_location(table, file, 8, 1, 222);
    			set_style(div1, "position", "absolute");
    			set_style(div1, "left", "0");
    			set_style(div1, "top", "1050px");
    			set_style(div1, "height", "20px");
    			set_style(div1, "width", "100vw");
    			set_style(div1, "background-color", "transparent");
    			add_location(div1, file, 45, 1, 1448);
    			add_location(main, file, 4, 0, 21);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(main, t0);
    			append_dev(main, label);
    			append_dev(main, t2);
    			append_dev(main, table);
    			append_dev(table, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t4);
    			append_dev(tr0, th1);
    			append_dev(tr0, t6);
    			append_dev(tr0, th2);
    			append_dev(table, t8);
    			append_dev(table, tr1);
    			append_dev(tr1, td0);
    			append_dev(td0, img0);
    			append_dev(tr1, t9);
    			append_dev(tr1, td1);
    			append_dev(tr1, t11);
    			append_dev(tr1, td2);
    			append_dev(table, t13);
    			append_dev(table, tr2);
    			append_dev(tr2, td3);
    			append_dev(td3, img1);
    			append_dev(tr2, t14);
    			append_dev(tr2, td4);
    			append_dev(tr2, t16);
    			append_dev(tr2, td5);
    			append_dev(table, t18);
    			append_dev(table, tr3);
    			append_dev(tr3, td6);
    			append_dev(td6, img2);
    			append_dev(tr3, t19);
    			append_dev(tr3, td7);
    			append_dev(tr3, t21);
    			append_dev(tr3, td8);
    			append_dev(table, t23);
    			append_dev(table, tr4);
    			append_dev(tr4, td9);
    			append_dev(td9, img3);
    			append_dev(tr4, t24);
    			append_dev(tr4, td10);
    			append_dev(tr4, t26);
    			append_dev(tr4, td11);
    			append_dev(table, t28);
    			append_dev(table, tr5);
    			append_dev(tr5, td12);
    			append_dev(td12, img4);
    			append_dev(tr5, t29);
    			append_dev(tr5, td13);
    			append_dev(tr5, t31);
    			append_dev(tr5, td14);
    			append_dev(table, t33);
    			append_dev(table, tr6);
    			append_dev(tr6, td15);
    			append_dev(td15, img5);
    			append_dev(tr6, t34);
    			append_dev(tr6, td16);
    			append_dev(tr6, t36);
    			append_dev(tr6, td17);
    			append_dev(main, t38);
    			append_dev(main, div1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {

    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
