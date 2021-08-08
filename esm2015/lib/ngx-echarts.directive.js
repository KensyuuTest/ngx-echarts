import { __awaiter, __decorate, __param } from "tslib";
import { AfterViewInit, Directive, ElementRef, EventEmitter, Inject, InjectionToken, Input, NgZone, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, } from '@angular/core';
import ResizeObserver from 'resize-observer-polyfill';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ChangeFilter } from './change-filter';
export const NGX_ECHARTS_CONFIG = new InjectionToken('NGX_ECHARTS_CONFIG');
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
export { NgxEchartsDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWVjaGFydHMuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmd4LWVjaGFydHMvIiwic291cmNlcyI6WyJsaWIvbmd4LWVjaGFydHMuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQ0wsYUFBYSxFQUNiLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLE1BQU0sRUFDTixjQUFjLEVBQ2QsS0FBSyxFQUNMLE1BQU0sRUFDTixTQUFTLEVBQ1QsU0FBUyxFQUNULE1BQU0sRUFDTixNQUFNLEVBQ04sYUFBYSxHQUNkLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sY0FBYyxNQUFNLDBCQUEwQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDbEMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQU0vQyxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLGNBQWMsQ0FBbUIsb0JBQW9CLENBQUMsQ0FBQztBQU03RixJQUFhLG1CQUFtQixHQUFoQyxNQUFhLG1CQUFtQjtJQTZEOUIsWUFDOEIsTUFBd0IsRUFDNUMsRUFBYyxFQUNkLE1BQWM7UUFEZCxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQ2QsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQXJEZixlQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLGdCQUFXLEdBQUcsU0FBUyxDQUFDO1FBR2pDLHFCQUFxQjtRQUNYLGNBQVMsR0FBRyxJQUFJLFlBQVksRUFBTyxDQUFDO1FBQ3BDLGlCQUFZLEdBQUcsSUFBSSxZQUFZLEVBQVMsQ0FBQztRQUVuRCx1QkFBdUI7UUFDYixlQUFVLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzQyxrQkFBYSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsVUFB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QUFFO2tFQUFrRTtBQUNqRTtJQUFULE1BQU0sRUFBRTs2REFBd0Q7QUFDdkQ7SUFBVCxNQUFNLEVBQUU7K0RBQTREO0FBQzNEO0lBQVQsTUFBTSxFQUFFO2tFQUFrRTtBQUNqRTtJQUFULE1BQU0sRUFBRTs2REFBd0Q7QUFDdkQ7SUFBVCxNQUFNLEVBQUU7K0RBQTREO0FBQzNEO0lBQVQsTUFBTSxFQUFFO2tFQUFrRTtBQUNqRTtJQUFULE1BQU0sRUFBRTtvRUFBc0U7QUFDckU7SUFBVCxNQUFNLEVBQUU7c0VBQTBFO0FBQ3pFO0lBQVQsTUFBTSxFQUFFO3VEQUE0QztBQUMzQztJQUFULE1BQU0sRUFBRTswREFBa0Q7QUFDakQ7SUFBVCxNQUFNLEVBQUU7K0RBQTREO0FBQzNEO0lBQVQsTUFBTSxFQUFFOzBEQUFrRDtBQUNqRDtJQUFULE1BQU0sRUFBRTswREFBa0Q7QUF2RGhELG1CQUFtQjtJQUovQixTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsb0JBQW9CO1FBQzlCLFFBQVEsRUFBRSxTQUFTO0tBQ3BCLENBQUM7SUErREcsV0FBQSxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtHQTlEbEIsbUJBQW1CLENBaU0vQjtTQWpNWSxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5qZWN0LFxuICBJbmplY3Rpb25Ub2tlbixcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3V0cHV0LFxuICBTaW1wbGVDaGFuZ2VzLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCBSZXNpemVPYnNlcnZlciBmcm9tICdyZXNpemUtb2JzZXJ2ZXItcG9seWZpbGwnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgc3dpdGNoTWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgQ2hhbmdlRmlsdGVyIH0gZnJvbSAnLi9jaGFuZ2UtZmlsdGVyJztcblxuZXhwb3J0IGludGVyZmFjZSBOZ3hFY2hhcnRzQ29uZmlnIHtcbiAgZWNoYXJ0czogYW55IHwgKCgpID0+IFByb21pc2U8YW55Pik7XG59XG5cbmV4cG9ydCBjb25zdCBOR1hfRUNIQVJUU19DT05GSUcgPSBuZXcgSW5qZWN0aW9uVG9rZW48Tmd4RWNoYXJ0c0NvbmZpZz4oJ05HWF9FQ0hBUlRTX0NPTkZJRycpO1xuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdlY2hhcnRzLCBbZWNoYXJ0c10nLFxuICBleHBvcnRBczogJ2VjaGFydHMnLFxufSlcbmV4cG9ydCBjbGFzcyBOZ3hFY2hhcnRzRGlyZWN0aXZlIGltcGxlbWVudHMgT25DaGFuZ2VzLCBPbkRlc3Ryb3ksIE9uSW5pdCwgQWZ0ZXJWaWV3SW5pdCB7XG4gIEBJbnB1dCgpIG9wdGlvbnM6IGFueTtcbiAgQElucHV0KCkgdGhlbWU6IHN0cmluZztcbiAgQElucHV0KCkgbG9hZGluZzogYm9vbGVhbjtcbiAgQElucHV0KCkgaW5pdE9wdHM6IHtcbiAgICBkZXZpY2VQaXhlbFJhdGlvPzogbnVtYmVyO1xuICAgIHJlbmRlcmVyPzogc3RyaW5nO1xuICAgIHdpZHRoPzogbnVtYmVyIHwgc3RyaW5nO1xuICAgIGhlaWdodD86IG51bWJlciB8IHN0cmluZztcbiAgfTtcbiAgQElucHV0KCkgbWVyZ2U6IGFueTtcbiAgQElucHV0KCkgYXV0b1Jlc2l6ZSA9IHRydWU7XG4gIEBJbnB1dCgpIGxvYWRpbmdUeXBlID0gJ2RlZmF1bHQnO1xuICBASW5wdXQoKSBsb2FkaW5nT3B0czogb2JqZWN0O1xuXG4gIC8vIG5neC1lY2hhcnRzIGV2ZW50c1xuICBAT3V0cHV0KCkgY2hhcnRJbml0ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gIEBPdXRwdXQoKSBvcHRpb25zRXJyb3IgPSBuZXcgRXZlbnRFbWl0dGVyPEVycm9yPigpO1xuXG4gIC8vIGVjaGFydHMgbW91c2UgZXZlbnRzXG4gIEBPdXRwdXQoKSBjaGFydENsaWNrID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ2NsaWNrJyk7XG4gIEBPdXRwdXQoKSBjaGFydERibENsaWNrID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ2RibGNsaWNrJyk7XG4gIEBPdXRwdXQoKSBjaGFydE1vdXNlRG93biA9IHRoaXMuY3JlYXRlTGF6eUV2ZW50KCdtb3VzZWRvd24nKTtcbiAgQE91dHB1dCgpIGNoYXJ0TW91c2VNb3ZlID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ21vdXNlbW92ZScpO1xuICBAT3V0cHV0KCkgY2hhcnRNb3VzZVVwID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ21vdXNldXAnKTtcbiAgQE91dHB1dCgpIGNoYXJ0TW91c2VPdmVyID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ21vdXNlb3ZlcicpO1xuICBAT3V0cHV0KCkgY2hhcnRNb3VzZU91dCA9IHRoaXMuY3JlYXRlTGF6eUV2ZW50KCdtb3VzZW91dCcpO1xuICBAT3V0cHV0KCkgY2hhcnRHbG9iYWxPdXQgPSB0aGlzLmNyZWF0ZUxhenlFdmVudCgnZ2xvYmFsb3V0Jyk7XG4gIEBPdXRwdXQoKSBjaGFydENvbnRleHRNZW51ID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ2NvbnRleHRtZW51Jyk7XG5cbiAgLy8gZWNoYXJ0cyBtb3VzZSBldmVudHNcbiAgQE91dHB1dCgpIGNoYXJ0TGVnZW5kU2VsZWN0Q2hhbmdlZCA9IHRoaXMuY3JlYXRlTGF6eUV2ZW50KCdsZWdlbmRzZWxlY3RjaGFuZ2VkJyk7XG4gIEBPdXRwdXQoKSBjaGFydExlZ2VuZFNlbGVjdGVkID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ2xlZ2VuZHNlbGVjdGVkJyk7XG4gIEBPdXRwdXQoKSBjaGFydExlZ2VuZFVuc2VsZWN0ZWQgPSB0aGlzLmNyZWF0ZUxhenlFdmVudCgnbGVnZW5kdW5zZWxlY3RlZCcpO1xuICBAT3V0cHV0KCkgY2hhcnRMZWdlbmRTY3JvbGwgPSB0aGlzLmNyZWF0ZUxhenlFdmVudCgnbGVnZW5kc2Nyb2xsJyk7XG4gIEBPdXRwdXQoKSBjaGFydERhdGFab29tID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ2RhdGF6b29tJyk7XG4gIEBPdXRwdXQoKSBjaGFydERhdGFSYW5nZVNlbGVjdGVkID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ2RhdGFyYW5nZXNlbGVjdGVkJyk7XG4gIEBPdXRwdXQoKSBjaGFydFRpbWVsaW5lQ2hhbmdlZCA9IHRoaXMuY3JlYXRlTGF6eUV2ZW50KCd0aW1lbGluZWNoYW5nZWQnKTtcbiAgQE91dHB1dCgpIGNoYXJ0VGltZWxpbmVQbGF5Q2hhbmdlZCA9IHRoaXMuY3JlYXRlTGF6eUV2ZW50KCd0aW1lbGluZXBsYXljaGFuZ2VkJyk7XG4gIEBPdXRwdXQoKSBjaGFydFJlc3RvcmUgPSB0aGlzLmNyZWF0ZUxhenlFdmVudCgncmVzdG9yZScpO1xuICBAT3V0cHV0KCkgY2hhcnREYXRhVmlld0NoYW5nZWQgPSB0aGlzLmNyZWF0ZUxhenlFdmVudCgnZGF0YXZpZXdjaGFuZ2VkJyk7XG4gIEBPdXRwdXQoKSBjaGFydE1hZ2ljVHlwZUNoYW5nZWQgPSB0aGlzLmNyZWF0ZUxhenlFdmVudCgnbWFnaWN0eXBlY2hhbmdlZCcpO1xuICBAT3V0cHV0KCkgY2hhcnRQaWVTZWxlY3RDaGFuZ2VkID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ3BpZXNlbGVjdGNoYW5nZWQnKTtcbiAgQE91dHB1dCgpIGNoYXJ0UGllU2VsZWN0ZWQgPSB0aGlzLmNyZWF0ZUxhenlFdmVudCgncGllc2VsZWN0ZWQnKTtcbiAgQE91dHB1dCgpIGNoYXJ0UGllVW5zZWxlY3RlZCA9IHRoaXMuY3JlYXRlTGF6eUV2ZW50KCdwaWV1bnNlbGVjdGVkJyk7XG4gIEBPdXRwdXQoKSBjaGFydE1hcFNlbGVjdENoYW5nZWQgPSB0aGlzLmNyZWF0ZUxhenlFdmVudCgnbWFwc2VsZWN0Y2hhbmdlZCcpO1xuICBAT3V0cHV0KCkgY2hhcnRNYXBTZWxlY3RlZCA9IHRoaXMuY3JlYXRlTGF6eUV2ZW50KCdtYXBzZWxlY3RlZCcpO1xuICBAT3V0cHV0KCkgY2hhcnRNYXBVbnNlbGVjdGVkID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ21hcHVuc2VsZWN0ZWQnKTtcbiAgQE91dHB1dCgpIGNoYXJ0QXhpc0FyZWFTZWxlY3RlZCA9IHRoaXMuY3JlYXRlTGF6eUV2ZW50KCdheGlzYXJlYXNlbGVjdGVkJyk7XG4gIEBPdXRwdXQoKSBjaGFydEZvY3VzTm9kZUFkamFjZW5jeSA9IHRoaXMuY3JlYXRlTGF6eUV2ZW50KCdmb2N1c25vZGVhZGphY2VuY3knKTtcbiAgQE91dHB1dCgpIGNoYXJ0VW5mb2N1c05vZGVBZGphY2VuY3kgPSB0aGlzLmNyZWF0ZUxhenlFdmVudCgndW5mb2N1c25vZGVhZGphY2VuY3knKTtcbiAgQE91dHB1dCgpIGNoYXJ0QnJ1c2ggPSB0aGlzLmNyZWF0ZUxhenlFdmVudCgnYnJ1c2gnKTtcbiAgQE91dHB1dCgpIGNoYXJ0QnJ1c2hFbmQgPSB0aGlzLmNyZWF0ZUxhenlFdmVudCgnYnJ1c2hlbmQnKTtcbiAgQE91dHB1dCgpIGNoYXJ0QnJ1c2hTZWxlY3RlZCA9IHRoaXMuY3JlYXRlTGF6eUV2ZW50KCdicnVzaHNlbGVjdGVkJyk7XG4gIEBPdXRwdXQoKSBjaGFydFJlbmRlcmVkID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ3JlbmRlcmVkJyk7XG4gIEBPdXRwdXQoKSBjaGFydEZpbmlzaGVkID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ2ZpbmlzaGVkJyk7XG5cbiAgcHJpdmF0ZSBjaGFydDogYW55O1xuICBwcml2YXRlIGVjaGFydHM6IGFueTtcbiAgcHJpdmF0ZSByZXNpemVTdWI6IFJlc2l6ZU9ic2VydmVyO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3QoTkdYX0VDSEFSVFNfQ09ORklHKSBjb25maWc6IE5neEVjaGFydHNDb25maWcsXG4gICAgcHJpdmF0ZSBlbDogRWxlbWVudFJlZixcbiAgICBwcml2YXRlIG5nWm9uZTogTmdab25lLFxuICApIHtcbiAgICB0aGlzLmVjaGFydHMgPSBjb25maWcuZWNoYXJ0cztcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBjb25zdCBmaWx0ZXIgPSBDaGFuZ2VGaWx0ZXIub2YoY2hhbmdlcyk7XG4gICAgZmlsdGVyLm5vdEZpcnN0QW5kRW1wdHk8YW55Pignb3B0aW9ucycpLnN1YnNjcmliZSgob3B0KSA9PiB0aGlzLm9uT3B0aW9uc0NoYW5nZShvcHQpKTtcbiAgICBmaWx0ZXIubm90Rmlyc3RBbmRFbXB0eTxhbnk+KCdtZXJnZScpLnN1YnNjcmliZSgob3B0KSA9PiB0aGlzLnNldE9wdGlvbihvcHQpKTtcbiAgICBmaWx0ZXIuaGFzPGJvb2xlYW4+KCdsb2FkaW5nJykuc3Vic2NyaWJlKCh2KSA9PiB0aGlzLnRvZ2dsZUxvYWRpbmcoISF2KSk7XG4gICAgZmlsdGVyLm5vdEZpcnN0PHN0cmluZz4oJ3RoZW1lJykuc3Vic2NyaWJlKCgpID0+IHRoaXMucmVmcmVzaENoYXJ0KCkpO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgaWYgKHRoaXMuYXV0b1Jlc2l6ZSkge1xuICAgICAgdGhpcy5yZXNpemVTdWIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4gdGhpcy5yZXNpemUoKSk7XG4gICAgICB0aGlzLnJlc2l6ZVN1Yi5vYnNlcnZlKHRoaXMuZWwubmF0aXZlRWxlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMucmVzaXplU3ViKSB7XG4gICAgICB0aGlzLnJlc2l6ZVN1Yi51bm9ic2VydmUodGhpcy5lbC5uYXRpdmVFbGVtZW50KTtcbiAgICB9XG4gICAgdGhpcy5kaXNwb3NlKCk7XG4gIH1cblxuICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmluaXRDaGFydCgpKTtcbiAgfVxuXG4gIHByaXZhdGUgZGlzcG9zZSgpIHtcbiAgICBpZiAodGhpcy5jaGFydCkge1xuICAgICAgdGhpcy5jaGFydC5kaXNwb3NlKCk7XG4gICAgICB0aGlzLmNoYXJ0ID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogcmVzaXplIGNoYXJ0XG4gICAqL1xuICByZXNpemUoKSB7XG4gICAgaWYgKHRoaXMuY2hhcnQpIHtcbiAgICAgIHRoaXMuY2hhcnQucmVzaXplKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSB0b2dnbGVMb2FkaW5nKGxvYWRpbmc6IGJvb2xlYW4pIHtcbiAgICBpZiAodGhpcy5jaGFydCkge1xuICAgICAgbG9hZGluZ1xuICAgICAgICA/IHRoaXMuY2hhcnQuc2hvd0xvYWRpbmcodGhpcy5sb2FkaW5nVHlwZSwgdGhpcy5sb2FkaW5nT3B0cylcbiAgICAgICAgOiB0aGlzLmNoYXJ0LmhpZGVMb2FkaW5nKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzZXRPcHRpb24ob3B0aW9uOiBhbnksIG9wdHM/OiBhbnkpIHtcbiAgICBpZiAodGhpcy5jaGFydCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5jaGFydC5zZXRPcHRpb24ob3B0aW9uLCBvcHRzKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgdGhpcy5vcHRpb25zRXJyb3IuZW1pdChlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogZGlzcG9zZSBvbGQgY2hhcnQgYW5kIGNyZWF0ZSBhIG5ldyBvbmUuXG4gICAqL1xuICBhc3luYyByZWZyZXNoQ2hhcnQoKSB7XG4gICAgdGhpcy5kaXNwb3NlKCk7XG4gICAgYXdhaXQgdGhpcy5pbml0Q2hhcnQoKTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlQ2hhcnQoKSB7XG4gICAgY29uc3QgZG9tID0gdGhpcy5lbC5uYXRpdmVFbGVtZW50O1xuXG4gICAgaWYgKHdpbmRvdyAmJiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSkge1xuICAgICAgY29uc3QgcHJvcCA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGRvbSwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZSgnaGVpZ2h0Jyk7XG4gICAgICBpZiAoKCFwcm9wIHx8IHByb3AgPT09ICcwcHgnKSAmJiAoIWRvbS5zdHlsZS5oZWlnaHQgfHwgZG9tLnN0eWxlLmhlaWdodCA9PT0gJzBweCcpKSB7XG4gICAgICAgIGRvbS5zdHlsZS5oZWlnaHQgPSAnNDAwcHgnO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGhlcmUgYSBiaXQgdHJpY2t5OiB3ZSBjaGVjayBpZiB0aGUgZWNoYXJ0cyBtb2R1bGUgaXMgcHJvdmlkZWQgYXMgZnVuY3Rpb24gcmV0dXJuaW5nIG5hdGl2ZSBpbXBvcnQoJy4uLicpIHRoZW4gdXNlIHRoZSBwcm9taXNlXG4gICAgLy8gb3RoZXJ3aXNlIGNyZWF0ZSB0aGUgZnVuY3Rpb24gdGhhdCBpbWl0YXRlcyBiZWhhdmlvdXIgYWJvdmUgd2l0aCBhIHByb3ZpZGVkIGFzIGlzIG1vZHVsZVxuICAgIHJldHVybiB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICBjb25zdCBsb2FkID1cbiAgICAgICAgdHlwZW9mIHRoaXMuZWNoYXJ0cyA9PT0gJ2Z1bmN0aW9uJyA/IHRoaXMuZWNoYXJ0cyA6ICgpID0+IFByb21pc2UucmVzb2x2ZSh0aGlzLmVjaGFydHMpO1xuXG4gICAgICByZXR1cm4gbG9hZCgpLnRoZW4oKHsgaW5pdCB9KSA9PiBpbml0KGRvbSwgdGhpcy50aGVtZSwgdGhpcy5pbml0T3B0cykpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBpbml0Q2hhcnQoKSB7XG4gICAgYXdhaXQgdGhpcy5vbk9wdGlvbnNDaGFuZ2UodGhpcy5vcHRpb25zKTtcblxuICAgIGlmICh0aGlzLm1lcmdlICYmIHRoaXMuY2hhcnQpIHtcbiAgICAgIHRoaXMuc2V0T3B0aW9uKHRoaXMubWVyZ2UpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgb25PcHRpb25zQ2hhbmdlKG9wdDogYW55KSB7XG4gICAgaWYgKCFvcHQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jaGFydCkge1xuICAgICAgdGhpcy5zZXRPcHRpb24odGhpcy5vcHRpb25zLCB0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jaGFydCA9IGF3YWl0IHRoaXMuY3JlYXRlQ2hhcnQoKTtcbiAgICAgIHRoaXMuY2hhcnRJbml0LmVtaXQodGhpcy5jaGFydCk7XG4gICAgICB0aGlzLnNldE9wdGlvbih0aGlzLm9wdGlvbnMsIHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGFsbG93cyB0byBsYXppbHkgYmluZCB0byBvbmx5IHRob3NlIGV2ZW50cyB0aGF0IGFyZSByZXF1ZXN0ZWQgdGhyb3VnaCB0aGUgYEBPdXRwdXRgIGJ5IHBhcmVudCBjb21wb25lbnRzXG4gIC8vIHNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81MTc4Nzk3Mi9vcHRpbWFsLXJlZW50ZXJpbmctdGhlLW5nem9uZS1mcm9tLWV2ZW50ZW1pdHRlci1ldmVudCBmb3IgbW9yZSBpbmZvXG4gIHByaXZhdGUgY3JlYXRlTGF6eUV2ZW50PFQ+KGV2ZW50TmFtZTogc3RyaW5nKTogRXZlbnRFbWl0dGVyPFQ+IHtcbiAgICByZXR1cm4gdGhpcy5jaGFydEluaXQucGlwZShcbiAgICAgIHN3aXRjaE1hcChcbiAgICAgICAgKGNoYXJ0OiBhbnkpID0+XG4gICAgICAgICAgbmV3IE9ic2VydmFibGUoKG9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICBjaGFydC5vbihldmVudE5hbWUsIChkYXRhOiBUKSA9PiB0aGlzLm5nWm9uZS5ydW4oKCkgPT4gb2JzZXJ2ZXIubmV4dChkYXRhKSkpO1xuICAgICAgICAgICAgcmV0dXJuICgpID0+IGNoYXJ0Lm9mZihldmVudE5hbWUpO1xuICAgICAgICAgIH0pLFxuICAgICAgKSxcbiAgICApIGFzIEV2ZW50RW1pdHRlcjxUPjtcbiAgfVxufVxuIl19