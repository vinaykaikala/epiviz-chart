/* External Polymer Styles/elements dependency */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';

/**
 * `ChartJSONBehavior` is an interface to all epiviz-json-charts. 
 * This behavior provides functionality to convert json-data into a `epiviz.datatypes.MapGenomicData` format.
 *
 * @polymerBehavior
**/
EpivizJSONChartBehavior = function (superClass) {
    return class extends superClass {
        constructor() {
            super();
            this.addEventListener('keypress', e => this.handlePress(e));
        }

        static get properties() {
            return {
                /**
                * json data object.
                *
                * @type {Object} data
                * @property {Array<Object>} data.cols For each column, array of values.
                * @property {Array<Object>} data.rows For each row metadata, array of values. 
                * @property {Array<Object>} data.colAnnotation For each column, annotations if available
                */
                data: {
                    type: Object,
                    notify: true
                    // observer: '_dataChanged'
                },

                /**
                 * Dimensions for a chart from data object. (x and y axis measurements).
                 *
                 * @type {Array<string>}
                 */
                dimS: {
                    type: Array,
                    notify: true
                    // observer: '_dimsChanged'
                },

                /**
                * Measurements for a chart from data Object.
                *
                * @type {Array<string>}
                */
                measurements: {
                    type: Array,
                    notify: true
                },

                /**
                 * json data key to use for hovering.
                 *
                 * @type {string} 
                 */
                key: {
                    type: Array,
                    notify: true
                },

                /**
                * Chart json data object.
                *
                * @type {Object}
                */
                _chartData: {
                    type: Object,
                    notify: true
                },

                /**
                * Chromosome location.
                * Default Location Attribute to set to all the children chart elements.
                *
                * @example: chr1
                *
                * @type {string}
                */
                chr: {
                    type: String,
                    notify: true
                },

                /**
                * Chromosome start. 
                * Default Chromosome start value to use. (defaults to 0).
                *
                * @type {number}
                */
                start: {
                    type: Number,
                    notify: true
                },

                /**
                * Chromosome end. 
                * Default Chromosome end value to use. (defaults to the `<chr>` length).
                *
                * @type {number}
                */
                end: {
                    type: Number,
                    notify: true
                },

                /**
                * Chart range. 
                *
                * @type {Object<epiviz.datatypes.GenomicRange>}
                */
                range: {
                    type: Object,
                    notify: true,
                    computed: 'getGenomicRange(chr, start, end)',
                },

                /**
                * Chart json measurements object.
                *
                * @type {Object}
                */
                _chartMeasurements: {
                    type: Array,
                    notify: true
                },

                /**
                * Chart setings. 
                *
                * @type {Object}
                */
                settings: {
                    type: Object,
                    notify: true
                },

                /**
                * Chart colors. 
                *
                * @type {Object}
                */
                colors: {
                    type: Array,
                    notify: true
                }
            };
        }

        static get observers() {
            return ['_barChanged(bar.*)'];
        }

        ready() {
            super.ready();
            var self = this;
            self.plotId = this.$.epivizChart.plotId;

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

            if (Object.keys(self.data).indexOf("format") != -1 && self.data.format == "epiviz") {

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
                        if (self.data.cols) {
                            colValues = self.data.cols[dim] || self.data.cols[dim].values;
                        }
                        // var colValues = self.data.cols[dim];
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
                            self.data.cols[dim] = { "values": [] }
                        }

                        mSet.add(new epiviz.measurements.Measurement(
                            dim, dim, measurementType, datasource, dim, datasource, null, self.chartName, undefined, null, null, rowMetadata
                        ));
                    });
                }

                self._chartMeasurements = m;
                var chartData = new epiviz.measurements.MeasurementHashtable();

                mSet.foreach(function (m) {

                    var mData = self.data[m.datasourceId()];
                    var rowLength = mData.rows.values.chr.length;

                    if (!self.chr) {
                        self.chr = mData.rows.values.chr[0];
                    }

                    if (!self.start) {
                        self.start = mData.rows.values.start[0];
                    }

                    if (!self.end) {
                        self.end = mData.rows.values.end[rowLength - 1];
                    }

                    if (!self.range) {
                        self.range = new epiviz.datatypes.GenomicRange(mData.rows.values.chr[0], mData.rows.values.start[0], mData.rows.values.end[rowLength - 1] - mData.rows.values.start[0]);
                    }

                    var sumExp = new epiviz.datatypes.PartialSummarizedExperiment();

                    var rowDataObj = new epiviz.datatypes.GenomicRangeArray(m, self.range, mData.rows.globalStartIndex, mData.rows.values, mData.rows.useOffset);
                    sumExp.addRowData(rowDataObj);

                    if (mData.cols) {
                        var valueData = new epiviz.datatypes.FeatureValueArray(m, self.range, mData.cols[m.id()].globalStartIndex, mData.cols[m.id()].values);
                        sumExp.addValues(valueData);
                    }

                    var msData = new epiviz.datatypes.MeasurementGenomicDataWrapper(m, sumExp);
                    chartData.put(m, msData);

                    self._chartRange = self.range;
                });

                var genomicData = new epiviz.datatypes.MapGenomicData(chartData);
                self._chartData = genomicData;

            }
            else if (Object.keys(self.data).indexOf("format") != -1 && self.data.format == "epivizMultiRegion") {

                if (!self.measurements) {
                    var regions = Object.keys(self.data);
                    var rowLength = 0;
                    regions.splice(regions.indexOf("format"), 1);
                    regions.forEach(function (reg) {
                        var keysRegs = Object.keys(self.data[reg].cols.values);
                        keysRegs.forEach(function (k) {
                            m.push({
                                'id': k,
                                'name': k,
                                'type': measurementType,
                                'datasourceId': reg,
                                'datasourceGroup': reg,
                                'dataprovider': datasource,
                                'formula': null,
                                'defaultChartType': self.chartName,
                                'annotation': { "tissue": "colon", "tumorType": "normal" },
                                'minValue': 0,
                                'maxValue': 1,
                                'metadata': ["chr", "start", "end"]
                            });

                            mSet.add(new epiviz.measurements.Measurement(
                                k, k, measurementType, reg, reg, datasource, null, self.chartName, { "tissue": "colon", "tumorType": "normal" }, null, null, []
                            ));
                        });
                        rowLength = self.data[reg].rows.values.chr.length;
                    });
                }
                else {
                    m = self.measurements;

                    m.forEach(function (tm) {
                        mSet.add(new epiviz.measurements.Measurement(
                            tm.id, tm.name, tm.type, tm.datasourceId,
                            tm.datasourceGroup, tm.dataprovider, tm.formula, tm.defaultChartType,
                            tm.annotation, tm.minValue, tm.maxValue, tm.metadata
                        ));

                        rowLength = self.data[tm.datasourceId].rows.values.chr.length;
                    });
                }

                self._chartMeasurements = m;
                var chartData = new epiviz.measurements.MeasurementHashtable();
                self.chr = "epivizMultiRegion"
                self.start = 1;
                self.end = rowLength;
                var rowObj = self._generateRowIndexes(rowLength);

                mSet.foreach(function (m) {

                    var mData = self.data[m.datasourceId()];
                    rowObj.metadata = mData.rows.values;
                    delete rowObj.metadata["metadata"];
                    delete rowObj.metadata["id"];
                    delete rowObj.metadata["strand"];
                    delete rowObj.metadata["id"];

                    var sumExp = new epiviz.datatypes.PartialSummarizedExperiment();

                    var rowDataObj = new epiviz.datatypes.GenomicRangeArray(m, self.range, 1, rowObj, false);
                    sumExp.addRowData(rowDataObj);

                    if (mData.cols) {
                        var valueData = new epiviz.datatypes.FeatureValueArray(m, self.range, 1, mData.cols.values[m.id()]);
                        sumExp.addValues(valueData);
                    }

                    var msData = new epiviz.datatypes.MeasurementGenomicDataWrapper(m, sumExp);
                    chartData.put(m, msData);
                });

                var groupByMarker = new epiviz.ui.charts.markers.VisualizationMarker(
                    epiviz.ui.charts.markers.VisualizationMarker.Type.GROUP_BY_MEASUREMENTS,
                    null, null, 'function(a) { return null;}',
                    'function(a, b, c) {return a.annotation().tumorType;}');

                self._chartRange = self.range;
                var genomicData = new epiviz.datatypes.MapGenomicData(chartData);
                // self._chartData = genomicData;

                var groupByMarker = new epiviz.ui.charts.markers.VisualizationMarker(
                    epiviz.ui.charts.markers.VisualizationMarker.Type.GROUP_BY_MEASUREMENTS,
                    null, null, 'function(a) { return null;}',
                    'function(a, b, c) {return a.annotation().tumorType;}');

                var aggregator = epiviz.ui.charts.markers.MeasurementAggregators["mean-stdev"];

                self.$.epivizChart.chartSettings["showPoints"] = true;

                // self.$.epivizChart.chart._lastData = genomicData;
                // self.$.epivizChart.chart._markers[groupByMarker.id()] = groupByMarker;

                self.aggGenomicData = new epiviz.datatypes.MeasurementAggregatedGenomicData(genomicData, groupByMarker, aggregator);

                self.aggGenomicData.ready(function () {
                    // console.log(self);
                    self._chartData = self.aggGenomicData;
                })
                // self.$.epivizChart.chart.transformData(self.range, genomicData).done(function() {
                //     self._chartData = self.$.epivizChart.chart._lastData;
                // });

                self.$.epivizChart.addEventListener('hover', function (e) {
                    if (self.data.format == "epivizMultiRegion") {
                        e.stopPropagation();
                        var index = Math.round(e.detail.data.start);
                        dregions = [];
                        for (reg in self.data) {
                            if (reg != "format") {
                                var region = self.data[reg];
                                dregions.push(new epiviz.ui.charts.ChartObject(
                                    self.plotId,
                                    region.rows.values.start[index],
                                    region.rows.values.end[index],
                                    undefined, undefined, undefined, undefined, undefined,
                                    region.rows.values.chr[index]));
                            }
                        }

                        self.fire('hover', {
                            id: self.plotId,
                            data: dregions
                        });
                    }
                }.bind(self));


                // self.$.epivizChart.addEventListener('select', function(e) {
                //     if(self.data.format == "epivizMultiRegion") {
                //         e.stopPropagation();
                //         var index = Math.round(e.detail.data.start);
                //         dregions = [];
                //         for (reg in self.data) {
                //             if(reg != "format") {
                //                 var region = self.data[reg];
                //                 dregions.push(new epiviz.ui.charts.ChartObject(
                //                     self.plotId, 
                //                     region.rows.values.start[index], 
                //                     region.rows.values.end[index],
                //                     undefined, undefined, undefined, undefined, undefined, 
                //                     region.rows.values.chr[index],));
                //             }
                //         }

                //         self.fire('select', {
                //             id: self.plotId,
                //             data: dregions
                //         });
                //     }
                // }.bind(self));


                // self.$.epivizChart.chart.putMarker(groupByMarker);

                // self.$.epivizChart.chart.transformData(self.range, genomicData).done(function() {
                //     self._chartData = self.$.epivizChart.chart._lastData;
                // });
            }
            else {
                // if data format is a Array of JSON Objects (long format)
                if (Array.isArray(self.data)) {
                    if (self.key && self.key.length > 0) {
                        self.data.forEach(function (d) {
                            var keyFields = [];
                            self.key.forEach(function (k) {
                                keyFields.push(d[k]);
                            });
                            d.key = keyFields.join("-");
                        });
                    }

                    var rowKeys = Object.keys(self.data[0]);
                    var colAnnotation = null;
                    var colsCollection = {}, cols = {};
                    var rowLength = self.data.length;

                    rowKeys.forEach(function (key) {
                        colsCollection[key] = self.data.map(function (r) { return r[key]; });
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

                    self._chartMeasurements = m;

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
                    var rowMetadata = Object.keys(self.data.rows);
                    var rowLength = 0;
                    useOffset = self.data.rows.useOffset;

                    if (self.data.cols == null) { hasfData = false; self.data.cols = {}; }

                    if (self.data.cols && Object.keys(self.data.cols) > 0) {
                        if (Object.keys(self.data.cols[Object.keys(self.data.cols)[0]]).indexOf("values") != -1) {
                            rowLength = self.data.cols[Object.keys(self.data.cols)[0]].values.length;
                        }
                        else {
                            rowLength = self.data.cols[Object.keys(self.data.cols)[0]].length;
                        }
                    }
                    else if (self.data.rows) {
                        if (Object.keys(self.data.rows).indexOf("values") != -1) {
                            rowLength = self.data.rows.values[Object.keys(self.data.rows.values)[0]].length;
                        }
                        else {
                            rowLength = self.data.rows[Object.keys(self.data.rows)[0]].length;
                        }
                    };

                    if (self.key && self.key.length > 0) {
                        var keyArray = [];
                        for (var ikey = 0; ikey < rowLength; ikey++) {
                            var keyFields = [];
                            self.key.forEach(function (k) {
                                keyFields.push(self.data.rows[k][ikey]);
                            });
                            keyArray.push(keyFields.join("-"));
                        }
                        self.data.rows.key = keyArray;
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
                            if (self.data.cols) {
                                colValues = self.data.cols[dim] || self.data.cols[dim].values;
                            }
                            // var colValues = self.data.cols[dim];
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
                                self.data.cols[dim] = { "values": [] }
                            }

                            mSet.add(new epiviz.measurements.Measurement(
                                dim, dim, measurementType, datasource, dim, datasource, null, self.chartName, undefined, null, null, rowMetadata
                            ));
                        });
                    }

                    self._chartMeasurements = m;
                    var jsonData = {};
                    jsonData.cols = {};
                    if (self.data.cols) {
                        var colKeys = Object.keys(self.data.cols);

                        colKeys.forEach(function (ck) {
                            if (Array.isArray(self.data.cols[ck])) {
                                jsonData.cols[ck] = self.data.cols[ck];
                            }
                            else {
                                jsonData.cols[ck] = self.data.cols[ck]["values"];
                            }
                        });
                    }

                    var rowObj = {};
                    var rowKeys = Object.keys(self.data.rows);

                    if (rowKeys.indexOf("values") != -1) {
                        rowObj = self.data.rows.values;
                    }
                    else if ((rowKeys.indexOf("start") == -1) || (rowKeys.indexOf("index") == -1) || (rowKeys.rows.indexOf("end") == -1)) {
                        rowObj = self._generateRowIndexes(rowLength);
                        rowObj.metadata = self.data.rows;
                    }
                    else {
                        rowObj = self.data.rows;
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
                self._chartRange = range;

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
                self._chartData = genomicData;
            }
        }

        getGenomicRange(chr, start, end) {
            if (chr && start && end) {
                return new epiviz.datatypes.GenomicRange(chr, start, end - start);
            }
            else {
                return null;
            }
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
    }
}
