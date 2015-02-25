/*! Polyglot Language Switcher 2 - v1.0.0 - 2015-02-20
 * https://github.com/ixtendo/Polyglot-Language-Switcher-2/
 *
 * Copyright (c) 2015 Ixtendo;
 * Licensed under the MIT license */

var PolyglotLanguageSwitcher = React.createClass({displayName: "PolyglotLanguageSwitcher",
    propTypes: {
        items: React.PropTypes.array.isRequired,
        openMode: React.PropTypes.string,
        hoverTimeout: React.PropTypes.number,
        gridColumns: React.PropTypes.oneOfType([
            React.PropTypes.number,
            React.PropTypes.func
        ]),
        showFlag: React.PropTypes.bool,
        selectedLang: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.func
        ]),
        onPopupOpening: React.PropTypes.func,
        onPopupOpened: React.PropTypes.func,
        onPopupClosing: React.PropTypes.func,
        onPopupClosed: React.PropTypes.func,
        onLanguageChanged: React.PropTypes.func
    },
    getDefaultProps: function () {
        return {
            gridColumns: 1,
            showFlag: true,
            openMode: 'hover',
            hoverTimeout: 200,
            selectedLang: null,
            onPopupOpening: null,
            onPopupOpened: null,
            onPopupClosing: null,
            onPopupClosed: null,
            onLanguageChanged: null
        };
    },
    getInitialState: function () {
        var itemsProp = this.props.items;
        var selectedLangProp = this.props.selectedLang;
        var selectedLang = null;
        for (var i = 0; i < itemsProp.length; i++) {
            var item = itemsProp[i];
            if (selectedLangProp === item.id) {
                selectedLang = item;
            }
        }
        return {
            popupOpened: false,
            selectedLang: selectedLang ? selectedLang : itemsProp[0],
            closePopupTimeout: -1
        };
    },
    _documentClickHandler: function (evt) {
        this._processEvent({id: 'onPopupClosing'});
        this.setState({popupOpened: false});
        this._processEvent({id: 'onPopupClosed'});
    },
    _documentKeyHandler: function (evt) {
        if(evt.keyCode === 27) {
            this._processEvent({id: 'onPopupClosing'});
            this.setState({popupOpened: false});
            this._processEvent({id: 'onPopupClosed'});
        }
    },
    _processEvent: function (evt) {
        var onPopupOpeningProp = this.props.onPopupOpening;
        var onPopupOpenedProp = this.props.onPopupOpened;
        var onPopupClosingProp = this.props.onPopupClosing;
        var onPopupClosedProp = this.props.onPopupClosed;
        var onLanguageChangedProp = this.props.onLanguageChanged;

        if (evt.id === 'onPopupOpening') {
            if (onPopupOpeningProp) {
                onPopupOpeningProp(this);
            }
        } else if (evt.id === 'onPopupOpened') {
            jQuery(document).on('click', this._documentClickHandler);
            jQuery(document).on('keydown', this._documentKeyHandler);
            if (onPopupOpenedProp) {
                onPopupOpenedProp(this);
            }
        } else if (evt.id === 'onPopupClosing') {
            jQuery(document).off('click', this._documentClickHandler);
            jQuery(document).off('keydown', this._documentKeyHandler);
            if (onPopupClosingProp) {
                onPopupClosingProp(this);
            }
        } else if (evt.id === 'onPopupClosed') {
            if (onPopupClosedProp) {
                onPopupClosedProp(this);
            }
        } else if (evt.id === 'onLanguageChanged') {
            if (onLanguageChangedProp) {
                onLanguageChangedProp(evt.selectedLang);
            }
        } else if (evt.id === 'clearClosePopupTimeout') {
            if (this.state.closePopupTimeout > -1) {
                clearTimeout(this.state.closePopupTimeout);
                this.state.closePopupTimeout = -1;
            }
        }
    },
    _onLanguageSelected: function (lang, evt) {
        evt.stopPropagation();
        this._processEvent({id: 'clearClosePopupTimeout'});
        this._processEvent({id: 'onPopupClosing'});
        this.setState({selectedLang: lang, popupOpened: false});
        this._processEvent({id: 'onPopupClosed'});
        this._processEvent({id: 'onLanguageChanged', selectedLang: lang});
        return false;
    },
    _onClick: function (evt) {
        evt.stopPropagation();
        if (this.state.popupOpened) {
            this._processEvent({id: 'onPopupClosing'});
            this.setState({popupOpened: false});
            this._processEvent({id: 'onPopupClosed'});
        } else {
            this._processEvent({id: 'onPopupOpening'});
            this.setState({popupOpened: true});
            this._processEvent({id: 'onPopupOpened'});
        }
        return false;
    },
    _onHover: function (enter, evt) {
        var _this = this;
        var hoverTimeoutProp = this.props.hoverTimeout;
        evt.stopPropagation();
        if (enter) {
            this._processEvent({id: 'clearClosePopupTimeout'});
            if (!this.state.popupOpened) {
                this._processEvent({id: 'onPopupOpening'});
                this.setState({popupOpened: true});
                this._processEvent({id: 'onPopupOpened'});
            }
        } else {
            if (this.state.closePopupTimeout < 0) {
                this.state.closePopupTimeout = setTimeout(function () {
                    _this._processEvent({id: 'onPopupClosing'});
                    _this.setState({popupOpened: false});
                    _this._processEvent({id: 'onPopupClosed'});
                }, hoverTimeoutProp);
            }
        }
        return false;
    },
    render: function () {
        var _this = this;
        var itemsProp = this.props.items;
        var openMode = this.props.openMode;
        var gridColumnsProp = this.props.gridColumns;
        var showFlagsProp = this.props.showFlag;
        var langPerColumn = Math.round(itemsProp.length / gridColumnsProp);
        var selectedLang = this.state.selectedLang;
        var popupOpened = this.state.popupOpened;
        var liElements = [];

        var getTableColumns = function () {
            var tableColumns = [];
            for (var i = 0; i < itemsProp.length; i++) {
                var item = itemsProp[i];
                var selectedItemClass = '';
                if (item.id === selectedLang.id) {
                    selectedItemClass = 'pls-selected-locale';
                }
                if (showFlagsProp) {
                    liElements.push(React.createElement("li", null,
                        React.createElement("a", {href: "#", className: selectedItemClass, title: item.title, onClick: _this._onLanguageSelected.bind(_this, item)},
                            React.createElement("img", {src: item.flagImg, alt: item.flagTitle}), " ", item.name)
                    ));
                } else {
                    liElements.push(React.createElement("li", null,
                        React.createElement("a", {href: "#", className: selectedItemClass, title: item.title, onClick: _this._onLanguageSelected.bind(_this, item)}, " ", item.name)
                    ));
                }
                if (((i + 1) % langPerColumn) === 0) {
                    tableColumns.push(React.createElement("td", null,
                        React.createElement("ul", null, liElements)
                    ));
                    liElements = [];
                }
            }

            if (liElements.length > 0) {
                tableColumns.push(React.createElement("td", null,
                    React.createElement("ul", null, liElements)
                ));
                liElements = [];
            }

            return tableColumns;
        };

        var getSelectedLanguage = function () {
            var flagEl = '';
            if (showFlagsProp) {
                flagEl = React.createElement("img", {src: selectedLang.flagImg, alt: selectedLang.flagTitle});
            }
            if (openMode === 'hover') {
                return React.createElement("a", {className: "pls-selected-locale", href: "#", onMouseEnter: _this._onHover.bind(_this, true), onMouseLeave: _this._onHover.bind(_this, false)}, flagEl, " ", selectedLang.name);
            } else {
                return React.createElement("a", {className: "pls-selected-locale", href: "#", onClick: _this._onClick}, flagEl, " ", selectedLang.name);
            }
        };

        var getPopup = function () {
            var popupStyles = {};
            if (!popupOpened) {
                popupStyles.display = 'none';
            }
            if (openMode === 'hover') {
                return React.createElement("div", {className: "pls-language-container-scrollable", style: popupStyles, onMouseEnter: _this._onHover.bind(_this, true), onMouseLeave: _this._onHover.bind(_this, false)},
                    React.createElement("table", {className: "pls-language-container"},
                        React.createElement("tbody", null,
                            React.createElement("tr", null, getTableColumns())
                        )
                    )
                );
            } else {
                return React.createElement("div", {className: "pls-language-container-scrollable", style: popupStyles},
                    React.createElement("table", {className: "pls-language-container"},
                        React.createElement("tbody", null,
                            React.createElement("tr", null, getTableColumns())
                        )
                    )
                );
            }
        };

        return React.createElement("div", {className: "polyglot-language-switcher"}, getSelectedLanguage(), " ", getPopup());
    }
});