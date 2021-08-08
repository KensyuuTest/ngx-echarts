import { __awaiter, __decorate, __param } from 'tslib';
import { InjectionToken, EventEmitter, Inject, ElementRef, NgZone, Input, Output, Directive, NgModule } from '@angular/core';
import ResizeObserver from 'resize-observer-polyfill';
import { of, EMPTY, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

class ChangeFilter {
    constructor(changes) {
        this.changes = changes;
    }
    static of(changes) {
        return new ChangeFilter(changes);
    }
    notEmpty(key) {
        if (this.changes[key]) {
            const value = this.changes[key].currentValue;
            if (value !== undefined && value !== null) {
                return of(value);
            }
        }
        return EMPTY;
    }
    has(key) {
        if (this.changes[key]) {
            const value = this.changes[key].currentValue;
            return of(value);
        }
        return EMPTY;
    }
    notFirst(key) {
        if (this.changes[key] && !this.changes[key].isFirstChange()) {
            const value = this.changes[key].currentValue;
            return of(value);
        }
        return EMPTY;
    }
    notFirstAndEmpty(key) {
        if (this.changes[key] && !this.changes[key].isFirstChange()) {
            const value = this.changes[key].currentValue;
            if (value !== undefined && value !== null) {
                return of(value);
            }
        }
        return EMPTY;
    }
}

const NGX_ECHARTS_CONFIG = new InjectionToken('NGX_ECHARTS_CONFIG');
let NgxEchartsDirective = class NgxEchartsDirective {
    constructor(config, el, ngZone) {
        this.el = el;
        this.ngZone = ngZone;
        this.autoResize = true;
        this.loadingType = 'default';
        // ngx-echarts events
        this.chartInit = new EventEmitter();
        this.optionsError = new EventEmitter();
        // echarts mouse events
        this.chartClick = this.createLazyEvent('click');
        this.chartDblClick = this.createLazyEvent('dblclick');
        this.chartMouseDown = this.createLazyEvent('mousedown');
        this.chartMouseMove = this.createLazyEvent('mousemove');
        this.chartMouseUp = this.createLazyEvent('mouseup');
        this.chartMouseOver = this.createLazyEvent('mouseover');
        this.chartMouseOut = this.createLazyEvent('mouseout');
        this.chartGlobalOut = this.createLazyEvent('globalout');
        this.chartContextMenu = this.createLazyEvent('contextmenu');
        // echarts mouse events
        this.chartLegendSelectChanged = this.createLazyEvent('legendselectchanged');
        this.chartLegendSelected = this.createLazyEvent('legendselected');
        this.chartLegendUnselected = this.createLazyEvent('legendunselected');
        this.chartLegendScroll = this.createLazyEvent('legendscroll');
        this.chartDataZoom = this.createLazyEvent('datazoom');
        this.chartDataRangeSelected = this.createLazyEvent('datarangeselected');
        this.chartTimelineChanged = this.createLazyEvent('timelinechanged');
        this.chartTimelinePlayChanged = this.createLazyEvent('timelineplaychanged');
        this.chartRestore = this.createLazyEvent('restore');
        this.chartDataViewChanged = this.createLazyEvent('dataviewchanged');
        this.chartMagicTypeChanged = this.createLazyEvent('magictypechanged');
        this.chartPieSelectChanged = this.createLazyEvent('pieselectchanged');
        this.chartPieSelected = this.createLazyEvent('pieselected');
        this.chartPieUnselected = this.createLazyEvent('pieunselected');
        this.chartMapSelectChanged = this.createLazyEvent('mapselectchanged');
        this.chartMapSelected = this.createLazyEvent('mapselected');
        this.chartMapUnselected = this.createLazyEvent('mapunselected');
        this.chartAxisAreaSelected = this.createLazyEvent('axisareaselected');
        this.chartFocusNodeAdjacency = this.createLazyEvent('focusnodeadjacency');
        this.chartUnfocusNodeAdjacency = this.createLazyEvent('unfocusnodeadjacency');
        this.chartBrush = this.createLazyEvent('brush');
        this.chartBrushEnd = this.createLazyEvent('brushend');
        this.chartBrushSelected = this.createLazyEvent('brushselected');
        this.chartRendered = this.createLazyEvent('rendered');
        this.chartFinished = this.createLazyEvent('finished');
        this.echarts = config.echarts;
    }
    ngOnChanges(changes) {
        const filter = ChangeFilter.of(changes);
        filter.notFirstAndEmpty('options').subscribe((opt) => this.onOptionsChange(opt));
        filter.notFirstAndEmpty('merge').subscribe((opt) => this.setOption(opt));
        filter.has('loading').subscribe((v) => this.toggleLoading(!!v));
        filter.notFirst('theme').subscribe(() => this.refreshChart());
    }
    ngOnInit() {
        if (this.autoResize) {
            this.resizeSub = new ResizeObserver(() => this.resize());
            this.resizeSub.observe(this.el.nativeElement);
        }
    }
    ngOnDestroy() {
        if (this.resizeSub) {
            this.resizeSub.unobserve(this.el.nativeElement);
        }
        this.dispose();
    }
    ngAfterViewInit() {
        setTimeout(() => this.initChart());
    }
    dispose() {
        if (this.chart) {
            this.chart.dispose();
            this.chart = null;
        }
    }
    /**
     * resize chart
     */
    resize() {
        if (this.chart) {
            this.chart.resize();
        }
    }
    toggleLoading(loading) {
        if (this.chart) {
            loading
                ? this.chart.showLoading(this.loadingType, this.loadingOpts)
                : this.chart.hideLoading();
        }
    }
    setOption(option, opts) {
        if (this.chart) {
            try {
                this.chart.setOption(option, opts);
            }
            catch (e) {
                console.error(e);
                this.optionsError.emit(e);
            }
        }
    }
    /**
     * dispose old chart and create a new one.
     */
    refreshChart() {
        return __awaiter(this, void 0, void 0, function* () {
            this.dispose();
            yield this.initChart();
        });
    }
    createChart() {
        const dom = this.el.nativeElement;
        if (window && window.getComputedStyle) {
            const prop = window.getComputedStyle(dom, null).getPropertyValue('height');
            if ((!prop || prop === '0px') && (!dom.style.height || dom.style.height === '0px')) {
                dom.style.height = '400px';
            }
        }
        // here a bit tricky: we check if the echarts module is provided as function returning native import('...') then use the promise
        // otherwise create the function that imitates behaviour above with a provided as is module
        return this.ngZone.runOutsideAngular(() => {
            const load = typeof this.echarts === 'function' ? this.echarts : () => Promise.resolve(this.echarts);
            return load().then(({ init }) => init(dom, this.theme, this.initOpts));
        });
    }
    initChart() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.onOptionsChange(this.options);
            if (this.merge && this.chart) {
                this.setOption(this.merge);
            }
        });
    }
    onOptionsChange(opt) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!opt) {
                return;
            }
            if (this.chart) {
                this.setOption(this.options, true);
            }
            else {
                this.chart = yield this.createChart();
                this.chartInit.emit(this.chart);
                this.setOption(this.options, true);
            }
        });
    }
    // allows to lazily bind to only those events that are requested through the `@Output` by parent components
    // see https://stackoverflow.com/questions/51787972/optimal-reentering-the-ngzone-from-eventemitter-event for more info
    createLazyEvent(eventName) {
        return this.chartInit.pipe(switchMap((chart) => new Observable((observer) => {
            chart.on(eventName, (data) => this.ngZone.run(() => observer.next(data)));
            return () => chart.off(eventName);
        })));
    }
};
NgxEchartsDirective.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [NGX_ECHARTS_CONFIG,] }] },
    { type: ElementRef },
    { type: NgZone }
];
__decorate([
    Input()
], NgxEchartsDirective.prototype, "options", void 0);
__decorate([
    Input()
], NgxEchartsDirective.prototype, "theme", void 0);
__decorate([
    Input()
], NgxEchartsDirective.prototype, "loading", void 0);
__decorate([
    Input()
], NgxEchartsDirective.prototype, "initOpts", void 0);
__decorate([
    Input()
], NgxEchartsDirective.prototype, "merge", void 0);
__decorate([
    Input()
], NgxEchartsDirective.prototype, "autoResize", void 0);
__decorate([
    Input()
], NgxEchartsDirective.prototype, "loadingType", void 0);
__decorate([
    Input()
], NgxEchartsDirective.prototype, "loadingOpts", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartInit", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "optionsError", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartClick", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartDblClick", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartMouseDown", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartMouseMove", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartMouseUp", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartMouseOver", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartMouseOut", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartGlobalOut", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartContextMenu", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartLegendSelectChanged", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartLegendSelected", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartLegendUnselected", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartLegendScroll", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartDataZoom", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartDataRangeSelected", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartTimelineChanged", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartTimelinePlayChanged", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartRestore", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartDataViewChanged", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartMagicTypeChanged", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartPieSelectChanged", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartPieSelected", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartPieUnselected", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartMapSelectChanged", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartMapSelected", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartMapUnselected", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartAxisAreaSelected", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartFocusNodeAdjacency", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartUnfocusNodeAdjacency", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartBrush", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartBrushEnd", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartBrushSelected", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartRendered", void 0);
__decorate([
    Output()
], NgxEchartsDirective.prototype, "chartFinished", void 0);
NgxEchartsDirective = __decorate([
    Directive({
        selector: 'echarts, [echarts]',
        exportAs: 'echarts',
    }),
    __param(0, Inject(NGX_ECHARTS_CONFIG))
], NgxEchartsDirective);

var NgxEchartsModule_1;
let NgxEchartsModule = NgxEchartsModule_1 = class NgxEchartsModule {
    static forRoot(config) {
        return {
            ngModule: NgxEchartsModule_1,
            providers: [{ provide: NGX_ECHARTS_CONFIG, useValue: config }],
        };
    }
    static forChild() {
        return {
            ngModule: NgxEchartsModule_1,
        };
    }
};
NgxEchartsModule = NgxEchartsModule_1 = __decorate([
    NgModule({
        imports: [],
        declarations: [NgxEchartsDirective],
        exports: [NgxEchartsDirective],
    })
], NgxEchartsModule);

/*
 * Public API Surface of ngx-echarts
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NGX_ECHARTS_CONFIG, NgxEchartsDirective, NgxEchartsModule };
//# sourceMappingURL=ngx-echarts.js.map
