import { __awaiter, __decorate, __generator, __param } from "tslib";
import { AfterViewInit, Directive, ElementRef, EventEmitter, Inject, InjectionToken, Input, NgZone, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, } from '@angular/core';
import ResizeObserver from 'resize-observer-polyfill';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ChangeFilter } from './change-filter';
export var NGX_ECHARTS_CONFIG = new InjectionToken('NGX_ECHARTS_CONFIG');
var NgxEchartsDirective = /** @class */ (function () {
    function NgxEchartsDirective(config, el, ngZone) {
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
    NgxEchartsDirective.prototype.ngOnChanges = function (changes) {
        var _this = this;
        var filter = ChangeFilter.of(changes);
        filter.notFirstAndEmpty('options').subscribe(function (opt) { return _this.onOptionsChange(opt); });
        filter.notFirstAndEmpty('merge').subscribe(function (opt) { return _this.setOption(opt); });
        filter.has('loading').subscribe(function (v) { return _this.toggleLoading(!!v); });
        filter.notFirst('theme').subscribe(function () { return _this.refreshChart(); });
    };
    NgxEchartsDirective.prototype.ngOnInit = function () {
        var _this = this;
        if (this.autoResize) {
            this.resizeSub = new ResizeObserver(function () { return _this.resize(); });
            this.resizeSub.observe(this.el.nativeElement);
        }
    };
    NgxEchartsDirective.prototype.ngOnDestroy = function () {
        if (this.resizeSub) {
            this.resizeSub.unobserve(this.el.nativeElement);
        }
        this.dispose();
    };
    NgxEchartsDirective.prototype.ngAfterViewInit = function () {
        var _this = this;
        setTimeout(function () { return _this.initChart(); });
    };
    NgxEchartsDirective.prototype.dispose = function () {
        if (this.chart) {
            this.chart.dispose();
            this.chart = null;
        }
    };
    /**
     * resize chart
     */
    NgxEchartsDirective.prototype.resize = function () {
        if (this.chart) {
            this.chart.resize();
        }
    };
    NgxEchartsDirective.prototype.toggleLoading = function (loading) {
        if (this.chart) {
            loading
                ? this.chart.showLoading(this.loadingType, this.loadingOpts)
                : this.chart.hideLoading();
        }
    };
    NgxEchartsDirective.prototype.setOption = function (option, opts) {
        if (this.chart) {
            try {
                this.chart.setOption(option, opts);
            }
            catch (e) {
                console.error(e);
                this.optionsError.emit(e);
            }
        }
    };
    /**
     * dispose old chart and create a new one.
     */
    NgxEchartsDirective.prototype.refreshChart = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.dispose();
                        return [4 /*yield*/, this.initChart()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NgxEchartsDirective.prototype.createChart = function () {
        var _this = this;
        var dom = this.el.nativeElement;
        if (window && window.getComputedStyle) {
            var prop = window.getComputedStyle(dom, null).getPropertyValue('height');
            if ((!prop || prop === '0px') && (!dom.style.height || dom.style.height === '0px')) {
                dom.style.height = '400px';
            }
        }
        // here a bit tricky: we check if the echarts module is provided as function returning native import('...') then use the promise
        // otherwise create the function that imitates behaviour above with a provided as is module
        return this.ngZone.runOutsideAngular(function () {
            var load = typeof _this.echarts === 'function' ? _this.echarts : function () { return Promise.resolve(_this.echarts); };
            return load().then(function (_a) {
                var init = _a.init;
                return init(dom, _this.theme, _this.initOpts);
            });
        });
    };
    NgxEchartsDirective.prototype.initChart = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.onOptionsChange(this.options)];
                    case 1:
                        _a.sent();
                        if (this.merge && this.chart) {
                            this.setOption(this.merge);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    NgxEchartsDirective.prototype.onOptionsChange = function (opt) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!opt) {
                            return [2 /*return*/];
                        }
                        if (!this.chart) return [3 /*break*/, 1];
                        this.setOption(this.options, true);
                        return [3 /*break*/, 3];
                    case 1:
                        _a = this;
                        return [4 /*yield*/, this.createChart()];
                    case 2:
                        _a.chart = _b.sent();
                        this.chartInit.emit(this.chart);
                        this.setOption(this.options, true);
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // allows to lazily bind to only those events that are requested through the `@Output` by parent components
    // see https://stackoverflow.com/questions/51787972/optimal-reentering-the-ngzone-from-eventemitter-event for more info
    NgxEchartsDirective.prototype.createLazyEvent = function (eventName) {
        var _this = this;
        return this.chartInit.pipe(switchMap(function (chart) {
            return new Observable(function (observer) {
                chart.on(eventName, function (data) { return _this.ngZone.run(function () { return observer.next(data); }); });
                return function () { return chart.off(eventName); };
            });
        }));
    };
    NgxEchartsDirective.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [NGX_ECHARTS_CONFIG,] }] },
        { type: ElementRef },
        { type: NgZone }
    ]; };
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
    return NgxEchartsDirective;
}());
export { NgxEchartsDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWVjaGFydHMuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmd4LWVjaGFydHMvIiwic291cmNlcyI6WyJsaWIvbmd4LWVjaGFydHMuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQ0wsYUFBYSxFQUNiLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLE1BQU0sRUFDTixjQUFjLEVBQ2QsS0FBSyxFQUNMLE1BQU0sRUFDTixTQUFTLEVBQ1QsU0FBUyxFQUNULE1BQU0sRUFDTixNQUFNLEVBQ04sYUFBYSxHQUNkLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sY0FBYyxNQUFNLDBCQUEwQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDbEMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQU0vQyxNQUFNLENBQUMsSUFBTSxrQkFBa0IsR0FBRyxJQUFJLGNBQWMsQ0FBbUIsb0JBQW9CLENBQUMsQ0FBQztBQU03RjtJQTZERSw2QkFDOEIsTUFBd0IsRUFDNUMsRUFBYyxFQUNkLE1BQWM7UUFEZCxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQ2QsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQXJEZixlQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLGdCQUFXLEdBQUcsU0FBUyxDQUFDO1FBR2pDLHFCQUFxQjtRQUNYLGNBQVMsR0FBRyxJQUFJLFlBQVksRUFBTyxDQUFDO1FBQ3BDLGlCQUFZLEdBQUcsSUFBSSxZQUFZLEVBQVMsQ0FBQztRQUVuRCx1QkFBdUI7UUFDYixlQUFVLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzQyxrQkFBYSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDakQsbUJBQWMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25ELG1CQUFjLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNuRCxpQkFBWSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDL0MsbUJBQWMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25ELGtCQUFhLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNqRCxtQkFBYyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbkQscUJBQWdCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUVqRSx1QkFBdUI7UUFDYiw2QkFBd0IsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDdkUsd0JBQW1CLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzdELDBCQUFxQixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNqRSxzQkFBaUIsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3pELGtCQUFhLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNqRCwyQkFBc0IsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDbkUseUJBQW9CLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQy9ELDZCQUF3QixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUN2RSxpQkFBWSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDL0MseUJBQW9CLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQy9ELDBCQUFxQixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNqRSwwQkFBcUIsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDakUscUJBQWdCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN2RCx1QkFBa0IsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzNELDBCQUFxQixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNqRSxxQkFBZ0IsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3ZELHVCQUFrQixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDM0QsMEJBQXFCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ2pFLDRCQUF1QixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUNyRSw4QkFBeUIsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDekUsZUFBVSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0Msa0JBQWEsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2pELHVCQUFrQixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDM0Qsa0JBQWEsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2pELGtCQUFhLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQVd6RCxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDaEMsQ0FBQztJQUVELHlDQUFXLEdBQVgsVUFBWSxPQUFzQjtRQUFsQyxpQkFNQztRQUxDLElBQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDeEMsTUFBTSxDQUFDLGdCQUFnQixDQUFNLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFDLEdBQUcsSUFBSyxPQUFBLEtBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEVBQXpCLENBQXlCLENBQUMsQ0FBQztRQUN0RixNQUFNLENBQUMsZ0JBQWdCLENBQU0sT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQUMsR0FBRyxJQUFLLE9BQUEsS0FBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBbkIsQ0FBbUIsQ0FBQyxDQUFDO1FBQzlFLE1BQU0sQ0FBQyxHQUFHLENBQVUsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQUMsQ0FBQyxJQUFLLE9BQUEsS0FBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQXZCLENBQXVCLENBQUMsQ0FBQztRQUN6RSxNQUFNLENBQUMsUUFBUSxDQUFTLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxjQUFNLE9BQUEsS0FBSSxDQUFDLFlBQVksRUFBRSxFQUFuQixDQUFtQixDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUVELHNDQUFRLEdBQVI7UUFBQSxpQkFLQztRQUpDLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNuQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksY0FBYyxDQUFDLGNBQU0sT0FBQSxLQUFJLENBQUMsTUFBTSxFQUFFLEVBQWIsQ0FBYSxDQUFDLENBQUM7WUFDekQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsQ0FBQztTQUMvQztJQUNILENBQUM7SUFFRCx5Q0FBVyxHQUFYO1FBQ0UsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2xCLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUM7U0FDakQ7UUFDRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQUVELDZDQUFlLEdBQWY7UUFBQSxpQkFFQztRQURDLFVBQVUsQ0FBQyxjQUFNLE9BQUEsS0FBSSxDQUFDLFNBQVMsRUFBRSxFQUFoQixDQUFnQixDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVPLHFDQUFPLEdBQWY7UUFDRSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDZCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1NBQ25CO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0gsb0NBQU0sR0FBTjtRQUNFLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNkLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDckI7SUFDSCxDQUFDO0lBRU8sMkNBQWEsR0FBckIsVUFBc0IsT0FBZ0I7UUFDcEMsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ2QsT0FBTztnQkFDTCxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDO2dCQUM1RCxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUM5QjtJQUNILENBQUM7SUFFTyx1Q0FBUyxHQUFqQixVQUFrQixNQUFXLEVBQUUsSUFBVTtRQUN2QyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDZCxJQUFJO2dCQUNGLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQzthQUNwQztZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzNCO1NBQ0Y7SUFDSCxDQUFDO0lBRUQ7O09BRUc7SUFDRywwQ0FBWSxHQUFsQjs7Ozs7d0JBQ0UsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO3dCQUNmLHFCQUFNLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBQTs7d0JBQXRCLFNBQXNCLENBQUM7Ozs7O0tBQ3hCO0lBRU8seUNBQVcsR0FBbkI7UUFBQSxpQkFrQkM7UUFqQkMsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUM7UUFFbEMsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLGdCQUFnQixFQUFFO1lBQ3JDLElBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDM0UsSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksS0FBSyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssS0FBSyxDQUFDLEVBQUU7Z0JBQ2xGLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQzthQUM1QjtTQUNGO1FBRUQsZ0lBQWdJO1FBQ2hJLDJGQUEyRjtRQUMzRixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUM7WUFDbkMsSUFBTSxJQUFJLEdBQ1IsT0FBTyxLQUFJLENBQUMsT0FBTyxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsY0FBTSxPQUFBLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSSxDQUFDLE9BQU8sQ0FBQyxFQUE3QixDQUE2QixDQUFDO1lBRTFGLE9BQU8sSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQUMsRUFBUTtvQkFBTixjQUFJO2dCQUFPLE9BQUEsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFJLENBQUMsS0FBSyxFQUFFLEtBQUksQ0FBQyxRQUFRLENBQUM7WUFBcEMsQ0FBb0MsQ0FBQyxDQUFDO1FBQ3pFLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVhLHVDQUFTLEdBQXZCOzs7OzRCQUNFLHFCQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFBOzt3QkFBeEMsU0FBd0MsQ0FBQzt3QkFFekMsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7NEJBQzVCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO3lCQUM1Qjs7Ozs7S0FDRjtJQUVhLDZDQUFlLEdBQTdCLFVBQThCLEdBQVE7Ozs7Ozt3QkFDcEMsSUFBSSxDQUFDLEdBQUcsRUFBRTs0QkFDUixzQkFBTzt5QkFDUjs2QkFFRyxJQUFJLENBQUMsS0FBSyxFQUFWLHdCQUFVO3dCQUNaLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQzs7O3dCQUVuQyxLQUFBLElBQUksQ0FBQTt3QkFBUyxxQkFBTSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUE7O3dCQUFyQyxHQUFLLEtBQUssR0FBRyxTQUF3QixDQUFDO3dCQUN0QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ2hDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQzs7Ozs7O0tBRXRDO0lBRUQsMkdBQTJHO0lBQzNHLHVIQUF1SDtJQUMvRyw2Q0FBZSxHQUF2QixVQUEyQixTQUFpQjtRQUE1QyxpQkFVQztRQVRDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQ3hCLFNBQVMsQ0FDUCxVQUFDLEtBQVU7WUFDVCxPQUFBLElBQUksVUFBVSxDQUFDLFVBQUMsUUFBUTtnQkFDdEIsS0FBSyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsVUFBQyxJQUFPLElBQUssT0FBQSxLQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxjQUFNLE9BQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBbkIsQ0FBbUIsQ0FBQyxFQUExQyxDQUEwQyxDQUFDLENBQUM7Z0JBQzdFLE9BQU8sY0FBTSxPQUFBLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQXBCLENBQW9CLENBQUM7WUFDcEMsQ0FBQyxDQUFDO1FBSEYsQ0FHRSxDQUNMLENBQ2lCLENBQUM7SUFDdkIsQ0FBQzs7Z0RBbElFLE1BQU0sU0FBQyxrQkFBa0I7Z0JBQ2QsVUFBVTtnQkFDTixNQUFNOztJQS9EZjtRQUFSLEtBQUssRUFBRTt3REFBYztJQUNiO1FBQVIsS0FBSyxFQUFFO3NEQUFlO0lBQ2Q7UUFBUixLQUFLLEVBQUU7d0RBQWtCO0lBQ2pCO1FBQVIsS0FBSyxFQUFFO3lEQUtOO0lBQ087UUFBUixLQUFLLEVBQUU7c0RBQVk7SUFDWDtRQUFSLEtBQUssRUFBRTsyREFBbUI7SUFDbEI7UUFBUixLQUFLLEVBQUU7NERBQXlCO0lBQ3hCO1FBQVIsS0FBSyxFQUFFOzREQUFxQjtJQUduQjtRQUFULE1BQU0sRUFBRTswREFBcUM7SUFDcEM7UUFBVCxNQUFNLEVBQUU7NkRBQTBDO0lBR3pDO1FBQVQsTUFBTSxFQUFFOzJEQUE0QztJQUMzQztRQUFULE1BQU0sRUFBRTs4REFBa0Q7SUFDakQ7UUFBVCxNQUFNLEVBQUU7K0RBQW9EO0lBQ25EO1FBQVQsTUFBTSxFQUFFOytEQUFvRDtJQUNuRDtRQUFULE1BQU0sRUFBRTs2REFBZ0Q7SUFDL0M7UUFBVCxNQUFNLEVBQUU7K0RBQW9EO0lBQ25EO1FBQVQsTUFBTSxFQUFFOzhEQUFrRDtJQUNqRDtRQUFULE1BQU0sRUFBRTsrREFBb0Q7SUFDbkQ7UUFBVCxNQUFNLEVBQUU7aUVBQXdEO0lBR3ZEO1FBQVQsTUFBTSxFQUFFO3lFQUF3RTtJQUN2RTtRQUFULE1BQU0sRUFBRTtvRUFBOEQ7SUFDN0Q7UUFBVCxNQUFNLEVBQUU7c0VBQWtFO0lBQ2pFO1FBQVQsTUFBTSxFQUFFO2tFQUEwRDtJQUN6RDtRQUFULE1BQU0sRUFBRTs4REFBa0Q7SUFDakQ7UUFBVCxNQUFNLEVBQUU7dUVBQW9FO0lBQ25FO1FBQVQsTUFBTSxFQUFFO3FFQUFnRTtJQUMvRDtRQUFULE1BQU0sRUFBRTt5RUFBd0U7SUFDdkU7UUFBVCxNQUFNLEVBQUU7NkRBQWdEO0lBQy9DO1FBQVQsTUFBTSxFQUFFO3FFQUFnRTtJQUMvRDtRQUFULE1BQU0sRUFBRTtzRUFBa0U7SUFDakU7UUFBVCxNQUFNLEVBQUU7c0VBQWtFO0lBQ2pFO1FBQVQsTUFBTSxFQUFFO2lFQUF3RDtJQUN2RDtRQUFULE1BQU0sRUFBRTttRUFBNEQ7SUFDM0Q7UUFBVCxNQUFNLEVBQUU7c0VBQWtFO0lBQ2pFO1FBQVQsTUFBTSxFQUFFO2lFQUF3RDtJQUN2RDtRQUFULE1BQU0sRUFBRTttRUFBNEQ7SUFDM0Q7UUFBVCxNQUFNLEVBQUU7c0VBQWtFO0lBQ2pFO1FBQVQsTUFBTSxFQUFFO3dFQUFzRTtJQUNyRTtRQUFULE1BQU0sRUFBRTswRUFBMEU7SUFDekU7UUFBVCxNQUFNLEVBQUU7MkRBQTRDO0lBQzNDO1FBQVQsTUFBTSxFQUFFOzhEQUFrRDtJQUNqRDtRQUFULE1BQU0sRUFBRTttRUFBNEQ7SUFDM0Q7UUFBVCxNQUFNLEVBQUU7OERBQWtEO0lBQ2pEO1FBQVQsTUFBTSxFQUFFOzhEQUFrRDtJQXZEaEQsbUJBQW1CO1FBSi9CLFNBQVMsQ0FBQztZQUNULFFBQVEsRUFBRSxvQkFBb0I7WUFDOUIsUUFBUSxFQUFFLFNBQVM7U0FDcEIsQ0FBQztRQStERyxXQUFBLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO09BOURsQixtQkFBbUIsQ0FpTS9CO0lBQUQsMEJBQUM7Q0FBQSxBQWpNRCxJQWlNQztTQWpNWSxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5qZWN0LFxuICBJbmplY3Rpb25Ub2tlbixcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3V0cHV0LFxuICBTaW1wbGVDaGFuZ2VzLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCBSZXNpemVPYnNlcnZlciBmcm9tICdyZXNpemUtb2JzZXJ2ZXItcG9seWZpbGwnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgc3dpdGNoTWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgQ2hhbmdlRmlsdGVyIH0gZnJvbSAnLi9jaGFuZ2UtZmlsdGVyJztcblxuZXhwb3J0IGludGVyZmFjZSBOZ3hFY2hhcnRzQ29uZmlnIHtcbiAgZWNoYXJ0czogYW55IHwgKCgpID0+IFByb21pc2U8YW55Pik7XG59XG5cbmV4cG9ydCBjb25zdCBOR1hfRUNIQVJUU19DT05GSUcgPSBuZXcgSW5qZWN0aW9uVG9rZW48Tmd4RWNoYXJ0c0NvbmZpZz4oJ05HWF9FQ0hBUlRTX0NPTkZJRycpO1xuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdlY2hhcnRzLCBbZWNoYXJ0c10nLFxuICBleHBvcnRBczogJ2VjaGFydHMnLFxufSlcbmV4cG9ydCBjbGFzcyBOZ3hFY2hhcnRzRGlyZWN0aXZlIGltcGxlbWVudHMgT25DaGFuZ2VzLCBPbkRlc3Ryb3ksIE9uSW5pdCwgQWZ0ZXJWaWV3SW5pdCB7XG4gIEBJbnB1dCgpIG9wdGlvbnM6IGFueTtcbiAgQElucHV0KCkgdGhlbWU6IHN0cmluZztcbiAgQElucHV0KCkgbG9hZGluZzogYm9vbGVhbjtcbiAgQElucHV0KCkgaW5pdE9wdHM6IHtcbiAgICBkZXZpY2VQaXhlbFJhdGlvPzogbnVtYmVyO1xuICAgIHJlbmRlcmVyPzogc3RyaW5nO1xuICAgIHdpZHRoPzogbnVtYmVyIHwgc3RyaW5nO1xuICAgIGhlaWdodD86IG51bWJlciB8IHN0cmluZztcbiAgfTtcbiAgQElucHV0KCkgbWVyZ2U6IGFueTtcbiAgQElucHV0KCkgYXV0b1Jlc2l6ZSA9IHRydWU7XG4gIEBJbnB1dCgpIGxvYWRpbmdUeXBlID0gJ2RlZmF1bHQnO1xuICBASW5wdXQoKSBsb2FkaW5nT3B0czogb2JqZWN0O1xuXG4gIC8vIG5neC1lY2hhcnRzIGV2ZW50c1xuICBAT3V0cHV0KCkgY2hhcnRJbml0ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gIEBPdXRwdXQoKSBvcHRpb25zRXJyb3IgPSBuZXcgRXZlbnRFbWl0dGVyPEVycm9yPigpO1xuXG4gIC8vIGVjaGFydHMgbW91c2UgZXZlbnRzXG4gIEBPdXRwdXQoKSBjaGFydENsaWNrID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ2NsaWNrJyk7XG4gIEBPdXRwdXQoKSBjaGFydERibENsaWNrID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ2RibGNsaWNrJyk7XG4gIEBPdXRwdXQoKSBjaGFydE1vdXNlRG93biA9IHRoaXMuY3JlYXRlTGF6eUV2ZW50KCdtb3VzZWRvd24nKTtcbiAgQE91dHB1dCgpIGNoYXJ0TW91c2VNb3ZlID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ21vdXNlbW92ZScpO1xuICBAT3V0cHV0KCkgY2hhcnRNb3VzZVVwID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ21vdXNldXAnKTtcbiAgQE91dHB1dCgpIGNoYXJ0TW91c2VPdmVyID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ21vdXNlb3ZlcicpO1xuICBAT3V0cHV0KCkgY2hhcnRNb3VzZU91dCA9IHRoaXMuY3JlYXRlTGF6eUV2ZW50KCdtb3VzZW91dCcpO1xuICBAT3V0cHV0KCkgY2hhcnRHbG9iYWxPdXQgPSB0aGlzLmNyZWF0ZUxhenlFdmVudCgnZ2xvYmFsb3V0Jyk7XG4gIEBPdXRwdXQoKSBjaGFydENvbnRleHRNZW51ID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ2NvbnRleHRtZW51Jyk7XG5cbiAgLy8gZWNoYXJ0cyBtb3VzZSBldmVudHNcbiAgQE91dHB1dCgpIGNoYXJ0TGVnZW5kU2VsZWN0Q2hhbmdlZCA9IHRoaXMuY3JlYXRlTGF6eUV2ZW50KCdsZWdlbmRzZWxlY3RjaGFuZ2VkJyk7XG4gIEBPdXRwdXQoKSBjaGFydExlZ2VuZFNlbGVjdGVkID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ2xlZ2VuZHNlbGVjdGVkJyk7XG4gIEBPdXRwdXQoKSBjaGFydExlZ2VuZFVuc2VsZWN0ZWQgPSB0aGlzLmNyZWF0ZUxhenlFdmVudCgnbGVnZW5kdW5zZWxlY3RlZCcpO1xuICBAT3V0cHV0KCkgY2hhcnRMZWdlbmRTY3JvbGwgPSB0aGlzLmNyZWF0ZUxhenlFdmVudCgnbGVnZW5kc2Nyb2xsJyk7XG4gIEBPdXRwdXQoKSBjaGFydERhdGFab29tID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ2RhdGF6b29tJyk7XG4gIEBPdXRwdXQoKSBjaGFydERhdGFSYW5nZVNlbGVjdGVkID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ2RhdGFyYW5nZXNlbGVjdGVkJyk7XG4gIEBPdXRwdXQoKSBjaGFydFRpbWVsaW5lQ2hhbmdlZCA9IHRoaXMuY3JlYXRlTGF6eUV2ZW50KCd0aW1lbGluZWNoYW5nZWQnKTtcbiAgQE91dHB1dCgpIGNoYXJ0VGltZWxpbmVQbGF5Q2hhbmdlZCA9IHRoaXMuY3JlYXRlTGF6eUV2ZW50KCd0aW1lbGluZXBsYXljaGFuZ2VkJyk7XG4gIEBPdXRwdXQoKSBjaGFydFJlc3RvcmUgPSB0aGlzLmNyZWF0ZUxhenlFdmVudCgncmVzdG9yZScpO1xuICBAT3V0cHV0KCkgY2hhcnREYXRhVmlld0NoYW5nZWQgPSB0aGlzLmNyZWF0ZUxhenlFdmVudCgnZGF0YXZpZXdjaGFuZ2VkJyk7XG4gIEBPdXRwdXQoKSBjaGFydE1hZ2ljVHlwZUNoYW5nZWQgPSB0aGlzLmNyZWF0ZUxhenlFdmVudCgnbWFnaWN0eXBlY2hhbmdlZCcpO1xuICBAT3V0cHV0KCkgY2hhcnRQaWVTZWxlY3RDaGFuZ2VkID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ3BpZXNlbGVjdGNoYW5nZWQnKTtcbiAgQE91dHB1dCgpIGNoYXJ0UGllU2VsZWN0ZWQgPSB0aGlzLmNyZWF0ZUxhenlFdmVudCgncGllc2VsZWN0ZWQnKTtcbiAgQE91dHB1dCgpIGNoYXJ0UGllVW5zZWxlY3RlZCA9IHRoaXMuY3JlYXRlTGF6eUV2ZW50KCdwaWV1bnNlbGVjdGVkJyk7XG4gIEBPdXRwdXQoKSBjaGFydE1hcFNlbGVjdENoYW5nZWQgPSB0aGlzLmNyZWF0ZUxhenlFdmVudCgnbWFwc2VsZWN0Y2hhbmdlZCcpO1xuICBAT3V0cHV0KCkgY2hhcnRNYXBTZWxlY3RlZCA9IHRoaXMuY3JlYXRlTGF6eUV2ZW50KCdtYXBzZWxlY3RlZCcpO1xuICBAT3V0cHV0KCkgY2hhcnRNYXBVbnNlbGVjdGVkID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ21hcHVuc2VsZWN0ZWQnKTtcbiAgQE91dHB1dCgpIGNoYXJ0QXhpc0FyZWFTZWxlY3RlZCA9IHRoaXMuY3JlYXRlTGF6eUV2ZW50KCdheGlzYXJlYXNlbGVjdGVkJyk7XG4gIEBPdXRwdXQoKSBjaGFydEZvY3VzTm9kZUFkamFjZW5jeSA9IHRoaXMuY3JlYXRlTGF6eUV2ZW50KCdmb2N1c25vZGVhZGphY2VuY3knKTtcbiAgQE91dHB1dCgpIGNoYXJ0VW5mb2N1c05vZGVBZGphY2VuY3kgPSB0aGlzLmNyZWF0ZUxhenlFdmVudCgndW5mb2N1c25vZGVhZGphY2VuY3knKTtcbiAgQE91dHB1dCgpIGNoYXJ0QnJ1c2ggPSB0aGlzLmNyZWF0ZUxhenlFdmVudCgnYnJ1c2gnKTtcbiAgQE91dHB1dCgpIGNoYXJ0QnJ1c2hFbmQgPSB0aGlzLmNyZWF0ZUxhenlFdmVudCgnYnJ1c2hlbmQnKTtcbiAgQE91dHB1dCgpIGNoYXJ0QnJ1c2hTZWxlY3RlZCA9IHRoaXMuY3JlYXRlTGF6eUV2ZW50KCdicnVzaHNlbGVjdGVkJyk7XG4gIEBPdXRwdXQoKSBjaGFydFJlbmRlcmVkID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ3JlbmRlcmVkJyk7XG4gIEBPdXRwdXQoKSBjaGFydEZpbmlzaGVkID0gdGhpcy5jcmVhdGVMYXp5RXZlbnQoJ2ZpbmlzaGVkJyk7XG5cbiAgcHJpdmF0ZSBjaGFydDogYW55O1xuICBwcml2YXRlIGVjaGFydHM6IGFueTtcbiAgcHJpdmF0ZSByZXNpemVTdWI6IFJlc2l6ZU9ic2VydmVyO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3QoTkdYX0VDSEFSVFNfQ09ORklHKSBjb25maWc6IE5neEVjaGFydHNDb25maWcsXG4gICAgcHJpdmF0ZSBlbDogRWxlbWVudFJlZixcbiAgICBwcml2YXRlIG5nWm9uZTogTmdab25lLFxuICApIHtcbiAgICB0aGlzLmVjaGFydHMgPSBjb25maWcuZWNoYXJ0cztcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBjb25zdCBmaWx0ZXIgPSBDaGFuZ2VGaWx0ZXIub2YoY2hhbmdlcyk7XG4gICAgZmlsdGVyLm5vdEZpcnN0QW5kRW1wdHk8YW55Pignb3B0aW9ucycpLnN1YnNjcmliZSgob3B0KSA9PiB0aGlzLm9uT3B0aW9uc0NoYW5nZShvcHQpKTtcbiAgICBmaWx0ZXIubm90Rmlyc3RBbmRFbXB0eTxhbnk+KCdtZXJnZScpLnN1YnNjcmliZSgob3B0KSA9PiB0aGlzLnNldE9wdGlvbihvcHQpKTtcbiAgICBmaWx0ZXIuaGFzPGJvb2xlYW4+KCdsb2FkaW5nJykuc3Vic2NyaWJlKCh2KSA9PiB0aGlzLnRvZ2dsZUxvYWRpbmcoISF2KSk7XG4gICAgZmlsdGVyLm5vdEZpcnN0PHN0cmluZz4oJ3RoZW1lJykuc3Vic2NyaWJlKCgpID0+IHRoaXMucmVmcmVzaENoYXJ0KCkpO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgaWYgKHRoaXMuYXV0b1Jlc2l6ZSkge1xuICAgICAgdGhpcy5yZXNpemVTdWIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4gdGhpcy5yZXNpemUoKSk7XG4gICAgICB0aGlzLnJlc2l6ZVN1Yi5vYnNlcnZlKHRoaXMuZWwubmF0aXZlRWxlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMucmVzaXplU3ViKSB7XG4gICAgICB0aGlzLnJlc2l6ZVN1Yi51bm9ic2VydmUodGhpcy5lbC5uYXRpdmVFbGVtZW50KTtcbiAgICB9XG4gICAgdGhpcy5kaXNwb3NlKCk7XG4gIH1cblxuICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmluaXRDaGFydCgpKTtcbiAgfVxuXG4gIHByaXZhdGUgZGlzcG9zZSgpIHtcbiAgICBpZiAodGhpcy5jaGFydCkge1xuICAgICAgdGhpcy5jaGFydC5kaXNwb3NlKCk7XG4gICAgICB0aGlzLmNoYXJ0ID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogcmVzaXplIGNoYXJ0XG4gICAqL1xuICByZXNpemUoKSB7XG4gICAgaWYgKHRoaXMuY2hhcnQpIHtcbiAgICAgIHRoaXMuY2hhcnQucmVzaXplKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSB0b2dnbGVMb2FkaW5nKGxvYWRpbmc6IGJvb2xlYW4pIHtcbiAgICBpZiAodGhpcy5jaGFydCkge1xuICAgICAgbG9hZGluZ1xuICAgICAgICA/IHRoaXMuY2hhcnQuc2hvd0xvYWRpbmcodGhpcy5sb2FkaW5nVHlwZSwgdGhpcy5sb2FkaW5nT3B0cylcbiAgICAgICAgOiB0aGlzLmNoYXJ0LmhpZGVMb2FkaW5nKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzZXRPcHRpb24ob3B0aW9uOiBhbnksIG9wdHM/OiBhbnkpIHtcbiAgICBpZiAodGhpcy5jaGFydCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5jaGFydC5zZXRPcHRpb24ob3B0aW9uLCBvcHRzKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgdGhpcy5vcHRpb25zRXJyb3IuZW1pdChlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogZGlzcG9zZSBvbGQgY2hhcnQgYW5kIGNyZWF0ZSBhIG5ldyBvbmUuXG4gICAqL1xuICBhc3luYyByZWZyZXNoQ2hhcnQoKSB7XG4gICAgdGhpcy5kaXNwb3NlKCk7XG4gICAgYXdhaXQgdGhpcy5pbml0Q2hhcnQoKTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlQ2hhcnQoKSB7XG4gICAgY29uc3QgZG9tID0gdGhpcy5lbC5uYXRpdmVFbGVtZW50O1xuXG4gICAgaWYgKHdpbmRvdyAmJiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSkge1xuICAgICAgY29uc3QgcHJvcCA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGRvbSwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZSgnaGVpZ2h0Jyk7XG4gICAgICBpZiAoKCFwcm9wIHx8IHByb3AgPT09ICcwcHgnKSAmJiAoIWRvbS5zdHlsZS5oZWlnaHQgfHwgZG9tLnN0eWxlLmhlaWdodCA9PT0gJzBweCcpKSB7XG4gICAgICAgIGRvbS5zdHlsZS5oZWlnaHQgPSAnNDAwcHgnO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGhlcmUgYSBiaXQgdHJpY2t5OiB3ZSBjaGVjayBpZiB0aGUgZWNoYXJ0cyBtb2R1bGUgaXMgcHJvdmlkZWQgYXMgZnVuY3Rpb24gcmV0dXJuaW5nIG5hdGl2ZSBpbXBvcnQoJy4uLicpIHRoZW4gdXNlIHRoZSBwcm9taXNlXG4gICAgLy8gb3RoZXJ3aXNlIGNyZWF0ZSB0aGUgZnVuY3Rpb24gdGhhdCBpbWl0YXRlcyBiZWhhdmlvdXIgYWJvdmUgd2l0aCBhIHByb3ZpZGVkIGFzIGlzIG1vZHVsZVxuICAgIHJldHVybiB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICBjb25zdCBsb2FkID1cbiAgICAgICAgdHlwZW9mIHRoaXMuZWNoYXJ0cyA9PT0gJ2Z1bmN0aW9uJyA/IHRoaXMuZWNoYXJ0cyA6ICgpID0+IFByb21pc2UucmVzb2x2ZSh0aGlzLmVjaGFydHMpO1xuXG4gICAgICByZXR1cm4gbG9hZCgpLnRoZW4oKHsgaW5pdCB9KSA9PiBpbml0KGRvbSwgdGhpcy50aGVtZSwgdGhpcy5pbml0T3B0cykpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBpbml0Q2hhcnQoKSB7XG4gICAgYXdhaXQgdGhpcy5vbk9wdGlvbnNDaGFuZ2UodGhpcy5vcHRpb25zKTtcblxuICAgIGlmICh0aGlzLm1lcmdlICYmIHRoaXMuY2hhcnQpIHtcbiAgICAgIHRoaXMuc2V0T3B0aW9uKHRoaXMubWVyZ2UpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgb25PcHRpb25zQ2hhbmdlKG9wdDogYW55KSB7XG4gICAgaWYgKCFvcHQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jaGFydCkge1xuICAgICAgdGhpcy5zZXRPcHRpb24odGhpcy5vcHRpb25zLCB0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jaGFydCA9IGF3YWl0IHRoaXMuY3JlYXRlQ2hhcnQoKTtcbiAgICAgIHRoaXMuY2hhcnRJbml0LmVtaXQodGhpcy5jaGFydCk7XG4gICAgICB0aGlzLnNldE9wdGlvbih0aGlzLm9wdGlvbnMsIHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGFsbG93cyB0byBsYXppbHkgYmluZCB0byBvbmx5IHRob3NlIGV2ZW50cyB0aGF0IGFyZSByZXF1ZXN0ZWQgdGhyb3VnaCB0aGUgYEBPdXRwdXRgIGJ5IHBhcmVudCBjb21wb25lbnRzXG4gIC8vIHNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81MTc4Nzk3Mi9vcHRpbWFsLXJlZW50ZXJpbmctdGhlLW5nem9uZS1mcm9tLWV2ZW50ZW1pdHRlci1ldmVudCBmb3IgbW9yZSBpbmZvXG4gIHByaXZhdGUgY3JlYXRlTGF6eUV2ZW50PFQ+KGV2ZW50TmFtZTogc3RyaW5nKTogRXZlbnRFbWl0dGVyPFQ+IHtcbiAgICByZXR1cm4gdGhpcy5jaGFydEluaXQucGlwZShcbiAgICAgIHN3aXRjaE1hcChcbiAgICAgICAgKGNoYXJ0OiBhbnkpID0+XG4gICAgICAgICAgbmV3IE9ic2VydmFibGUoKG9ic2VydmVyKSA9PiB7XG4gICAgICAgICAgICBjaGFydC5vbihldmVudE5hbWUsIChkYXRhOiBUKSA9PiB0aGlzLm5nWm9uZS5ydW4oKCkgPT4gb2JzZXJ2ZXIubmV4dChkYXRhKSkpO1xuICAgICAgICAgICAgcmV0dXJuICgpID0+IGNoYXJ0Lm9mZihldmVudE5hbWUpO1xuICAgICAgICAgIH0pLFxuICAgICAgKSxcbiAgICApIGFzIEV2ZW50RW1pdHRlcjxUPjtcbiAgfVxufVxuIl19