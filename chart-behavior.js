/* External Polymer Styles/elements dependency */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';

import '@polymer/paper-spinner/paper-spinner.js';
import '@polymer/paper-spinner/paper-spinner-lite.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="shared-settings">
    <template>
        <style>
            :host {
                margin: 2px;
            }

            #chartSettingsContainer {
                position: absolute;
                top: 0;
                right: 0;
                border: 1px solid #000;
                border-radius: 2px;
                margin: 1px;
                z-index: 3;
            }

            .dragHandle {
                z-index: 2;
            }

            #chartSettingsIcon,
            #chartColorsIcon,
            #chartRemoveIcon,
            #chartExpandIcon,
            #chartContractIcon {
                float: right;
                width: 24px;
                height: 24px;
                padding: 1px;
            }

            paper-spinner-lite {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translateX(-50%) translateY(-50%);
                height: 75px;
                width: 75px;
                z-index: -1;
            }
        </style>
    </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
/**
 * `ChartBehavior` is an interface to all epiviz-charts. It implements common methods and properties
 * on all plots and tracks. All charts inherit this behavior.
 *
 * @polymerBehavior
**/

EpivizChartBehavior = function (superClass) {
    return class extends superClass {
        constructor() {
            super();
            //this.addEventListener('iron-resize', e => this._onResize(e));
            this.addEventListener('transitionend', e => {
                this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(50), () => this._onResize(e));
            });
        }

        static get properties() {
            return {
                /**
                * Measurements for the chart. (x and y axis measurements)
                * Charts automatically sets measurements from `dimS`.
                *
                * Note: Either `measurements` or `dimS` have to be defined on the chart.
                * 
                * @type {Array<Object>}
                */
                measurements: {
                    type: Array,
                    notify: true,
                    observer: '_measurementsChanged'
                },

                /**
                 * Dimensions for a chart. (x and y axis measurements).
                 * if the parent container (navigation or environment) defines measurements, those can be
                 * used as measurements for charts.
                 *
                 * Note: Either `measurements` or `dimS` have to be defined on the chart.
                 * 
                 * @type {Array<string>}
                 */
                dimS: {
                    type: Array,
                    notify: true
                },

                /**
                 * Dimensions for a chart. (x and y axis measurements).
                 * if the parent container (navigation or environment) defines measurements, those can be
                 * used as measurements for charts.
                 *
                 * Note: Either `measurements` or `dimS` have to be defined on the chart.
                 * 
                 * @type {Array<string>}
                 */
                canvas: {
                    type: Boolean,
                    notify: true,
                    value: false
                },

                /**
                * Parent Container if chart is part of Nav or Env.
                *
                * @type {Object}
                */
                _parentContainer: {
                    type: Object,
                    notify: true,
                    observer: "_parentContainerChanged"
                },

                /**
                 * Whether to use a default data provider.
                 * Note: only for testing & development.
                 *
                 * @type {boolean}
                 */
                useDefaultDataProvider: {
                    type: Boolean,
                    notify: true
                },

                /**
                * Chart data object.
                *
                * @type {Object<epiviz.datatypes.MapGenomicData>}
                */
                data: {
                    type: Object,
                    notify: true,
                    observer: '_dataChanged'
                },

                /**
                 * Chart json data object.
                 *
                 * @type {Object}
                 */
                jsonData: {
                    type: Object,
                    notify: true,
                    observer: '_jsonDataChanged'
                },

                /**
                 * Unique plot-id. an id will be assigned if not set
                 *
                 * @type {string}
                 */
                plotId: {
                    type: String,
                    reflectToAttribute: true,
                    notify: true
                },

                /**
                * Measurements for the chart. Charts automatically sets measurements from `dimS`.
                *
                * @type {Array<Object>}
                */
                measurements: {
                    type: Array,
                    notify: true,
                    observer: '_measurementsChanged'
                },

                /**
                * Computed Range from `<chr>`, `<start>` & `<end>`. 
                *
                * @type {Object<epiviz.datatypes.GenomicRange>}
                */
                range: {
                    type: Object,
                    notify: true,
                    observer: '_rangeChanged'
                },

                /**
                * Chart Settings. 
                *
                * @type {Array.<epiviz.ui.charts.CustomSetting>}
                */
                chartSettings: {
                    type: Object,
                    notify: true,
                    observer: '_chartSettingsChanged'
                },

                /**
                 * Color palette to use.
                 *
                 * @type {Array<epiviz.ui.charts.ColorPalette>}
                 */
                chartColors: {
                    type: Array,
                    notify: true,
                    observer: '_chartColorsChanged'
                },

                /**
                 * if host is dragged. 
                 * used to remove events when a chart dragging is in progress.
                 *
                 * @type {boolean}
                 */
                hostDragging: {
                    type: Boolean,
                    value: false
                }
            };
        }

        static get observers() {
            return ['_dimChanged(dimX.*, dimY.*, dimS.*)'];
        }

        /**
         * Resizes the chart.
         * Automatically triggered when the browser window or the css for the element changes.
         */
        _onResize(e) {
            if (this.chart != null) {
                var parent = this._parentContainer;
                var width = Math.max(this.chartType.defaultWidth() / 2, this.offsetWidth - epiviz.ui.charts.Visualization.SVG_MARGIN) - 15;
                var height = Math.max(this.chartType.defaultHeight(), this.offsetHeight - epiviz.ui.charts.Visualization.SVG_MARGIN) - 15;
                if (parent) {
                    var prop = this._getStyle(this, "grid-column-start");
                    var columnSpan = this._getColumnSpan(prop);
                    if (columnSpan == 1) {
                        width = parent.offsetWidth / 6;
                    }
                }
                this.chart._properties.width = width;
                this.chart._properties.height = height;
                this._dataChanged();
                if (e) {
                    e.stopPropagation();
                }
            }
        }

        /**
         * Callback when a parent container is assigned to charts. 
         * Initialize chart brushing and other interaction events.
         * 
         * @return {string}
         */
        _parentContainerChanged() {
            var self = this;

            var parent = self._parentContainer;

            if (self.nodeName == "EPIVIZ-NAVIGATION") {

                parent.addEventListener('hoverAllCharts', function (e) {
                    if (self.collapsed) {
                        if (Array.isArray(e.detail.data)) {
                            for (var rIndex = 0; rIndex < e.detail.data.length; rIndex++) {
                                if (self.shadowRoot.querySelector("#navTrack").chartObject.overlapsWith(e.detail.data[rIndex])) {
                                    self.shadowRoot.querySelector("#navTrack").hover();
                                    break;
                                }
                            }
                        }
                        else {
                            if (self.shadowRoot.querySelector("#navTrack").chartObject.overlapsWith(e.detail.data)) {
                                self.shadowRoot.querySelector("#navTrack").hover();
                            }
                        }
                    }
                    else {
                        let navChildren =
                            FlattenedNodesObserver.getFlattenedNodes(self).filter(n => n.nodeType === Node.ELEMENT_NODE);
                        var numChildren = navChildren.length;
                        for (var index = 0; index < numChildren; index++) {
                            var currentChild = navChildren[index];
                            currentChild.hover(e.detail.data);
                        }
                    }
                }.bind(self));

                parent.addEventListener('unHoverAllCharts', function (e) {
                    if (self.collapsed) {
                        self.shadowRoot.querySelector("#navTrack").unHover();
                    }
                    else {
                        let navChildren =
                            FlattenedNodesObserver.getFlattenedNodes(self).filter(n => n.nodeType === Node.ELEMENT_NODE);
                        var numChildren = navChildren.length;
                        for (var index = 0; index < numChildren; index++) {
                            var currentChild = navChildren[index];
                            currentChild.unHover();
                        }
                    }
                }.bind(self));

                parent.addEventListener('selectAllCharts', function (e) {
                    if (!self.collapsed) {
                        if (Array.isArray(e.detail.data)) {
                            for (var rIndex = 0; rIndex < e.detail.data.length; rIndex++) {
                                if (self.shadowRoot.querySelector("#navTrack").chartObject.overlapsWith(e.detail.data[rIndex])) {
                                    self.shadowRoot.querySelector("#navTrack").hover();
                                    break;
                                }
                            }
                        }
                        else {
                            if (self.shadowRoot.querySelector("#navTrack").chartObject.overlapsWith(e.detail.data)) {
                                self.shadowRoot.querySelector("#navTrack").hover();
                            }
                        }
                    }
                    else {
                        let navChildren =
                            FlattenedNodesObserver.getFlattenedNodes(self).filter(n => n.nodeType === Node.ELEMENT_NODE);
                        var numChildren = navChildren.length;
                        for (var index = 0; index < numChildren; index++) {
                            var currentChild = navChildren[index];
                            currentChild.select(e.detail.data);
                        }
                    }
                }.bind(self));

                parent.addEventListener('unSelectAllCharts', function (e) {
                    if (!self.collapsed) {
                        self.shadowRoot.querySelector("#navTrack").unHover();
                    }
                    else {
                        let navChildren =
                            FlattenedNodesObserver.getFlattenedNodes(self).filter(n => n.nodeType === Node.ELEMENT_NODE);
                        var numChildren = navChildren.length;
                        for (var index = 0; index < numChildren; index++) {
                            var currentChild = navChildren[index];
                            currentChild.deSelect();
                        }
                    }
                }.bind(self));
            }
            else {
                parent.addEventListener('hoverAllCharts', function (e) {
                    if (!self.hostDragging) {
                        self.hover(e.detail.data);
                    }
                }.bind(self));

                parent.addEventListener('unHoverAllCharts', function (e) {
                    if (!self.hostDragging) {
                        self.unHover();
                    }
                }.bind(self));

                parent.addEventListener('selectAllCharts', function (e) {
                    if (!self.hostDragging) {
                        self.select(e.detail.data);
                    }
                }.bind(self));

                parent.addEventListener('unSelectAllCharts', function (e) {
                    if (!self.hostDragging) {
                        self.deSelect();
                    }
                }.bind(self));
            }
        }

        /**
         * Helper Function to generate a unique plot-id
         * 
         * @return {string}
         */
        _generatePlotId() {
            var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            var result = '';
            var size = 7;

            for (var i = 0; i < size; ++i) {
                result += chars[Math.round(Math.random() * (chars.length - 1))];
            }
            return 'epiviz-' + result;
        }

        /**
         * MeasurementChange/ChartDimension event handler.
         * Listens to when a chart dimensions(axes) are changed and redraws the chart.
         *
         * @fires dimChanged
         */
        _dimChanged() {
            /**
             * fires event when a chart dimensions are changed.
             *
             * @event dimChanged
             * @type {string}
             * @property {string} id - plot-id of the chart element.
             */
            // $('#' + this.plotId).empty();
            this.dispatchEvent(new CustomEvent('dimChanged',
                {
                    detail: {
                        id: this.plotId
                    }
                }
            )
            );
        }

        /**
         * chartSettings change event handler.
         * Listens to when a chart settings are changed and redraws the chart.
         */
        _chartSettingsChanged() {
            var self = this;
            if (self.chartSettings && self.chart) {
                self.chart.setCustomSettingsValues(self.chartSettings);
            }
        }

        /**
         * chartColors change event handler.
         * Listens to when a chart colors are changed and redraws the chart.
         */
        _chartColorsChanged() {
            var self = this;
            if (self.chartColors && self.chart) {
                self.chartColorPalette = new epiviz.ui.charts.ColorPalette(self.chartColors);
                self.chart.setColors(self.chartColorPalette);
                self._dataChanged();
            }
        }

        /**
        * ChartLocation/RangeChange event handler.
        */
        _rangeChanged() { }

        /**
        * MeasurementChange/ChartDimension event handler.
        * Listens to when a chart dimensions(axes) are changed and updates chart
        */
        _measurementsChanged() {

            var self = this;

            if (this.measurements != null && self.config != null) {

                $(this.shadowRoot.querySelector('#' + self.plotId)).empty();
                var mSet = new epiviz.measurements.MeasurementSet();

                for (var i = 0; i < self.measurements.length; i++) {

                    var measurement = self.measurements[i];
                    mSet.add(new epiviz.measurements.Measurement(
                        measurement.id,
                        measurement.name,
                        measurement.type,
                        measurement.datasourceId,
                        measurement.datasourceGroup,
                        measurement.dataprovider,
                        measurement.formula,
                        measurement.defaultChartType,
                        measurement.annotation,
                        measurement.minValue,
                        measurement.maxValue,
                        measurement.metadata
                    ));
                }

                self.visConfigSelection = new epiviz.ui.controls.VisConfigSelection(mSet);
                // self.chartType = new epiviz.plugins.charts.LineTrackType(self.config);
                self.chartType = self._createChart();

                var width = self.offsetWidth - 40;
                if (width < self.chartType.defaultWidth() / 2) { width = self.chartType.defaultWidth() / 2; }

                if (self.chartType) {
                    self.chartProperties = new epiviz.ui.charts.VisualizationProperties(
                        width - 15,
                        self.chartType.defaultHeight() - 15,
                        self.chartType.defaultMargins(),
                        self.visConfigSelection,
                        self.chartType.defaultColors(),
                        null,
                        self.chartType.customSettingsValues(),
                        self.chartType.customSettingsDefs(), [],
                        null
                    );

                    self.chart = self.chartType.createNew(self.plotId,
                        $(this.shadowRoot.querySelector('#' + self.plotId)),
                        self.chartProperties);

                    if (self.chartSettings != null || self.chartSettings != undefined) {
                        self.chart.setCustomSettingsValues(self.chartSettings);
                    }
                    else {
                        self.chartSettings = self.chart._customSettingsValues;
                    }

                    if (self.chartColors != null || self.chartColors != undefined) {
                        self.chartColorPalette = new epiviz.ui.charts.ColorPalette(self.chartColors);
                        self.chart.setColors(self.chartColorPalette);
                    }
                    else {
                        self.chartColorPalette = self.chart.colors();
                        self.chartColors = self.chartColorPalette._colors;
                    }

                    $(self).css('height', self.chartType.defaultHeight() + epiviz.ui.charts.Visualization.SVG_MARGIN);

                    self._initializeSettingsContainer();
                    self._initializeSettingsDialog();
                    self._initializeColorsDialog();
                    self._initializeRemoveDialog();
                    self._initializeResizeButtons();
                    self._initializeGrid();

                    // Listen to hover event on the chart
                    /**
                    * fires event when a chart data object is hovered.
                    *
                    * @event hover
                    * @type {object}
                    * @property {object} data - data object currently hovered.
                    */
                    self.chart.onHover().addListener(new epiviz.events.EventListener(
                        function (e) {
                            var id = e.id;
                            var data = e.args;
                            self.hover(data);
                            self.dispatchEvent(new CustomEvent('hover',
                                {
                                    detail: {
                                        id: id,
                                        data: data
                                    },
                                    bubbles: true
                                }
                            )
                            );
                        }
                    ));

                    /**
                    * fires event when a chart data object is unhovered.
                    *
                    * @event unHover
                    * @type {object}
                    * @property {object} data - data object currently hovered.
                    */
                    self.chart.onUnhover().addListener(new epiviz.events.EventListener(
                        function (e) {
                            var id = e.id;
                            var data = e.args;
                            self.unHover();
                            self.dispatchEvent(new CustomEvent('unHover',
                                {
                                    detail: {
                                        id: id
                                    },
                                    bubbles: true
                                }
                            )
                            );
                        }
                    ));

                    /**
                    * fires event when a chart data object is selected.
                    *
                    * @event select
                    * @type {object}
                    * @property {object} data - data object currently selected.
                    */
                    self.chart.onSelect().addListener(new epiviz.events.EventListener(
                        function (e) {
                            var id = e.id;
                            var data = e.args;
                            self.select(data);
                            self.dispatchEvent(new CustomEvent('select',
                                {
                                    detail: {
                                        id: id,
                                        data: data
                                    },
                                    bubbles: true
                                }
                            )
                            );
                        }
                    ));


                    /**
                    * fires event when a chart data object is unSelected.
                    *
                    * @event deSelect
                    * @type {object}
                    */
                    self.chart.onDeselect().addListener(new epiviz.events.EventListener(
                        function (e) {
                            var id = e.id;
                            self.deSelect();
                            self.dispatchEvent(new CustomEvent('deSelect',
                                {
                                    detail: {
                                        id: id
                                    },
                                    bubbles: true
                                }
                            )
                            );
                        }
                    ));
                }
            }
        }

        /**
         * ChartData change event handler.
         * Listens to when chart data is updated and redraws the chart.
         */
        _dataChanged() {
            if (this.data != null && this.chart != null) {
                this._draw();
            }
        }

        get_json_data() {
            var self = this;
            var jData = null;
            if (self.jsonData) { return self.jsonData; }

            if (self.nodeName == "EPIVIZ_GENES_TRACK") {

                jData = {
                    rows: {
                        start: [],
                        end: [],
                        chr: [],
                        id: null,
                        strand: [],
                        metadata: {
                            exon_ends: [],
                            gene: [],
                            exon_starts: []
                        }
                    }
                }

                var series = self.data.firstSeries();
                var indices = epiviz.utils.range(series.size());
                var dataItems = indices
                    .map(function (i) {
                        var cell = series.get(i);
                        var item = cell.rowItem;

                        jData.rows.start.push(item.start());
                        jData.rows.end.push(item.end());
                        jData.rows.chr.push(item.seqName());
                        jData.rows.strand.push(item.strand());
                        jData.rows.metadata.gene.push(item.metadata("gene"));
                        jData.rows.exon_ends.gene.push(item.metadata("exon_ends"));
                        jData.rows.exon_starts.gene.push(item.metadata("exon_starts"));
                    });
            }

            if (self.data) {
                jData = {
                    rows: {
                        start: [],
                        end: [],
                        chr: [],
                        id: null,
                        strand: [],
                        metadata: {
                            exon_ends: [],
                            gene: [],
                            exon_starts: []
                        }
                    },
                    cols: {}
                }

                var counter = 0;
                self.data.foreach(function (measurement, series, seriesIndex) {
                    if (counter == 0) {
                        var rowData = series._container.rowData(measurement);
                        jData.rows.start = rowData._start;
                        jData.rows.end = rowData._end;
                        jData.rows.metadata = rowData._metadata;
                        jData.rows.id = rowData._id;
                        jData.rows.chr = rowData._seqName;
                        counter++;
                    }

                    var featureValues = series._container.values(measurement);
                    jData.cols[measurement.id()] = featureValues._values;
                });
            }

            return jData;
        }

        /**
        * JSONChartData change event handler.
        * Listens to when chart json data is updated and redraws the chart.
        */
        _jsonDataChanged() {
            var genomic_data;
            if (Array.isArray(this.jsonData)) {
                genomic_data = this._parseArrayData(this.jsonData);
            }
            else {
                genomic_data = this._parseData(this.jsonData);
            }
            this.data = genomic_data;
        }

        _parseArrayData(json) {
            var self = this;

            var m = [];
            var mSet = new epiviz.measurements.MeasurementSet();
            var datasource = "epiviz";
            var rowLength = 0;
            var hasfData = true;
            var measurementType = 'feature';
            var useOffset = false;

            if (self.nodeName === "EPIVIZ-JSON-GENES-TRACK") {
                measurementType = 'range';
            }

            // if data format is a Array of JSON Objects (long format)
            if (Array.isArray(json)) {
                if (self.key && self.key.length > 0) {
                    json.forEach(function (d) {
                        var keyFields = [];
                        self.key.forEach(function (k) {
                            keyFields.push(d[k]);
                        });
                        d.key = keyFields.join("-");
                    });
                }

                var rowKeys = Object.keys(json[0]);
                var colAnnotation = null;
                var colsCollection = {}, cols = {};
                var rowLength = json.length;

                rowKeys.forEach(function (key) {
                    colsCollection[key] = json.map(function (r) { return r[key]; });
                });

                var rowMetadata = rowKeys.slice(0);
                var rows = Object.assign({}, colsCollection);

                self.dimS.forEach(function (dim) {
                    var index = rowMetadata.indexOf(dim);
                    rowMetadata.splice(index, 1);
                    delete rows[dim];
                    cols[dim] = colsCollection[dim];
                });

                self.dimS.forEach(function (dim) {
                    var colValues = cols[dim];
                    m.push({
                        'id': dim,
                        'name': dim,
                        'type': measurementType,
                        'datasourceId': datasource,
                        'datasourceGroup': dim,
                        'dataprovider': datasource,
                        'formula': null,
                        'defaultChartType': self.chartName,
                        'annotation': colAnnotation,
                        'minValue': Math.min.apply(Math, colValues),
                        'maxValue': Math.max.apply(Math, colValues),
                        'metadata': rowMetadata
                    });

                    mSet.add(new epiviz.measurements.Measurement(
                        dim, dim, measurementType, datasource, dim, datasource, null, self.chartName, colAnnotation, null, null, rowMetadata
                    ));
                });

                self.measurements = m;

                /**
                *  Must have fields
                *  jsondata.cols
                *  jsondata.rows
                *  jsondata.rows.metadata (label)
                */
                var jsonData = {};
                jsonData.cols = cols;
                jsonData.globalStartIndex = 1;
                var rowObj = self._generateRowIndexes(rowLength);
                rowObj.metadata = rows;
                jsonData.rows = rowObj;
            }
            else {
                //if data format is more like a dataframe/data table representation
                var rowMetadata = Object.keys(json.rows);
                var rowLength = 0;
                useOffset = json.rows.useOffset;

                if (json.cols == null) { hasfData = false; json.cols = {}; }

                if (json.cols && Object.keys(json.cols) > 0) {
                    if (Object.keys(json.cols[Object.keys(json.cols)[0]]).indexOf("values") != -1) {
                        rowLength = json.cols[Object.keys(json.cols)[0]].values.length;
                    }
                    else {
                        rowLength = json.cols[Object.keys(json.cols)[0]].length;
                    }
                }
                else if (json.rows) {
                    if (Object.keys(json.rows).indexOf("values") != -1) {
                        rowLength = json.rows.values[Object.keys(json.rows.values)[0]].length;
                    }
                    else {
                        rowLength = json.rows[Object.keys(json.rows)[0]].length;
                    }
                };

                if (self.key && self.key.length > 0) {
                    var keyArray = [];
                    for (var ikey = 0; ikey < rowLength; ikey++) {
                        var keyFields = [];
                        self.key.forEach(function (k) {
                            keyFields.push(json.rows[k][ikey]);
                        });
                        keyArray.push(keyFields.join("-"));
                    }
                    json.rows.key = keyArray;
                }

                if (self.measurements) {
                    self.measurements.forEach(function (mea) {
                        mSet.add(new epiviz.measurements.Measurement(
                            mea.id, mea.name, mea.type, mea.datasourceId, mea.datasourceGroup, mea.dataprovider,
                            mea.formula, mea.defaultChartType, mea.annotation, mea.minValue, mea.maxValue, mea.metadata
                        ));
                    });
                    m = self.measurements;
                }
                else if (self.dimS) {
                    self.dimS.forEach(function (dim) {

                        var colValues = [0, 5];
                        if (json.cols) {
                            colValues = json.cols[dim] || json.cols[dim].values;
                        }
                        // var colValues = json.cols[dim];
                        var rowLength = colValues.length;

                        m.push({
                            'id': dim,
                            'name': dim,
                            'type': measurementType,
                            'datasourceId': datasource,
                            'datasourceGroup': dim,
                            'dataprovider': datasource,
                            'formula': null,
                            'defaultChartType': self.chartName,
                            'annotation': undefined,
                            'minValue': Math.min.apply(Math, colValues),
                            'maxValue': Math.max.apply(Math, colValues),
                            'metadata': rowMetadata
                        });

                        if (!hasfData) {
                            json.cols[dim] = { "values": [] }
                        }

                        mSet.add(new epiviz.measurements.Measurement(
                            dim, dim, measurementType, datasource, dim, datasource, null, self.chartName, undefined, null, null, rowMetadata
                        ));
                    });
                }

                self._chartMeasurements = m;
                var jsonData = {};
                jsonData.cols = {};
                if (json.cols) {
                    var colKeys = Object.keys(json.cols);

                    colKeys.forEach(function (ck) {
                        if (Array.isArray(json.cols[ck])) {
                            jsonData.cols[ck] = json.cols[ck];
                        }
                        else {
                            jsonData.cols[ck] = json.cols[ck]["values"];
                        }
                    });
                }

                var rowObj = {};
                var rowKeys = Object.keys(json.rows);

                if (rowKeys.indexOf("values") != -1) {
                    rowObj = json.rows.values;
                }
                else if ((rowKeys.indexOf("start") == -1) || (rowKeys.indexOf("index") == -1) || (rowKeys.rows.indexOf("end") == -1)) {
                    rowObj = self._generateRowIndexes(rowLength);
                    rowObj.metadata = json.rows;
                }
                else {
                    rowObj = json.rows;
                }

                jsonData.globalStartIndex = rowObj.start[0];
                jsonData.rows = rowObj;
            }

            var chartData = new epiviz.measurements.MeasurementHashtable();
            var sumExp = new epiviz.datatypes.PartialSummarizedExperiment();
            var globalStartIndex = jsonData.globalStartIndex;

            var chr = datasource;

            if (jsonData.rows.chr) {
                chr = jsonData.rows.chr[0];
            }
            var range = new epiviz.datatypes.GenomicRange(chr, globalStartIndex, jsonData.rows.end[rowLength - 1] - globalStartIndex);
            self.range = range;

            var rowDataObj = new epiviz.datatypes.GenomicRangeArray(chr, range, globalStartIndex, jsonData.rows, useOffset);
            sumExp.addRowData(rowDataObj);

            if (hasfData) {
                mSet.foreach(function (m) {
                    var valueData = new epiviz.datatypes.FeatureValueArray(m, range, globalStartIndex, jsonData.cols[m.id()]);
                    sumExp.addValues(valueData);
                });
            }

            mSet.foreach(function (m) {
                var msData = new epiviz.datatypes.MeasurementGenomicDataWrapper(m, sumExp);
                chartData.put(m, msData);
            });

            var genomicData = new epiviz.datatypes.MapGenomicData(chartData);
            return genomicData;
        }

        /**
        * Helper function to create row-indexes for data items.
        */
        _generateRowIndexes(length) {
            var rowObj = {};
            rowObj.start = [];
            rowObj.index = [];
            rowObj.id = null;
            rowObj.strand = null;
            rowObj.chr = [];
            rowObj.end = [];
            for (var i = 0; i < length; i++) {
                rowObj.start.push(i + 1);
                rowObj.index.push(i + 1);
                // rowObj.id.push(i+1);
                rowObj.end.push(i + 2);
                rowObj.chr.push("epiviz");
            }
            return rowObj;
        }

        /**
         *  json format {cols: {"aff1": [], "affy2": []}, rows: {id: [], chr: [], start: [], end: [], strand: null, metadata: {probe: []}}} 
         * 
         * 
         */
        _parseData(json) {
            var self = this;
            var chr = json.rows.chr[0];
            var start = json.rows.start[0];
            var end = 0
            var measurements = [];
            json.rows.end.forEach(function (k) { end = end + k; });
            var mSet = new epiviz.measurements.MeasurementSet();

            if (self.nodeName == "EPIVIZ-GENES-TRACK") {
                var key = "genes";

                measurements.push({
                    "id": key,
                    "name": key,
                    "type": "range",
                    "datasourceId": key,
                    "datasourceGroup": key,
                    "dataprovider": "static",
                    "formula": null,
                    "defaultChartType": "Genes Track",
                    "annotation": null,
                    "minValue": null,
                    "maxValue": null,
                    "metadata": ["probe"]
                });

                var mea = new epiviz.measurements.Measurement(
                    key, key, "range", key,
                    key, "static", null, "Genes Track",
                    null, null, null, []
                )

                mSet.add(mea);

                self.measurements = measurements;

                var chartData = new epiviz.measurements.MeasurementHashtable();
                var range = new epiviz.datatypes.GenomicRange(chr, start, end - start);
                var sumExp = new epiviz.datatypes.PartialSummarizedExperiment();
                var datasource = "static";

                var rowDataObj = new epiviz.datatypes.GenomicRangeArray(datasource, range, start, json.rows, true);

                sumExp.addRowData(rowDataObj);
                mSet.foreach(function (m) {
                    var msData = new epiviz.datatypes.MeasurementGenomicDataWrapper(m, sumExp);
                    chartData.put(m, msData);
                });

                var genomicData = new epiviz.datatypes.MapGenomicData(chartData);

                self.range = range;
                return genomicData;
            }


            if (self.dimS) {
                self.dimS.forEach(function (key) {

                    measurements.push({
                        "id": key,
                        "name": key,
                        "type": "feature",
                        "datasourceId": key,
                        "datasourceGroup": key,
                        "dataprovider": "static",
                        "formula": null,
                        "defaultChartType": null,
                        "annotation": null,
                        "minValue": -3,
                        "maxValue": 10,
                        "metadata": ["probe"]
                    });

                    mSet.add(new epiviz.measurements.Measurement(
                        key, key, "feature", key,
                        key, "static", null, null,
                        null, -1, 10, ["probe"]
                    ));
                });

                var range_mea = new epiviz.measurements.Measurement(
                    key, key, "range", key,
                    key, "static", null, null,
                    null, -1, 10, []
                )
            }

            self.measurements = measurements;

            var chartData = new epiviz.measurements.MeasurementHashtable();
            var range = new epiviz.datatypes.GenomicRange(chr, start, end - start);
            var sumExp = new epiviz.datatypes.PartialSummarizedExperiment();
            // var datasource = "static";

            var rowDataObj = new epiviz.datatypes.GenomicRangeArray(range_mea, range, start, json.rows, true);

            sumExp.addRowData(rowDataObj);

            mSet.foreach(function (m) {
                var valueData = new epiviz.datatypes.FeatureValueArray(m, range, start, json.cols[m.id()]);
                sumExp.addValues(valueData);
            });


            mSet.foreach(function (m) {
                var msData = new epiviz.datatypes.MeasurementGenomicDataWrapper(m, sumExp);
                chartData.put(m, msData);
            });

            var genomicData = new epiviz.datatypes.MapGenomicData(chartData);
            self.range = range;
            return genomicData;
        }

        /**
        * Hover event handler.
        *
        * @param {object} data data object currently hovered.
        */
        hover(data) {
            if (!this.hostDragging && this.hostDragging !== undefined && this.chart) {
                this.chart.doHover(data);
            }
        }

        /**
        * unHover event handler.
        */
        unHover() {
            if (!this.hostDragging && this.hostDragging !== undefined && this.chart) {
                this.chart.doUnhover();
            }
        }

        /**
         * select event handler.
         *
         * @param {object} data data object currently hovered.
         */
        select(data) {
            this.chart.doSelect(data);
        }

        /**
        * deSelect event handler.
        */
        deSelect() {
            this.chart.doDeselect();
        }

        /**
         * Intializes chart container element for settings and colors elements.
         */
        _initializeSettingsContainer() {
            var chartContainer = this.shadowRoot.querySelector('#' + this.plotId);
            var settingsContainer = this.shadowRoot.querySelector('#' + this.plotId + '-chartSettingsContainer');

            if (settingsContainer == null) {
                var iconElem = document.createElement('div');
                iconElem.hidden = true;
                iconElem.id = "chartSettingsContainer";
                // iconElem.addEventListener("click", this._showColorsDialog.bind(this));
                // Polymer.dom(chartContainer).appendChild(iconElem);
                chartContainer.appendChild(iconElem);
            }
        }

        /**
        * Handles when mouse-overed on a chart to show settings and colors.
        */
        hostHovered() {
            var currColorsIcon = this.shadowRoot.querySelector('#chartSettingsContainer');
            if (currColorsIcon) {
                currColorsIcon.hidden = false;
            }
        }

        /**
         * Handles when mouse-overed on a chart to hide settings and colors.
         */
        hostUnhovered() {
            var currColorsIcon = this.shadowRoot.querySelector('#chartSettingsContainer');
            if (currColorsIcon) {
                currColorsIcon.setAttribute("hidden", true);
            }
        }
    };
}
