/* Polymer dependency */
/* External Polymer Styles/elements dependency */
/*
`<epiviz-chart-settings>` is a view element that manages chart settings. 

All charts implement the `epiviz.ChartSettingsBehavior` that manages this element.
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-input/paper-input.js';
import 'paper-dropdown-input/paper-dropdown-input.js';
import '@polymer/paper-styles/color.js';
import '@polymer/paper-styles/typography.js';
import '@polymer/paper-styles/default-theme.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/iron-form/iron-form.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/iron-label/iron-label.js';
import 'paper-collapse-item/paper-collapse-item.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
// Extend Polymer.Element base class
class EpivizChartSettings extends PolymerElement {
  static get template() {
    return html`
        <style>
            .flex {
                /*@apply(--layout-horizontal); */
                display: grid;
                grid-auto-rows: auto;
                grid-template-columns: 1fr 1fr;
                grid-column-gap: 20px;
            }

            .flex-end-justified {
                @apply(--layout-horizontal);
                @apply(--layout-end-justified);
            }

            .collapse-content {
                padding: 15px;
                border-top: none;
                display: block;
                margin: 3px;
            }

            .collapse-header {
                padding: 10px 15px;
                background-color: #f3f3f3;
                border: 1px solid #dedede;
                border-radius: 5px;
                cursor: pointer;
                width: 100%;
                text-align: left;
                margin-top: 10px;
            }

            #formSettings {
                min-width: 400px;
                overflow: scroll;
                grid-row: 2;
            }

            #scrollContent {
                margin-bottom: 10px;
            }

            #modal {
                display: grid;
                grid-template-rows: 50px minmax(auto, 1fr) 100px;
                max-height: 70%;
                top: 10%;
            }

            .header {
                grid-row: 1;
            }

            .footer {
                grid-row: 3;
            }

            paper-collapse-item {
                --paper-collapse-simple-paper-item-styles: {
                    border: 1px solid var(--light-theme-divider-color);
                }
                ;
            }

            paper-toggle-button {
                padding-top: 8px;
            }

            .toggleLabel {
                padding-top: 8px;
            }
        </style>

        <!-- local DOM goes here -->
        <div id="settings">
            <!--no-overlap horizontal-align="left" vertical-align="top"-->
            <paper-dialog id="modal" modal="">
                <h2 class="header">Title and Margins</h2>
                <iron-form id="formSettings">
                    <form>
                        <!--  <button class="collapse-header" on-click="toggleCommon">Chart Title and Margins</button> -->
                        <paper-collapse-item id="commonSettings" header="Chart Title and Margins">
                            <div class="collapse-content">
                                <div class="container flex">
                                    <template is="dom-repeat" items="{{defs}}" filter="_isCommonSetting">
                                        <template restamp="true" is="dom-if" if="[[_settingType(item.type, 'boolean')]]">
                                            <iron-label for="{{item.id}}">
                                                <div class="toggleLabel">{{item.label}}</div>
                                                <paper-toggle-button name="{{item.id}}" label="{{item.label}}" checked="[[_getValue(item.id)]]" toggles=""></paper-toggle-button>
                                            </iron-label>
                                        </template>
                                        <template restamp="true" is="dom-if" if="[[_settingType(item.type, 'string')]]">
                                            <paper-input name="{{item.id}}" label="{{item.label}}" value="[[_getValue(item.id)]]"></paper-input>
                                        </template>
                                        <template restamp="true" is="dom-if" if="[[_settingType(item.type, 'number')]]">
                                            <paper-input name="{{item.id}}" type="number" label="{{item.label}}" value="[[_getValue(item.id)]]"></paper-input>
                                        </template>
                                        <template restamp="true" is="dom-if" if="[[_settingType(item.type, 'array')]]">
                                            <paper-dropdown-input name="{{item.id}}" value="[[_getValue(item.id)]]" label="{{item.label}}" items="{{item.possibleValues}}"></paper-dropdown-input>
                                        </template>
                                    </template>
                                </div>
                            </div>
                        </paper-collapse-item>
                        <!--<template is="dom-repeat" items="{{defs}}", filter="isCommonSettings">
                            </template>-->

                        <!-- <button class="collapse-header" on-click="toggleStats">Chart Settings</button> -->
                        <paper-collapse-item id="statsSettings" header="Chart Settings">
                            <div class="collapse-content">
                                <div class="container flex">
                                    <template is="dom-repeat" items="{{defs}}" filter="_isStatSetting">
                                        <template restamp="true" is="dom-if" if="[[_settingType(item.type, 'boolean')]]">
                                            <iron-label for="{{item.id}}">
                                                <div class="toggleLabel">{{item.label}}</div>
                                                <paper-toggle-button name="{{item.id}}" label="{{item.label}}" checked="[[_getValue(item.id)]]" toggles=""></paper-toggle-button>
                                            </iron-label>
                                        </template>
                                        <template restamp="true" is="dom-if" if="[[_settingType(item.type, 'string')]]">
                                            <paper-input name="{{item.id}}" label="{{item.label}}" value="[[_getValue(item.id)]]"></paper-input>
                                        </template>
                                        <template restamp="true" is="dom-if" if="[[_settingType(item.type, 'number')]]">
                                            <paper-input name="{{item.id}}" label="{{item.label}}" value="[[_getValue(item.id)]]"></paper-input>
                                        </template>
                                        <template restamp="true" is="dom-if" if="[[_settingType(item.type, 'array')]]">
                                            <paper-dropdown-input name="{{item.id}}" value="[[_getValue(item.id)]]" label="{{item.label}}" items="{{item.possibleValues}}"></paper-dropdown-input>
                                        </template>
                                    </template>
                                </div>
                                <span hidden\$="{{_hasStatSetting()}}">No Chart Settings</span>
                            </div>
                        </paper-collapse-item>

                        <!-- </paper-dialog-scrollable> -->

                    </form>
                </iron-form>
                <div class="footer">
                    <paper-button id="submit" on-tap="_submit" raised="">Apply</paper-button>
                    <paper-button id="cancel" on-tap="_cancel" raised="">Cancel</paper-button>
                </div>
            </paper-dialog>
        </div>
`;
  }

  static get is() { return 'epiviz-chart-settings'; }

  static get properties() {
      return {
          /**
          * Default chart setting definitions.
          *
          * @type {Array.<epiviz.ui.charts.CustomSetting>}
          */
          defs: {
              type: Array,
              notify: true
          },

          /**
          * Currently set chart setting values.
          *
          * @type {Object.<string, *>}
          */
          vals: {
              type: Object,
              notify: true
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
      // this.addEventListener('submit.click', e => this._submit(e));
      // this.addEventListener('cancel.click', e => this._cancel(e));
  }

  connectedCallback() {
      super.connectedCallback();
      for (var i = 0; i < this.defs.length; i++) {
          // def = this.defs[i];
          var id = this.defs[i].id;
          var expected = ['categorical', 'measurementsMetadata', 'measurementsAnnotation']
          if (expected.indexOf(this.defs[i].type) != -1) {
              if (this.defs[i].possibleValues == null) {
                  this.defs[i].possibleValues = [this.vals[id]];
              }
              else if (this.defs[i].possibleValues.indexOf(this.vals[id]) === -1) {
                  this.defs[i].possibleValues.push(this.vals[id]);
              }
          }
      }

      this.$.formSettings.addEventListener('iron-form-submit', this._form_submit.bind(this));

  }

  disconnectedCallback() {
      super.connectedCallback();
  }

  /**
   * Toggle handler for showing chart settings
   */
  toggleCommon(event) {
      this.$.commonSettings.toggle();
      event.preventDefault();
      event.stopPropagation();
  }

  /**
   * Toggle handler for showing chart stat settings
   */
  toggleStats(event) {
      this.$.statsSettings.toggle();
      event.preventDefault();
      event.stopPropagation();
  }

  /**
   * whether a setting is a common setting.
   *
   * @param {string} item setting name/label.
   *
   * @return {boolean} if item is common setting
   */
  _isCommonSetting(item) {
      var commonSettings = ['title', 'marginTop', 'marginBottom', 'marginRight', 'marginLeft'];
      if (commonSettings.indexOf(item.id) != -1) {
          return true;
      }

      return false;
  }

  /**
   * whether a setting is a stat setting.
   *
   * @param {string} item setting name/label.
   *
   * @return {boolean} if item is stat setting
   */
  _isStatSetting(item) {
      return !this._isCommonSetting(item);
  }

  _hasStatSetting() {
      var self = this;
      var hasStatSetting = false;
      this.defs.some(function (item) {
          if (self._isStatSetting(item)) {
              hasStatSetting = true;
              return true;
          }
      });
      return hasStatSetting;
  }

  /**
   * UI helper function for finding a setting type
   *
   * @param {string} type input setting type.
   * @param {string} expected expected setting type.
   * @return {boolean} return true if type and expected match
   */
  _settingType(type, expected) {
      if (expected == 'array') {
          expected = ['categorical', 'measurementsMetadata', 'measurementsAnnotation'];
          return expected.indexOf(type) === -1 ? false : true;

          // if(expected.indexOf(type) != -1) {
          //     var def = null;
          //     for(var i=0; i< this.defs.length; i++){
          //         if(this.defs[i].id == id) {
          //             def = this.defs[i];
          //         }
          //     }

          //     if(def.possibleValues === null) {return false;}
          //     else {return true;}
          // }
      }
      return type == expected;
  }

  /**
   * UI helper function for grouping settings by type
   *
   * @param {string} value input setting index.
   * @param {string} type expected setting group.
   * @return {boolean} return true if value and type match
   */
  _isIndex(value, type) {
      if ((value % 2 == 0 && type == "even") || (value % 2 == 1 && type == "odd")) {
          return true;
      }

      return false;
  }

  /**
   * UI helper function get value for a given setting id
   *
   * @param {string} id setting id.
   * @return {number|string} return setting value
   */
  _getValue(id) {
      // var def = null;
      return this.vals[id];
  }

  /**
   * handles form submit action
   */
  _submit(event) {
      this.$.formSettings.submit();
  }

  /**
   * handles form submit action
   */
  _form_submit(event) {
      var self = this;
      this.vals = event.detail;
      //  format vals types
      this.defs.forEach(function (def) {
          if (def.type == "number" && self.vals[def.id] != "default") {
              self.vals[def.id] = parseFloat(self.vals[def.id]);
          }

          if (def.type == "boolean") {
              if (self.vals[def.id][0] == "on") {
                  self.vals[def.id] = true;
              }
              else {
                  self.vals[def.id] = false;
              }
          }
      });
      this.callback(this.vals);
      this.closeSettings();
  }

  /**
   * handles form cancel action
   */
  _cancel(event) {
      this.closeSettings();
  }

  /**
   * handles form show modal action
   */
  showSettings(target, callback) {
      this.callback = callback;
      this.$.modal.open();
  }

  /**
   * handles form close modal action
   */
  closeSettings() {
      this.$.modal.close();
  }
}

customElements.define(EpivizChartSettings.is, EpivizChartSettings);
