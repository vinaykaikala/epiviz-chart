/* Polymer dependency */
/* Epiviz imports dependency */
/* <link rel="import" href="../epiviz-imports/epiviz-common-js.html"> */
/* Epiviz Polymer Behaviors dependency */
/* Epiviz Shared css */
/**
<h2> Chart Component </h2>
epiviz-chart components are a collection of reusable and extensible visualization components for
genomic data. 

An epiviz-chart component requires two attributes to render a visualization on the page 
<ul>
    <li>data attribute,  </li>
    <li>dimensions (or columns) from the data attribute to visualize.</li>
</ul>

`<epiviz-stacked-blocks-track>` is similar to block track with genomic location on the x-axis 
    and can be used to visualize multiple annotation regions on the same track.

Element attributes are defined in <a href="#epiviz.ChartBehavior">`<epiviz.ChartBehavior>`</a> element.

To create a stacked-blocks plot on a HTML page, add

      <epiviz-stacked-blocks-track></epiviz-stacked-blocks-track>

@demo demo/index-blocks-track.html Example page showing a blocks track
*/
/*<link rel="import" href="../epiviz-imports/epiviz-common-css.html">*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import './chart-behavior.js';
import './chart-settings.js';
import './chart-colors.js';
import './chart-remove.js';
import './chart-grid-behavior.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="epiviz-stacked-blocks-track">
    <!--<link rel="import" href="../epiviz-imports/epiviz-common-css.html">-->
    <template>
        <style include="shared-settings"></style>
        <style include="chart-shared-css"></style>
        <style>
            :host {
                width: 100%;
                height: 100%;
                display: inline-block;
                border: 1px solid black;
                border-radius: 5px;
                position: relative;
                resize: vertical;
                overflow: auto;
                transition: width 0.01s, height 0.01s;
            }
        </style>

        <!-- local DOM goes here -->
        <paper-spinner-lite active="" class="green"></paper-spinner-lite>
        <div id="chart" on-mouseover="hostHovered" on-mouseout="hostUnhovered">
            <slot name="dragHandle"></slot>
            <div id="{{plotId}}"></div>
        </div>

    </template>

    
</dom-module>`;

document.head.appendChild($_documentContainer.content);
// Extend Polymer.Element base class
class EpivizStackedBlocksTrack extends EpivizChartGridBehavior(EpivizChartRemoveBehavior(EpivizChartColorsBehavior(EpivizChartSettingsBehavior(EpivizChartBehavior(PolymerElement))))) {

    static get is() { return 'epiviz-stacked-blocks-track'; }

    static get properties() {
        return {
            /**
            * Default chart properties for blocks track.
            * @type {Object}
            */
            configSrc: {
                type: Object,
                value: function () {

                    epiviz.Config.SETTINGS = {
                        dataProviders: [
                            ["epiviz.data.WebServerDataProvider", "umd", "http://epiviz-dev.cbcb.umd.edu/api/"]
                        ],
                        workspacesDataProvider: sprintf('epiviz.data.EmptyResponseDataProvider', 'empty', ''),
                        useCache: true,

                        chartSettings: {
                            default: {
                                colors: 'd3-category10',
                                decorations: [
                                    'epiviz.ui.charts.decoration.RemoveChartButton',
                                    'epiviz.ui.charts.decoration.SaveChartButton',
                                    'epiviz.ui.charts.decoration.CustomSettingsButton',
                                    'epiviz.ui.charts.decoration.EditCodeButton',

                                    'epiviz.ui.charts.decoration.ChartColorsButton',
                                    'epiviz.ui.charts.decoration.ChartLoaderAnimation',
                                    'epiviz.ui.charts.decoration.ChartResize'
                                ]
                            },

                            plot: {
                                width: 400,
                                height: 400,
                                margins: new epiviz.ui.charts.Margins(15, 30, 30, 15),
                                decorations: [
                                    'epiviz.ui.charts.decoration.ToggleTooltipButton',

                                    'epiviz.ui.charts.decoration.ChartTooltip',
                                    'epiviz.ui.charts.decoration.ChartFilterCodeButton'
                                ]
                            },

                            track: {
                                width: 900,
                                height: 90,
                                margins: new epiviz.ui.charts.Margins(25, 20, 23, 10),
                                decorations: [
                                    'epiviz.ui.charts.decoration.ToggleTooltipButton',

                                    'epiviz.ui.charts.decoration.ChartTooltip',
                                    'epiviz.ui.charts.decoration.ChartFilterCodeButton'
                                ]
                            },

                            'epiviz.plugins.charts.StackedBlocksTrack': {
                                height: 120
                            },
                        },

                        chartCustomSettings: {
                            'epiviz.plugins.charts.StackedBlocksTrack': {
                                minBlockDistance: 3,
                                useColorBy: false,
                                blockColorBy: ''
                            }
                        },

                        colorPalettes: [
                            new epiviz.ui.charts.ColorPalette(
                                ['#025167', '#e7003e', '#ffcd00', '#057d9f', '#970026', '#ffe373', '#ff8100'],
                                'Epiviz v1.0 Colors', 'epiviz-v1'),
                            new epiviz.ui.charts.ColorPalette(
                                ['#1859a9', '#ed2d2e', '#008c47', '#010101', '#f37d22', '#662c91', '#a11d20', '#b33893'],
                                'Epiviz v2.0 Bright', 'epiviz-v2-bright'),
                            new epiviz.ui.charts.ColorPalette(
                                ['#b8d2eb', '#f2aeac', '#d8e4aa', '#cccccc', '#f2d1b0', '#d4b2d3', '#ddb8a9', '#ebbfd9'],
                                'Epiviz v2.0 Light', 'epiviz-v2-light'),
                            new epiviz.ui.charts.ColorPalette(
                                ['#599ad3', '#f1595f', '#79c36a', '#727272', '#f9a65a', '#9e66ab', '#cd7058', '#d77fb3'],
                                'Epiviz v2.0 Medium', 'epiviz-v2-medium'),
                            new epiviz.ui.charts.ColorPalette(
                                ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],
                                'D3 Category 10', 'd3-category10'),
                            new epiviz.ui.charts.ColorPalette(
                                ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"],
                                'D3 Category 20', 'd3-category20'),
                            new epiviz.ui.charts.ColorPalette(
                                ["#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939", "#8ca252", "#b5cf6b", "#cedb9c", "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94", "#843c39", "#ad494a", "#d6616b", "#e7969c", "#7b4173", "#a55194", "#ce6dbd", "#de9ed6"],
                                'D3 Category 20b', 'd3-category20b'),
                            new epiviz.ui.charts.ColorPalette(
                                ["#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#e6550d", "#fd8d3c", "#fdae6b", "#fdd0a2", "#31a354", "#74c476", "#a1d99b", "#c7e9c0", "#756bb1", "#9e9ac8", "#bcbddc", "#dadaeb", "#636363", "#969696", "#bdbdbd", "#d9d9d9"],
                                'D3 Category 20c', 'd3-category20c'),
                            new epiviz.ui.charts.ColorPalette(
                                ['#f9a65a', '#599ad3', '#79c36a', '#f1595f', '#727272', '#cd7058', '#d77fb3'],
                                'Genes Default', 'genes-default'),
                            new epiviz.ui.charts.ColorPalette(
                                ['#1859a9', '#ed2d2e', '#008c47', '#010101', '#f37d22', '#662c91', '#a11d20', '#b33893'],
                                'Heatmap Default', 'heatmap-default')
                        ]
                    };

                    return epiviz.Config.SETTINGS;
                }
            }
        }
    }

    static get observers() {
        return [
            /* observer array just like 1.x */
        ]
    }

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();

        var self = this;

        if (self.useDefaultDataProvider) {

            self.measurements = self.measurements || [{
                'id': 'cancer',
                'name': 'Expression Colon Cancer',
                'type': 'feature',
                'datasourceId': 'gene_expression',
                'datasourceGroup': 'affymetrix_probeset',
                'dataprovider': 'umd',
                'formula': null,
                'defaultChartType': null,
                'annotation': null,
                'minValue': -3,
                'maxValue': 20,
                'metadata': ['probe']
            }, {
                'id': 'normal',
                'name': 'Expression Colon Normal',
                'type': 'feature',
                'datasourceId': 'gene_expression',
                'datasourceGroup': 'affymetrix_probeset',
                'dataprovider': 'umd',
                'formula': null,
                'defaultChartType': null,
                'annotation': null,
                'minValue': -3,
                'maxValue': 20,
                'metadata': ['probe']
            }];

            self.range = self.range || new epiviz.datatypes.GenomicRange("chr11", 80000000, 3000000);
            // self._measurementsChanged();

            var chartMeasMap = {};
            chartMeasMap[self.plotId] = self.visConfigSelection.measurements;

            var dataProviderFactory = new epiviz.data.DataProviderFactory(self.config);
            var dataManager = new epiviz.data.DataManager(self.config, dataProviderFactory);

            dataManager.getData(self.range, chartMeasMap, function (id, data) {
                self.data = data;
            });
        }
        self._initializeGrid();
        self._measurementsChanged();
    }

    disconnectedCallback() {
        super.connectedCallback();
    }

    ready() {
        super.ready();
        this.plotId = self.plotId || this._generatePlotId();
        // this.scopeSubtree(this.$.chart, true);
        this.config = new epiviz.Config(this.configSrc);
    }

    /**
    * Draws the chart.
    *
    * @param {Object<epiviz.datatypes.GenomicRange>} range genomic range.
    * @param {Object<epiviz.datatypes.MapGenomicData>} data to plot
    */
    _draw() {
        if (this.canvas) {
            this.chart.drawCanvas(this.range, this.data);
        }
        else {
            this.chart.draw(this.range, this.data);
        }
        this.shadowRoot.querySelector("paper-spinner-lite").active = false;
    }

    /**
     * Creates an instance of the blocks track chart.
     *
     * @return {epiviz.plugins.charts.StackedBlocksTrackType} StackedBlocksTrack chart object
     */
    _createChart() {
        return new epiviz.plugins.charts.StackedBlocksTrackType(new epiviz.Config(this.configSrc));
    }
}

customElements.define(EpivizStackedBlocksTrack.is, EpivizStackedBlocksTrack);

// Polymer({
//     /* Custom element html tag */
//     is: 'epiviz-stacked-blocks-track',
//     behaviors: [epiviz.ChartBehavior, epiviz.ChartSettingsBehavior, epiviz.ChartColorsBehavior, Polymer.IronResizableBehavior, epiviz.ChartRemoveBehavior, epiviz.ChartDraggableBehavior],
// });
