/**
 * Copyright © 2015 Magento. All rights reserved.
 * See COPYING.txt for license details.
 */
/*jshint browser:true jquery:true*/
/*global Handlebars*/
define([
    "jquery",
    "underscore",
    "jquery/ui",
    "jquery/template",
    "handlebars",
    "mage/translate"
], function($, _){
    "use strict";

    /**
     * Check wether the incoming string is not empty or if doesn't consist of spaces.
     *
     * @param {String} value - Value to check.
     * @returns {Boolean}
     */
    function isEmpty(value){
        return (value.length === 0) || (value == null)  || /^\s+$/.test(value);
    }

    $.widget('mage.quickSearch', {
        options: {
            autocomplete: 'off',
            minSearchLength: 2,
            responseFieldElements: 'ul li',
            selectClass: 'selected',
            template: '<li class="{{row_class}}" title="{{title}}">{{title}}<span class="amount">{{num_of_results}}</span></li>',
            submitBtn: 'button[type="submit"]',
            searchLabel: '[data-role=minisearch-label]'
        },

        _create: function() {
            this.responseList = { indexList: null, selected: null };
            this.autoComplete = $(this.options.destinationSelector);
            this.searchForm = $(this.options.formSelector);
            this.submitBtn = this.searchForm.find(this.options.submitBtn)[0];
            this.searchLabel = $(this.options.searchLabel);

            _.bindAll(this, '_onKeyDown', '_onPropertyChange', '_onSubmit');

            this.submitBtn.disabled = true;

            this.element.attr('autocomplete', this.options.autocomplete);

            this.element.on('blur', $.proxy(function() {

                setTimeout($.proxy(function () {
                    if (this.autoComplete.is(':hidden')) {
                        this.searchLabel.removeClass('active');
                    }
                    this.autoComplete.hide();
                }, this), 250);
            }, this));

            this.element.trigger('blur');

            this.element.on('focus', $.proxy(function() {
                this.searchLabel.addClass('active');
            }, this));
            this.element.on('keydown', this._onKeyDown);
            this.element.on('input propertychange', this._onPropertyChange);

            this.searchForm.on('submit', this._onSubmit);
        },
        /**
         * @private
         * @return {Element} The first element in the suggestion list.
         */
        _getFirstVisibleElement: function() {
            return this.responseList.indexList ? this.responseList.indexList.first() : false;
        },

        /**
         * @private
         * @return {Element} The last element in the suggestion list.
         */
        _getLastElement: function() {
            return this.responseList.indexList ? this.responseList.indexList.last() : false;
        },

        /**
         * Clears the item selected from the suggestion list and resets the suggestion list.
         * @private
         * @param {boolean} all Controls whether to clear the suggestion list.
         */
        _resetResponseList: function(all) {
            this.responseList.selected = null;
            if (all === true) {
                this.responseList.indexList = null;
            }
        },

        /**
         * Executes when the search box is submitted. Sets the search input field to the
         * value of the selected item.
         * @private
         * @param {Event} e The submit event
         */
        _onSubmit: function(e) {
            var value = this.element.val();

            if (isEmpty(value)) {
                e.preventDefault();
            }
            
            if (this.responseList.selected) {
                this.element.val(this.responseList.selected.attr('title'));
            }
        },

        /**
         * Executes when keys are pressed in the search input field. Performs specific actions
         * depending on which keys are pressed.
         * @private
         * @param {Event} e The key down event
         * @return {Boolean} Default return type for any unhandled keys
         */
        _onKeyDown: function(e) {
            var keyCode = e.keyCode || e.which;

            switch (keyCode) {
                case $.ui.keyCode.HOME:
                    this._getFirstVisibleElement().addClass(this.options.selectClass);
                    this.responseList.selected = this._getFirstVisibleElement();
                    break;
                case $.ui.keyCode.END:
                    this._getLastElement().addClass(this.options.selectClass);
                    this.responseList.selected = this._getLastElement();
                    break;
                case $.ui.keyCode.ESCAPE:
                    this._resetResponseList(true);
                    this.autoComplete.hide();
                    break;
                case $.ui.keyCode.ENTER:
                    this.searchForm.trigger('submit');
                    break;
                case $.ui.keyCode.DOWN:
                    if (this.responseList.indexList) {
                        if (!this.responseList.selected) {
                            this._getFirstVisibleElement().addClass(this.options.selectClass);
                            this.responseList.selected = this._getFirstVisibleElement();
                        }
                        else if (!this._getLastElement().hasClass(this.options.selectClass)) {
                            this.responseList.selected = this.responseList.selected.removeClass(this.options.selectClass).next().addClass(this.options.selectClass);
                        } else {
                            this.responseList.selected.removeClass(this.options.selectClass);
                            this._getFirstVisibleElement().addClass(this.options.selectClass);
                            this.responseList.selected = this._getFirstVisibleElement();
                        }
                    }
                    break;
                case $.ui.keyCode.UP:
                    if (this.responseList.indexList !== null) {
                        if (!this._getFirstVisibleElement().hasClass(this.options.selectClass)) {
                            this.responseList.selected = this.responseList.selected.removeClass(this.options.selectClass).prev().addClass(this.options.selectClass);

                        } else {
                            this.responseList.selected.removeClass(this.options.selectClass);
                            this._getLastElement().addClass(this.options.selectClass);
                            this.responseList.selected = this._getLastElement();
                        }
                    }
                    break;
                default:
                    return true;
            }
        },

        /**
         * Executes when the value of the search input field changes. Executes a GET request
         * to populate a suggestion list based on entered text. Handles click (select), hover,
         * and mouseout events on the populated suggestion list dropdown.
         * @private
         */
        _onPropertyChange: function() {
            var searchField = this.element,
                clonePosition = {
                    position: 'absolute',
                    // Removed to fix display issues
                    // left: searchField.offset().left,
                    // top: searchField.offset().top + searchField.outerHeight(),
                    width: searchField.outerWidth()
                },
                source = this.options.template,
                template = Handlebars.compile(source),
                dropdown = $('<ul></ul>'),
                value = this.element.val();

            this.submitBtn.disabled = isEmpty(value);

            if (value.length >= parseInt(this.options.minSearchLength, 10)) {
                $.get(this.options.url, {q: value}, $.proxy(function (data) {
                    $.each(data, function(index, element){
                        var html = template(element);
                        dropdown.append(html);
                    });
                    this.responseList.indexList = this.autoComplete.html(dropdown)
                        .css(clonePosition)
                        .show()
                        .find(this.options.responseFieldElements + ':visible');

                    this._resetResponseList(false);
                    
                    this.responseList.indexList
                        .on('click', function (e) {
                            this.responseList.selected = $(e.target);
                            this.searchForm.trigger('submit');
                        }.bind(this))
                        .on('mouseenter mouseleave', function (e) {
                            this.responseList.indexList.removeClass(this.options.selectClass);
                            $(e.target).addClass(this.options.selectClass);
                            this.responseList.selected = $(e.target);
                        }.bind(this))
                        .on('mouseout', function (e) {
                            if (!this._getLastElement() && this._getLastElement().hasClass(this.options.selectClass)) {
                                $(e.target).removeClass(this.options.selectClass);
                                this._resetResponseList(false);
                            }
                        }.bind(this));
                }, this));
            } else {
                this._resetResponseList(true);
                this.autoComplete.hide();
            }
        }
    });
    
    return $.mage.quickSearch;
});