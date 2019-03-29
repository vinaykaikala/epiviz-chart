import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
/**
 * `ChartDataBehavior` object manages data requests. 
 * `<epiviz-environment>` & `<epiviz-navigation>` inherit this behavior to get/update chart data.
 *
 * @polymerBehavior
**/
EpivizChartDataBehavior = function (superClass) {
    return class extends superClass {
        constructor() {
            super();
            var self = this;

            var settingsMap = {
                configType: 'default',
                dataProviders: [],
                colorPalettes: []
            }

            var dataManagerElem = document.querySelectorAll('epiviz-data-source');
            if (dataManagerElem.length > 0) {
                this.dataManager = new epiviz.data.DataManager(dataManagerElem[0].config, dataManagerElem[0].dataProviderFactory);

                // Object.keys(dataManagerElem).forEach(function (ds) {
                //     settingsMap.dataProviders.push([ds.providerType, ds.providerId, ds.providerUrl]);
                // });

                // var config = new epiviz.Config(settingsMap);

                // /** @type {epiviz.data.DataProviderFactory} */
                // var dataProviderFactory = new epiviz.data.DataProviderFactory(config);

                // this.dataManager = new epiviz.data.DataManager(config, dataProviderFactory);
                // this.measurementSet = dataManagerElem.measurementSet;
                this.dataManager.getMeasurements(function (result) {
                    // self.measurements = result.raw();
                    self.measurementSet = result;
                }, function (jqXHR, textStatus, errorThrown) {
                    var toast = document.createElement("paper-toast");
                    toast.setAttribute("text", textStatus + " - " + errorThrown);
                    // toast.setAttribute("openned", true);
                    this.shadowRoot.appendChild(toast);
                    toast.show();
                });
            }
        }

        static get properties() {
            return {
                /**
                * Whether to apply a data transformation function
                *
                * @type {boolean}
                */
                transformData: {
                    type: Boolean,
                    notify: true,
                    value: false
                },

                /**
                * Data Transformation function
                *
                * @type {string}
                */
                transformDataFunc: {
                    type: String,
                    notify: true
                }
            };
        }

        static get observers() {
            return ['_barChanged(bar.*)'];
        }

        /**
         *  Formats an epiviz data object into json.
         *  output data format
         *  {
         *      columns: Collection <Object> {measurement-id: <Epiviz measurement>}
         *      values : Array  [measurement-id: Val <Integer>, row: rowInfo]
         *  }
         *
         * @param {Object} data data object `epiviz.datatypes.*`
         *
         * @return {Object} transformed data object
         */
        epivizToJSON(data) {
            if (!this.transformData) {
                return data;
            }

            var fromDataMeasurements = [];
            var range = this.range;

            var firstGlobalIndex = data.firstSeries().globalStartIndex();
            var lastGlobalIndex = data.firstSeries().globalEndIndex();

            data.foreach(function (measurement, series) {
                fromDataMeasurements.push(measurement);
                var firstIndex = series.globalStartIndex();
                var lastIndex = series.globalEndIndex();
                if (firstIndex > firstGlobalIndex) { firstGlobalIndex = firstIndex; }
                if (lastIndex < lastGlobalIndex) { lastGlobalIndex = lastIndex; }
            });

            var nItems = lastGlobalIndex - firstGlobalIndex;

            var i, index;
            var grid = {};
            grid.measurements = fromDataMeasurements;
            grid.columns = {};

            grid.measurements.forEach(function (m) {
                grid.columns[m.datasourceId() + "-" + m.id()] = m;
            });

            grid.values = [];
            var nSeries = fromDataMeasurements.length;
            for (i = 0; i < nItems; ++i) {
                index = i + firstGlobalIndex;
                var valArray = {};

                var row = {};
                var rowData = data.getSeries(fromDataMeasurements[0]).getRowByGlobalIndex(index);
                row.start = rowData.start();
                row.end = rowData.end();
                row.metadata = rowData.rowMetadata();
                row.strand = rowData.strand();
                row.index = rowData.index();
                row.globalIndex = rowData.globalIndex();
                row.id = rowData.id();
                row.seqName = rowData.seqName();
                valArray.row = row;

                grid.measurements.forEach(function (m) {
                    var cellX = data.getSeries(m).getByGlobalIndex(index);
                    valArray[m.datasourceId() + "-" + m.id()] = cellX.value;
                });

                grid.values.push(valArray);
            }
            return grid;
        }

        /**
         * Handles search requests for gene names /probeid
         * 
         * @param {string} gene keyword to search for genes
         * @param {HTMLElement} currentChild child HTML element where request was created
         * @param {HTMLElement} pDom parent HTML element of the child 
         * @callback cb
         * @param {cb} cb Callback that handles the response
         */
        _getElementSearch(gene, currentChild, pDom, cb) {

            if (this.dataManager) {
                this.dataManager.search(function (data) {
                    if (pDom) {
                        // pDom.$$("#geneSearch").suggestions(data);
                        data.forEach(function (item) {
                            item.value = item.gene + " - " + item.chr + " : " + item.start + " - " + item.end;
                        });
                        pDom.shadowRoot.querySelector("#geneSearch").items = data;
                    }
                    else {
                        cb(data);
                    }
                }, gene);
            }
        }

        /**
         * Handles gene in range requests.
         * Given a genomic region, get the gene close to the center.
         * 
         * @param {HTMLElement} currentChild child HTML element where request was created
         * @param {HTMLElement} pDom parent HTML element of the child 
         */
        _getGenesInRange(currentChild, pDom) {
            var self = this;

            var mSet = new epiviz.measurements.MeasurementSet();
            var m = new epiviz.measurements.Measurement(
                "genes",
                "Genes",
                "range",
                "genes",
                "genes",
                "umd",
                null,
                "Genes Track",
                null,
                null,
                null,
                ["gene", "exon_starts", "exon_ends"]
            )
            mSet.add(m);

            var chartMeasMap = {};
            chartMeasMap[currentChild.plotId] = mSet;

            if (this.dataManager) {
                this.dataManager.getData(currentChild.range, chartMeasMap, function (id, data) {
                    // Get gene (based on size)
                    // var index = data.globalStartIndex(m) + Math.round((data.size(m) - 1) / 2);

                    var nItems = data.firstSeries().globalEndIndex() - data.firstSeries().globalStartIndex();

                    if (nItems == 0) {
                        var toast = document.createElement("paper-toast");
                        toast.setAttribute("text", currentChild.nodeName.toLowerCase() + ": query return empty - choose a different genomic region");
                        // toast.setAttribute("openned", true);
                        this.shadowRoot.appendChild(toast);
                        toast.show();
                    }

                    // Get gene (based on position)
                    var searchIndex = data.binarySearchStarts(m, new epiviz.datatypes.GenomicRange(pDom.range.seqName(), (pDom.range.start() + pDom.range.end()) / 2, 1000000));
                    var index = data.globalStartIndex(m) + searchIndex.index;

                    if (data.getRowByGlobalIndex(m, index)) {
                        var gene = data.getRowByGlobalIndex(m, index).rowMetadata().gene;
                        pDom.geneInRange = gene;
                    }
                },
                    function (jqXHR, textStatus, errorThrown) {
                        var toast = document.createElement("paper-toast");
                        toast.setAttribute("text", textStatus + " - " + errorThrown);
                        // toast.setAttribute("openned", true);
                        this.shadowRoot.appendChild(toast);
                        toast.show();
                    });
            }
        }

        /**
        * Handles SeqInfo requests
        * 
        * @param {HTMLElement} currentChild child HTML element where request was created
        * @param {HTMLElement} pDom parent HTML element of the child 
        */
        _getElementSeqInfo(currentChild, pDom) {
            var self = this;

            if (this.dataManager) {
                this.dataManager.getSeqInfos(function (data) {
                    var seqinfo = {};
                    data.forEach(function (s) {
                        seqinfo[s.seqName] = s;
                    });
                    currentChild.seqInfo = seqinfo;

                    if (!(currentChild.start && currentChild.end)) {
                        if (currentChild.chr && currentChild.seqInfo) {
                            currentChild.start = 0;
                            currentChild.end = currentChild.seqInfo[currentChild.chr].max;
                        }
                    }
                },
                    function (jqXHR, textStatus, errorThrown) {
                        var toast = document.createElement("paper-toast");
                        toast.setAttribute("text", textStatus + " - " + errorThrown);
                        // toast.setAttribute("openned", true);
                        this.shadowRoot.appendChild(toast);
                        toast.show();
                    });
            }
        }

        /**
        * Handles data requests
        * 
        * @param {HTMLElement} currentChild child HTML element where request was created
        * @param {HTMLElement} pDom parent HTML element of the child 
        * @param {Array<string>} measurements measurements to request data 
        */
        _getElementData(currentChild, pDom, measurements) {
            var self = this;

            if (self.dataManager != null) {
                var dims = currentChild.dimS || currentChild.getAttribute("dim-s");

                if (typeof (dims) == "string") {
                    dims = JSON.parse(dims);
                }

                // var id = self._generateChartId();
                var mSet = new epiviz.measurements.MeasurementSet();
                var tMeasurements = [];

                if (dims != null && dims.length > 0) {
                    for (var idim = 0; idim < dims.length; idim++) {
                        var mtdx = measurements[dims[idim]];
                        mSet.add(new epiviz.measurements.Measurement(
                            mtdx.id,
                            mtdx.name,
                            mtdx.type,
                            mtdx.datasourceId,
                            mtdx.datasourceGroup,
                            mtdx.dataprovider,
                            mtdx.formula,
                            mtdx.defaultChartType,
                            mtdx.annotation,
                            mtdx.minValue,
                            mtdx.maxValue,
                            mtdx.metadata
                        ));

                        tMeasurements.push(mtdx);
                    }
                }
                else if (currentChild.measurements != null && currentChild.measurements.length > 0) {
                    for (var idim = 0; idim < currentChild.measurements.length; idim++) {
                        var mtdx = currentChild.measurements[idim];
                        mSet.add(new epiviz.measurements.Measurement(
                            mtdx.id,
                            mtdx.name,
                            mtdx.type,
                            mtdx.datasourceId,
                            mtdx.datasourceGroup,
                            mtdx.dataprovider,
                            mtdx.formula,
                            mtdx.defaultChartType,
                            mtdx.annotation,
                            mtdx.minValue,
                            mtdx.maxValue,
                            mtdx.metadata
                        ));

                        tMeasurements.push(mtdx);
                    }
                }

                var id = currentChild.plotId;
                if (tMeasurements.length != 0) {
                    currentChild.range = currentChild.range || self.range || pDom.range;
                    if (!currentChild.measurements) {
                        currentChild.measurements = tMeasurements;
                    }
                    var chartMeasMap = {};
                    chartMeasMap[id] = mSet;

                    self.dataManager.getData(currentChild.range, chartMeasMap, function (id, data) {

                        var nItems = data.firstSeries().globalEndIndex() - data.firstSeries().globalStartIndex();

                        if (nItems == 0) {
                            var toast = document.createElement("paper-toast");
                            toast.setAttribute("text", currentChild.nodeName.toLowerCase() + ": query return empty - choose a different genomic region");
                            // toast.setAttribute("openned", true);
                            // this.shadowRoot.appendChild(toast);
                            // toast.show();
                        }

                        var dataChartElem = pDom.querySelector('[plot-id$="' + id + '"]') || dom(pDom).querySelector('[plot-id$="' + id + '"]');
                        if (dataChartElem) {
                            dataChartElem.data = pDom.transformFunc(data);
                        }
                        dataChartElem._onResize();
                    }, function (jqXHR, textStatus, errorThrown) {
                        var toast = document.createElement("paper-toast");
                        toast.setAttribute("text", textStatus + " - " + errorThrown);
                        this.shadowRoot.appendChild(toast);
                        toast.show();
                    });
                }
            }
        }

        /**
         * Handles data requests when dimensions are changed/updated.
         * 
         * @param {string} cId plot-id of the chart to update.
         */
        _updateChart(cId) {

            if (cId == undefined) { return; }
            var self = this;
            var currentChild = dom(self).querySelector('[plot-id$="' + cId + '"]');
            var dims = currentChild.dimS || currentChild.getAttribute("dim-s");
            $('#' + cId).empty();

            if (typeof (dims) == "string") {
                dims = JSON.parse(dims);
            }

            var mSet = new epiviz.measurements.MeasurementSet();
            var tMeasurements = [];

            if (dims != null && dims.length > 0) {
                for (var idim = 0; idim < dims.length; idim++) {
                    var mtdx = self.measurements[dims[idim]];
                    mSet.add(new epiviz.measurements.Measurement(
                        mtdx.id,
                        mtdx.name,
                        mtdx.type,
                        mtdx.datasourceId,
                        mtdx.datasourceGroup,
                        mtdx.dataprovider,
                        mtdx.formula,
                        mtdx.defaultChartType,
                        mtdx.annotation,
                        mtdx.minValue,
                        mtdx.maxValue,
                        mtdx.metadata
                    ));
                    tMeasurements.push(mtdx);
                }
            }
            else if (currentChild.measurements != null && currentChild.measurements.length > 0) {
                for (var idim = 0; idim < currentChild.measurements.length; idim++) {
                    var mtdx = currentChild.measurements[idim];
                    mSet.add(new epiviz.measurements.Measurement(
                        mtdx.id,
                        mtdx.name,
                        mtdx.type,
                        mtdx.datasourceId,
                        mtdx.datasourceGroup,
                        mtdx.dataprovider,
                        mtdx.formula,
                        mtdx.defaultChartType,
                        mtdx.annotation,
                        mtdx.minValue,
                        mtdx.maxValue,
                        mtdx.metadata
                    ));

                    tMeasurements.push(mtdx);
                }
            }

            if (tMeasurements.length != 0) {
                currentChild.range = currentChild.range || self.range;
                currentChild.measurements = tMeasurements;
                var chartMeasMap = {};
                chartMeasMap[cId] = mSet;

                if (self.dataManager) {

                    self.dataManager.getData(currentChild.range, chartMeasMap, function (id, data) {
                        var nItems = data.firstSeries().globalEndIndex() - data.firstSeries().globalStartIndex();

                        if (nItems == 0) {
                            var toast = document.createElement("paper-toast");
                            toast.setAttribute("text", currentChild.nodeName.toLowerCase() + ": Query return empty - choose a different genomic region");
                            this.shadowRoot.appendChild(toast);
                            toast.show();
                        }

                        var dataChartElem = dom(self).querySelector('[plot-id$="' + id + '"]');
                        if (dataChartElem) {
                            dataChartElem.data = self.transformFunc(data);
                        }
                    }, function (jqXHR, textStatus, errorThrown) {
                        var toast = document.createElement("paper-toast");
                        toast.setAttribute("text", textStatus + " - " + errorThrown);
                        this.shadowRoot.appendChild(toast);
                        toast.show();
                    });
                }
            }
        }
    };
}
