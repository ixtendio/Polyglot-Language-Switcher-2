/*! Polyglot Language Switcher 2 - v1.0.0 - 2015-02-20
 * https://github.com/ixtendo/Polyglot-Language-Switcher-2/
 *
 * Copyright (c) 2015 Ixtendo;
 * Licensed under the MIT license */

 (function ($) {

    var getOptions = function (invoker, options) {
        var $invoker = $(invoker);
        if (!options) {
            options = {};
        }
        $.each($.fn.polyglotLanguageSwitcher.defaults, function (prop) {
            var propData = $invoker.data(prop);
            if (propData) {
                options[prop] = propData;
            }
        });
        return options;
    };

    $.fn.polyglotLanguageSwitcher = function (options) {

        var getSetting = function (settings, setting) {
            return $.isFunction(settings[setting]) ? settings[setting].call(settings) : settings[setting];
        };

        var triggerEvent = function (evt, settings) {
            var invoker = settings._model.invoker;
            var $invoker = $(invoker);
            switch (evt.type) {
                case 'opening':
                    settings._model.status = 'opening';
                    $invoker.trigger($.Event('popupOpening', {target: evt.target, invoker: invoker}));
                    break;
                case 'opened':
                    settings._model.status = 'opened';
                    var $popup = $(evt.target);
                    if (!settings._model.documentClickHandler) {
                        settings._model.documentClickHandler = $(document).on('click', function (e) {
                            if ($(e.target).closest($popup).length === 0) {
                                closePopup($popup, settings);
                            }
                        });
                    }
                    if (!settings._model.documentKeyHandler) {
                        settings._model.documentKeyHandler = $(document).on('keydown', function (e) {
                            if (e.keyCode === 27) {
                                closePopup($popup, settings);
                            }
                        });
                    }
                    $invoker.trigger($.Event('popupOpened', {target: evt.target, invoker: invoker}));
                    break;
                case 'closing':
                    settings._model.status = 'closing';
                    $invoker.trigger($.Event('popupClosing', {target: evt.target, invoker: invoker}));
                    break;
                case 'closed':
                    settings._model.status = 'closed';
                    if (settings._model.documentClickHandler) {
                        $(document).off('click', settings._model.documentClickHandler);
                        settings._model.documentClickHandler = null;
                    }
                    if (settings._model.documentKeyHandler) {
                        $(document).off('keydown', settings._model.documentKeyHandler);
                        settings._model.documentKeyHandler = null;
                    }
                    $invoker.trigger($.Event('popupClosed', {target: evt.target, invoker: invoker}));
                    break;

            }
        };

        var buildUI = function (settings) {
            var invoker = settings._model.invoker;
            var animEffect = settings.animEffect;
            var gridColumns = getSetting(settings, 'gridColumns');
            var selectedLang = getSetting(settings, 'selectedLang');
            var $popup = $('<div class="pls-language-container-scrollable"><table class="pls-language-container"><tbody><tr></tr></tbody></table></div>').hide();
            if (animEffect === 'slide') {
                $popup.slideUp(0);
            }
            var $popupTr = $popup.find('tr');
            var $languages = $(invoker).find('li');
            var langPerColumn = Math.round($languages.length / gridColumns);

            var $selectedLang;
            var columnLanguages = [];
            $languages.each(function (index) {
                var $li = $(this);
                var $a = $li.children('a');
                var lang = $a.data('langId');
                if (selectedLang === lang) {
                    $selectedLang = $a.addClass('pls-selected-locale').clone().attr('href', '#');
                }
                columnLanguages.push($li);
                if (((index + 1) % langPerColumn) === 0) {
                    $popupTr.append($('<td></td>').append($('<ul></ul>').append(columnLanguages)));
                    columnLanguages = [];
                }
            });

            if (columnLanguages.length > 0) {
                $popupTr.append($('<td></td>').append($('<ul></ul>').append(columnLanguages)));
                columnLanguages = [];
            }

            if (!$selectedLang) {
                var $firstLi = $languages.first();
                $selectedLang = $firstLi.children('a').addClass('pls-selected-locale').clone().attr('href', '#');
            }
            $(invoker).empty().append($selectedLang).append($popup);
        };

        var openPopup = function ($popup, settings) {
            var animEffect = settings.animEffect;
            var animSpeed = settings.animSpeed;
            if (settings._model.status === 'closed') {
                triggerEvent({type: 'opening', target: $popup.get()}, settings);
                if (animEffect === 'fade') {
                    $popup.fadeIn(animSpeed, function () {
                        triggerEvent({type: 'opened', target: $popup.get()}, settings);
                    });
                } else if (animEffect === 'slide') {
                    $popup.slideDown(animSpeed, function () {
                        triggerEvent({type: 'opened', target: $popup.get()}, settings);
                    });
                }
            }
        };

        var closePopup = function ($popup, settings) {
            var animEffect = getSetting(settings, 'animEffect');
            var animSpeed = getSetting(settings, 'animSpeed');
            if (settings._model.status === 'opened') {
                triggerEvent({type: 'closing', target: $popup.get()}, settings);
                if (animEffect === 'fade') {
                    $popup.fadeOut(animSpeed, function () {
                        triggerEvent({type: 'closed', target: $popup.get()}, settings);
                    });
                } else if (animEffect === 'slide') {
                    $popup.slideUp(animSpeed, function () {
                        triggerEvent({type: 'closed', target: $popup.get()}, settings);
                    });
                }
            }
        };

        var addEventsListeners = function (settings) {
            var invoker = settings._model.invoker;
            var $popup = $(invoker).children('.pls-language-container-scrollable');
            var openMode = getSetting(settings, 'openMode');
            if (openMode === 'click') {
                $(invoker).children('a').on('click', function () {
                    openPopup($popup, settings);
                    return false;
                });
            } else if (openMode === 'hover') {
                var hoverTimeout = getSetting(settings, 'hoverTimeout');
                $(invoker).children('a').hover(function () {
                    clearTimeout(settings._model.closePopupTimeout);
                    settings._model.closePopupTimeout = -1;
                    openPopup($popup, settings);
                }, function () {
                    if (settings._model.closePopupTimeout < 0) {
                        settings._model.closePopupTimeout = setTimeout(function () {
                            closePopup($popup, settings);
                        }, hoverTimeout);
                    }
                });

                $popup.hover(function () {
                    clearTimeout(settings._model.closePopupTimeout);
                    settings._model.closePopupTimeout = -1;
                }, function () {
                    if (settings._model.closePopupTimeout < 0) {
                        settings._model.closePopupTimeout = setTimeout(function () {
                            closePopup($popup, settings);
                        }, hoverTimeout);
                    }
                });
            } else {
                throw 'Open mode \'' + openMode + '\' not supported';
            }
        };

        return this.each(function () {
            var invoker = this;
            var settings = $.extend({
                _model: {
                    invoker: invoker,
                    status: 'closed',
                    closePopupTimeout: -1,
                    documentClickHandler: null,
                    documentKeyHandler: null
                }
            }, $.fn.polyglotLanguageSwitcher.defaults, getOptions(this, options));
            buildUI(settings);
            addEventsListeners(settings);
        });

    };

    $.fn.polyglotLanguageSwitcher.defaults = {
        openMode: 'hover',
        hoverTimeout: 200,
        animSpeed: 200,
        animEffect: 'fade',
        gridColumns: 1,
        selectedLang: function () {
            return $('html').attr('lang');
        }
    }

}(jQuery));