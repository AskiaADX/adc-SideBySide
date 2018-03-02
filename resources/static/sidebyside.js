(function () {
    var msEdgeMatch = /Edge\/([0-9]+)/i.exec(navigator.userAgent);
    if (msEdgeMatch) document.documentMode = parseInt(msEdgeMatch[1]);
})();
(function () {

    /**
   * Add event listener in DOMElement
   *
   * @param {HTMLElement} obj HTMLElement which should be listen
   * @param {String} type Type of the event to listen
   * @param {Function} fn Callback function
   */
    function addEvent (obj, type, fn) {
        if (typeof obj.addEventListener === 'function') {
            obj.addEventListener(type, fn, true);
        } else if (obj.attachEvent) {
            obj['e' + type + fn] = fn;
            obj[type + fn] = function () {
                obj['e' + type + fn].call(obj, window.event);
            }
            obj.attachEvent('on' + type, obj[type + fn]);
        }
    }

    /**
   * Add class in DOMElement
   *
   * @param {HTMLElement} obj HTMLElement where the class should be added
   * @param {String} clsName Name of the class to add
   */
    function addClass (obj, clsName) {
        if (obj.classList)      {
            obj.classList.add(clsName); 
        }    else            {
            obj.className += ' ' + clsName; 
        }
    }

    /**
   * Remove class in DOMElement
   *
   * @param {HTMLElement} obj HTMLElement where the class should be removed
   * @param {String} clsName Name of the class to remove
   */
    function removeClass (obj, clsName) {
        if (obj.classList)      {
            obj.classList.remove(clsName);
        }    else            {
            obj.className = obj.className.replace(new RegExp('(^|\\b)' + clsName.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }

    /**
   * Manage the exclusive responses or single question
   *
   * @param {HTMLElement} obj HTMLElement (input) changed
   */
    function manageExclusive (obj) {
        var responsesContainer = obj.parentNode.parentNode;
        for (var i = 0; j = responsesContainer.children.length, i < j; i++) {
            if ((responsesContainer.children[i].children[0] !== obj) &&
                (responsesContainer.children[i].className.indexOf('selected') >= 0) &&
                (obj.className.indexOf('askia-exclusive') >= 0 ||
                 obj.type === 'radio' ||
                 responsesContainer.children[i].children[0].className.indexOf('askia-exclusive') >= 0)) {
                removeClass(responsesContainer.children[i], 'selected');
                if (obj.type === 'checkbox') {
                    document.getElementById(responsesContainer.children[i].children[0].attributes.id.value).checked = false;
                }
            }
        }

    }

    /**
   * Manage the change event on input radio and checkbox
   *
   * @param {Object} event Change event of the input radio and checkbox
   */
    function onChange (event, that) {
        var el = event.target || event.srcElement;
        if (el.nodeName === 'INPUT' && (el.type === 'radio' || el.type === 'checkbox')) {
            if (el.checked) {
                addClass(el.parentNode, 'selected');
            } else if (!el.checked) {
                removeClass(el.parentNode, 'selected');
            }
            manageExclusive(el);
        }
    }

    /**
   * Manage the input event on input numbers - live sum
   *
   * @param {Object} event Input event of the input numbers
   */
    function onInputNumbers (event, that) {
        var el = event.target || event.srcElement;
        var split = el.className.split('_')
        var maxLimit = that.maxLimit[parseInt(split[2], 10) - 1];
        var decimals = that.decimals[parseInt(split[2], 10) - 1] || 0;
        var sum = 0;
        var inputNumbers = document.querySelectorAll('#adc_' + that.instanceId + ' .' + el.className);
        for (var i = 0; i < inputNumbers.length; i++) {
            sum += parseFloat(inputNumbers[i].value) || 0;
        }
        var results = document.querySelectorAll('#adc_' + that.instanceId + ' .result_' + split[1] + '_' + split[2]);
        var resultSum = document.querySelectorAll('#adc_' + that.instanceId + ' .sum_' + split[1] + '_' + split[2]);
        for (var j = 0; j < results.length; j++) {
            // Update the live sum result
            if (that.showTotal === 1) {
                results[j].innerHTML = sum.toLocaleString(undefined, {minimumFractionDigits: decimals,maximumFractionDigits: decimals});
            } else if (that.showTotal === 2) {
                if (isNaN(maxLimit) === false) {
                    results[j].innerHTML = (maxLimit  - sum).toLocaleString(undefined, {minimumFractionDigits: decimals,maximumFractionDigits: decimals});  
                } else {
                    results[j].innerHTML = (sum).toLocaleString(undefined, {minimumFractionDigits: decimals,maximumFractionDigits: decimals});
                }
            }
            // Update the class if equal or above limit
            if (isNaN(maxLimit) === false && (that.showTotal === 1 || that.showTotal === 2)) {
                if (sum === maxLimit) {
                    removeClass(resultSum[j], 'aboveLimit');
                    addClass(resultSum[j], 'equalLimit');
                } else if (sum > maxLimit) {
                    removeClass(resultSum[j], 'equalLimit');
                    addClass(resultSum[j], 'aboveLimit');
                } else {
                    removeClass(resultSum[j], 'equalLimit');
                    removeClass(resultSum[j], 'aboveLimit');
                }
            }
        }
    }

     /**
   * Manage the input event on input ranges - live sum
   *
   * @param {Object} event Input event of the input ranges
   */
    function onInputRanges (event, that) {
        var el = event.target || event.srcElement;
        var split = el.className.split('_')
        var suffix = that.suffixes[parseInt(split[2], 10) - 1];
        var decimals = that.decimals[parseInt(split[2], 10) - 1] || 0;
        var inputNumber = document.querySelector('#adc_' + that.instanceId + ' #askia-input-number' + el.id.split('_')[1]);
        inputNumber.value = el.value;
        el.parentElement.nextElementSibling.innerHTML = parseFloat(el.value).toLocaleString(undefined, {minimumFractionDigits: decimals,maximumFractionDigits: decimals}) + suffix;
        addClass(el,'selected');
        document.querySelector('#adc_' + that.instanceId + ' #' + el.id + ' + .preBar').style.width = widthRange(el) + 'px';
        if ('createEvent' in document) {
            var evt = document.createEvent('HTMLEvents');
            evt.initEvent('input', false, true);
            inputNumber.dispatchEvent(evt);
        } else {
            inputNumber.fireEvent('oninput');
        }
    }
    
    /**
   * Return width of the left side of the input range
   *
   * @param {Object} inputRange input range
   */
    function widthRange (inputRange) {
        var min = (inputRange.min) ? parseInt(inputRange.min, 10) : 0;
        var max = (inputRange.max) ? parseInt(inputRange.max, 10) : 100;
        var range = max - min;
        var w = parseInt(inputRange.clientWidth, 10);
        var t = ~~(w * (parseInt(inputRange.value, 10) - min) / range);
        
        return (((t / w) * 100) < 16 && ((t / w) * 100) > 0) ? t + 4 : t;
    }

    
    /**
  * Calculate the offsetTop
  *
  * @param {HTMLElements} elem HTMLElement
  */
    function calcOffsetTop (elem) {
        if (!elem) elem = this;
        var y = elem.offsetTop;
        while (elem = elem.offsetParent) {
            y += elem.offsetTop;
        }
        return y;
    }

    /**
   * Make the header always visible and fixed when scrolling
   *
   * @param {HTMLElements} el HTMLElement which should be always visible - the header
   * @param {Object} options Options of the ResponsiveTable
   */
    function headerFix (el, opt) {
        if (!opt.headerFixed) return;

        var offsetHeight = document.getElementById('adc_' + opt.instanceId).offsetHeight || document.getElementById('adc_' + opt.instanceId).height;
        var offsetHeightThead = document.querySelector('#adc_' + opt.instanceId + ' thead').offsetHeight || document.querySelector('#adc_' + opt.instanceId + ' thead').height;
        var offsetTop = calcOffsetTop(document.getElementById('adc_' + opt.instanceId));
        var scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
        var top = 0;
        if ((scrollTop >= offsetTop) && (scrollTop <= (offsetTop + offsetHeight - (offsetHeightThead + 10)))) {
            top = scrollTop - (offsetTop + 2);
        } else {
            top = 0;
        }

        var translate = 'translateY(' + top + 'px)';
        for (var i = 0; j = el.length, i < j; i++) {
            if (document.documentMode < 12) {
                el[i].style.msTransform = translate;
            } else {
                el[i].style.WebkitTransform = translate;
                el[i].style.WebkitTransition = 'all 0.2s';
                el[i].style.MozTransform = translate;
                el[i].style.MozTransition = 'all 0.2s';
                el[i].style.transform = translate;
                el[i].style.transition = 'all 0.2s';
            }
        }
    }

    /**
   * Add zoom to images present in the loop responses
   *
   * @param {string} strId Id of the zoom
   */
    function simplboxConstructorCall(strId) {
        var preLoadIconOn = function () {
            var newE = document.createElement("div"),
                newB = document.createElement("div");
            newE.setAttribute("id", "simplbox-loading");
            newE.appendChild(newB);
            document.body.appendChild(newE);
        },
            preLoadIconOff = function () {
                var elE = document.getElementById("simplbox-loading");
                elE.parentNode.removeChild(elE);
            },
            overlayOn = function () {
                var newA = document.createElement("div");
                newA.setAttribute("id", "simplbox-overlay");
                document.body.appendChild(newA);
            },
            overlayOff = function () {
                var elA = document.getElementById("simplbox-overlay");
                elA.parentNode.removeChild(elA);
            };
        var img = new SimplBox(document.querySelectorAll("[data-simplbox='" + strId + "']"), {
            quitOnImageClick: true,
            quitOnDocumentClick: false,
            onStart: overlayOn,
            onEnd: overlayOff,
            onImageLoadStart: preLoadIconOn,
            onImageLoadEnd: preLoadIconOff
        });
        img.init();
    }

    /**
   * Reset the combo box when using ranking
   *
   * @param {HTMLElements} inputSelect Select to reset
   */
    function resetComboBox(inputSelects) {
        for(var i = 0; i < inputSelects.length; i++) {
            var optList = inputSelects[i].getElementsByTagName("option");
            for( var j = 0; j < optList.length; j++) {
                optList[j].disabled = false;
            }
        }
    }

    function updateComboBox(event, that) {
        var el = event.target || event.srcElement;
        var inputSelect = document.querySelectorAll("." + el.className);
        resetComboBox(inputSelect);
        var selectedIndex = 0;
        for (i = 0; i < inputSelect.length; i++) {
            selectedIndex = inputSelect[i].selectedIndex;
            if (selectedIndex !== 0) {
                for (j = i + 1; j < inputSelect.length; j++) {
                    var optionList = inputSelect[j].getElementsByTagName("option");
                    if (inputSelect[j].selectedIndex === selectedIndex) inputSelect[j].selectedIndex = 0;
                    optionList[selectedIndex].disabled = true;
                }
            }
        }
    }

    /**
   * Creates a new instance of the SideBySide
   *
   * @param {Object} options Options of the SideBySide
   * @param {String} options.instanceId=1 Id of the ADC instance
   */
    function SideBySide (options) {
        this.options = options;
        this.instanceId = options.instanceId || 1;
        this.showTotal = options.showTotal || 0;
        this.questions = options.questions || [];
        this.maxLimit = options.maxLimit || [];
        this.headerFixed = options.headerFixed;
        this.rankingBox = options.rankingBox || [];
        this.suffixes = options.suffixes || [];
        this.decimals = options.decimals || [];

        var radios = document.querySelectorAll('#adc_' + this.instanceId + ' input[type="radio"]');
        var checkboxes = document.querySelectorAll('#adc_' + this.instanceId + ' input[type="checkbox"]');
        var inputNumbers = document.querySelectorAll('#adc_' + this.instanceId + ' input[type="number"]');
        var inputRanges = document.querySelectorAll('#adc_' + this.instanceId + ' input[type="range"]');

        // Change event on input radio
        for (var i = 0; i < radios.length; i++) {
            addEvent(radios[i], 'change', 
                     (function (passedInElement) {
                return function (e) {
                    onChange(e, passedInElement); 
                };
            }(this)));
        }

        // Change event on input checkbox
        for (var j = 0; j < checkboxes.length; j++) {
            addEvent(checkboxes[j], 'change', 
                     (function (passedInElement) {
                return function (e) {
                    onChange(e, passedInElement); 
                };
            }(this)));
        }

        // Input event (live sum) on input number
        for (var k = 0; k < inputNumbers.length; k++) {
            addEvent(inputNumbers[k], 'input', 
                     (function (passedInElement) {
                return function (e) {
                    onInputNumbers(e, passedInElement); 
                };
            }(this)));
            if ('createEvent' in document) {
                var evt = document.createEvent('HTMLEvents');
                evt.initEvent('input', false, true);
                inputNumbers[k].dispatchEvent(evt);
            } else {
                inputNumbers[k].fireEvent('oninput');
            }
        }
        
        // Change event (live sum) on input range
        for (var l = 0; l < inputRanges.length; l++) {
            addEvent(inputRanges[l], 'change', 
                     (function (passedInElement) {
                return function (e) {
                    onInputRanges(e, passedInElement); 
                };
            }(this)));
            document.querySelector('#adc_' + this.instanceId + ' #' + inputRanges[l].id + ' + .preBar').style.width = widthRange(inputRanges[l]) + 'px';
        }
        
        // Input event (live sum) on input range
        for (var l1 = 0; l1 < inputRanges.length; l1++) {
            addEvent(inputRanges[l1], 'input', 
                     (function (passedInElement) {
                return function (e) {
                    onInputRanges(e, passedInElement); 
                };
            }(this)));
        }
        
        // Resize event on input range
        window.addEventListener("resize", function() {
            for (var l2 = 0; l2 < inputRanges.length; l2++) {
                document.querySelector('#adc_' + options.instanceId + ' #' + inputRanges[l2].id + ' + .preBar').style.width = widthRange(inputRanges[l2]) + 'px';
            }
        });
        
        for(var i1 = 0; i1 < this.rankingBox.length ; i1++){
            if (this.rankingBox[i1]) {
                var inputElt = document.querySelectorAll(".select_"+ this.instanceId + "_" + (i1+1));
                for(var j1 = 0; j1 < inputElt.length; j1++) {
                    addEvent(inputElt[j1], 'change', 
                             (function (passedInElement) {
                        return function (e) {
                            updateComboBox(e, passedInElement); 
                        };
                    }(this)));
                    if ('createEvent' in document) {
                        var evt = document.createEvent('HTMLEvents');
                        evt.initEvent('change', false, true);
                        inputElt[j1].dispatchEvent(evt);
                    } else {
                        inputElt[j1].fireEvent('onchange');
                    }
                }
            }   
        }

        var ths = document.querySelectorAll('#adc_' + options.instanceId + ' thead th');
        window.addEventListener('scroll', function () {
            headerFix(ths, options);
        });

        var zooms = document.getElementById('adc_' + this.instanceId).querySelectorAll('tbody tr');
        for (var l1 = 0, k1 = zooms.length; l1 < k1; l1++) {
            simplboxConstructorCall(zooms[l1].getAttribute('data-id'));
        }
    }

    /**
   * Attach the ResponsiveTable to the window object
   */
    window.SideBySide = SideBySide;

}());
