/* Polymer dependency */
/* External Polymer Styles/elements dependency */
/*
`<epiviz-add-chart>` allows adding new charts to the `epiviz-navigation` or `epiviz-environment`. 
    Creates an Instance of the measurement browser.
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-styles/paper-styles.js';
import '@polymer/iron-icons/editor-icons.js';
import 'table-filter/data-filter.js';
import '@polymer/paper-tabs/paper-tabs.js';
import '@polymer/iron-pages/iron-pages.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';

// Extend Polymer.Element base class
class EpivizAddChart extends PolymerElement {
  static get template() {
    return html`
        <style>
            paper-button {
                --paper-button: {
                    display: inline-block;
                    background: #4285f4;
                    color: #fff;
                    padding: 5px;
                }
                --paper-button-disabled: {
                    color: white
                };
            }

            iron-image {
                padding: 1em;
            }

            iron-pages {
                max-height: inherit;
            }

            data-filter {
                max-height: calc(72vh - 100px);
            }

            paper-tabs {
                --paper-tab-ink: var(--paper-blue-grey-200);
                --paper-tabs-selection-bar-color: var(--paper-blue-500);
                background-color: var(--google-grey-300);
            }

            .dialog-content {
                max-height: inherit;
            }

            .buttonContainer {
                display: inline-block;
                padding: 8px;
            }

            .infoMessage {
                text-align: center;
                @apply --paper-font-subhead;
            }

            #title {
                display: inline;
                @apply --paper-font-title;
                position: relative;
                top: 8px;
            }

        </style>
        <!-- local DOM goes here -->

        <template is="dom-if" if="{{!_isEnvironment(_charts)}}">
            <div class="buttonContainer">
                <paper-button raised="" on-tap="_showModal">
                    <iron-icon icon="editor:insert-chart"></iron-icon>
                    <span>Add Visualization</span>
                </paper-button>
            </div>
        </template>

        <template is="dom-if" if="{{_isEnvironment(_charts)}}">
            <paper-menu-button dynamic-align="" horizontal-align="right" vertical-offset="42">
                <paper-button slot="dropdown-trigger" raised="">
                    <iron-icon icon="editor:insert-chart"></iron-icon>
                    <span>Add Visualization</span>
                </paper-button>
                <paper-listbox slot="dropdown-content">
                    <paper-item on-tap="_showModal">Add Genomic Range</paper-item>
                    <paper-item on-tap="_addNavigation">Add Navigation</paper-item>
                </paper-listbox>
            </paper-menu-button>
        </template>

        <paper-dialog id="modal" modal="">
            <div class="header">
                <div id="title">Add a</div>
                <paper-dropdown-menu label="Chart">
                    <paper-listbox slot="dropdown-content" selected="{{selectedChart}}">
                        <template is="dom-repeat" items="{{_charts}}">
                            <paper-item on-click="_chartSelectionChanged">[[item]]</paper-item>
                        </template>
                    </paper-listbox>
                </paper-dropdown-menu>
                <paper-tabs selected="{{tabSelected}}" noink="">
                    <paper-tab>Existing Charts</paper-tab>
                    <paper-tab>All Measurements </paper-tab>
                </paper-tabs>
            </div>
            <paper-dialog-scrollable>
                <iron-pages selected="{{tabSelected}}">
                    <div class="dialog-content">
                        <template is="dom-if" if="[[_tableDataExists(_existingChartMeasurements)]]">
                            <data-filter data="{{_existingChartMeasurements}}" class="curr-charts" selected-items="{{selectedExistingMeasurements}}">
                            </data-filter>
                        </template>
                        <p class="infoMessage" hidden\$="[[_tableDataExists(_existingChartMeasurements)]]">No Existing Charts</p>
                    </div>

                    <div class="dialog-content">
                        <template is="dom-if" if="[[_tableDataExists(_jsonMeasurements)]]">
                            <data-filter data="{{_jsonMeasurements}}" class="new-charts" selected-items="{{selectedMeasurements}}">
                            </data-filter>
                        </template>
                        <p class="infoMessage" hidden\$="[[_tableDataExists(_jsonMeasurements)]]">Choose a Chart Type</p>
                    </div>
                </iron-pages>
            </paper-dialog-scrollable>
            <div class="buttons">
                <paper-button on-tap="_submit" disabled="{{!_enableButton(selectedChart, selectedMeasurements.*, selectedExistingMeasurements.*, tabSelected.*)}}" dialog-confirm="" autofocus="">Add Chart</paper-button>
                <paper-button on-tap="_close" dialog-dismiss="">Close</paper-button>
            </div>
        </paper-dialog>
        <!-- </div> -->
`;
  }

  static get is() { return 'epiviz-add-chart'; }

  static get properties() {
      return {
          /**
          * currently available measurements on the app 
          * uses measurements available from the `epiviz-data-source` element.
          *
          * @type {Array.<epiviz.ui.charts.CustomSetting>}
          */
          measurements: {
              type: Object,
              notify: true
          },

          /**
          * selected measurements from browser.
          * chartType:
          * measurement:
          * @type {Object}
          */
          selection: {
              type: Object,
              notify: true
          },

          selectedMeasurements: {
              type: Array,
              notify: true,
          },

          selectedExistingMeasurements: {
              type: Array,
              notify: true,
          },

          /**
          * selected chart from the browser.
          *
          * @type {Array.<epiviz.ui.charts.CustomSetting>}
          */
          selectedChart: {
              type: String,
              notify: true,
              value: null,
              observer: "_refitModal",
          },

          /**
          * currently available chart types on the app.
          */
          _chartTypes: {
              type: Object,
              notify: true,
              reflectToAttribute: true,
              value: function () {
                  return {
                      "GenesTrack": "epiviz-genes-track",
                      "BlocksTrack": 'epiviz-blocks-track',
                      "StackedBlocksTrack": 'epiviz-stacked-blocks-track',
                      "HeatmapPlot": "epiviz-heatmap-plot",
                      "ScatterPlot": "epiviz-scatter-plot",
                      "LineTrack": 'epiviz-line-track',
                      "StackedLineTrack": 'epiviz-stacked-line-track',
                      "LinePlot": 'epiviz-line-plot',
                      "StackedLinePlot": 'epiviz-stacked-line-plot',
                      "EpivizNavigation": 'epiviz-navigation'
                  }
              }
          },

          _charts: {
              type: Array,
              notify: true,
              computed: "_getCharts(_chartTypes, _parentContainer)"
          },

          /**
          * parentContainer
          */
          _parentContainer: {
              type: Object,
          },

          _jsonMeasurements: {
              type: Array,
          },

          _existingChartMeasurements: {
              type: Array,
          },

          tabSelected: {
              type: Number,
              notify: true,
              value: function () {
                  return 0;
              },
              observer: "_refitModal",
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
  }

  disconnectedCallback() {
      super.connectedCallback();
  }

  _getJSONMeasurements(data) {
      return data.raw();
  }

  /**
   * Get Available Chart Types
   */
  _getCharts(chartTypes, parentContainer) {
      if (parentContainer && parentContainer.nodeName === "EPIVIZ-NAVIGATION") {
          delete chartTypes["EpivizNavigation"];
      }
      return Object.keys(chartTypes);
  }

  _isEnvironment(chartTypes) {
      return chartTypes.indexOf("EpivizNavigation") !== -1;
  }

  _tableDataExists(tableData) {
      return tableData.length > 0;
  }

  _enableButton(selectedChart, selectedMeasurements, selectedExistingMeasurements, tabSelected) {
      if (selectedChart !== null && selectedChart >= 0) {
          if (this.tabSelected === 0 && this.selectedExistingMeasurements && this.selectedExistingMeasurements.length > 0) {
              return true;
          }

          if (this.tabSelected === 1 && this.selectedMeasurements && this.selectedMeasurements.length > 0) {
              return true;
          }
      }
      return false;
  }

  /**
   * API to add a chart
   * @param {chartType}: chart type to add/create. Must be one of the defined chart types in _chartTypes attribute.
   * @param {measurements}: measurements to use.
   * TODO:
   * @param {data}: data for the chart (for json-based-charts). 
   */
  _addChart(chartType, measurements) {

      var self = this;
      var envElement = self.parentNode.parentNode.parentNode.parentNode.nodeName == "EPIVIZ-NAVIGATION" ? self.parentNode.parentNode.parentNode.parentNode : self.parentNode.parentNode.parentNode;
      var envElement = self._parentContainer;

      var chartElem = document.createElement(self._chartTypes[chartType]);
      chartElem.slot = "charts";
      chartElem.range = envElement.range;
      var chartElemType = chartElem._createChart();

      chartElem.setAttribute("measurements", JSON.stringify(measurements));
      envElement.appendChild(chartElem);
  }

  _refitModal() {
      setTimeout(() => this.$.modal.refit(), 0);
  }

  _addNavigation() {
      var envElement = this._parentContainer;
      var elem = document.createElement("epiviz-navigation");

      elem.setAttribute("chr", "chr19");
      elem.setAttribute("start", 10084603);
      elem.setAttribute("end", 10312571);
      elem.setAttribute("no-logo", true);
      elem.slot = "charts";

      envElement.appendChild(elem);
  }

  _showModal(event) {
      var envElement = this._parentContainer;
      var currentCharts = [];
      var currentChartObj = {};
      let navChildren =
          FlattenedNodesObserver.getFlattenedNodes(envElement).filter(n => n.nodeType === Node.ELEMENT_NODE);
      var numChildren = navChildren.length;
      for (var index = 0; index < numChildren; index++) {
          var currentChild = navChildren[index];
          currentCharts.push({ "node": currentChild.nodeName, "id": currentChild.plotId });
          currentChartObj[currentChild.plotId] = currentChild.measurements;
      }
      this.currentChartObj = currentChartObj;
      this.set("_existingChartMeasurements", currentCharts);

      this.$.modal.open();
  }

  /**
   * show the measurement browser
   */
  _chartSelectionChanged(event) {
      var self = this;
      var envElement = self._parentContainer;

      self.selection = {};
      self.selection.chartType = self._charts[self.selectedChart];
      self.measurements = envElement.measurementSet;

      if (event.target.nodeName === "PAPER-ITEM") {
          $(event.target).parent().parent()[0].selected = null;
      }

      if (self.selection.chartType == "GenesTrack") {
          var data = envElement.measurementSet.subset(function (m) { return m.defaultChartType() == "Genes Track" });
          var datasourceGroups = {};
          data.foreach(function (m) {
              if (data.dataprovider && data.dataprovider != m.dataprovider()) { return; }
              if (data.annotation) {
                  for (var key in data.annotation) {
                      if (!data.annotation.hasOwnProperty(key)) { continue; }
                      if (!m.annotation() || m.annotation()[key] != data.annotation[key]) { return; }
                  }
              }
              datasourceGroups[m.datasourceGroup()] = ["Genes track", false];
          });

          // self.set("_jsonMeasurements", data.raw());
      }
      else {
          var data = envElement.measurementSet;
          var source = "epiviz";

          // self.set("_jsonMeasurements", data.raw());
      }
      var nData = [];
      var mData = data.raw();
      mData.forEach(function (d, i) {

          var temp = d.annotation;
          if (temp == undefined) {
              temp = {};
          }

          delete temp["tags"];
          delete d["type"];
          delete d["datasourceId"];
          delete d["datasourceGroup"];
          delete d["dataprovider"];
          delete d["formula"];
          delete d["defaultChartType"];

          d.annotation = temp;
          nData[i] = d;
      });
      
      self.set("_jsonMeasurements", nData);
      
      this.$.modal.refit();
  }

  _close() {
      this.selectedChart = null;
      var newCharts = this.shadowRoot.querySelector("data-filter.new-charts");
      var currCharts = this.shadowRoot.querySelector("data-filter.curr-charts");
      if (newCharts) {
          newCharts._deselectAll();
      }
      if (currCharts) {
          currCharts._deselectAll();
      }
      this.set("selectedMeasurements", []);
      this.set("selectedExistingMeasurements", []);
      this.set("_jsonMeasurements", []);
  }

  _submit() {
      var envElement = this._parentContainer;
      var fids;
      var fmeasurements;
      if (this.tabSelected === 0) {
          fids = this.selectedExistingMeasurements.map(x => x.id);
          fmeasurements = this.currentChartObj[fids[0]];
      } else if (this.tabSelected === 1) {
          fids = this.selectedMeasurements.map(x => x.id);
          fmeasurements = envElement.measurementSet.subset(function (m) { return fids.includes(m.id()) });
          fmeasurements = fmeasurements.raw();
      }


      this.selection = {};
      this.selection.chartType = this._charts[this.selectedChart];

      var chartElem = document.createElement(this._chartTypes[this.selection.chartType]);
      chartElem.slot = "charts";
      chartElem.range = envElement.range;
      var chartElemType = chartElem._createChart();

      chartElem.setAttribute("measurements", JSON.stringify(fmeasurements));
      envElement.appendChild(chartElem);

      this._close();
  }

  /**
   * handles form show modal action
   */
  showAdd(target, callback) {
      this.callback = callback;
      this.$.modal.positionTarget = target;
      this.$.modal.open();
  }

  /**
   * handles form close modal action
   */
  closeAddDialog() {
      this.$.modal.close();
  }
}

customElements.define(EpivizAddChart.is, EpivizAddChart);
