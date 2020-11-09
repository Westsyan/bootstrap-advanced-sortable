(function ($) {
    'use strict';

    let ascIcon = "mdi mdi-sort-ascending";
    let descIcon = "mdi mdi-sort-descending";
    let sortIcon = `<i class="mdi mdi-sort"></i>`
    let closeIcon = `<i class="mdi mdi-close"></i>`

    $.extend($.fn.bootstrapTable.defaults, {
        advancedSortable: false,
    });

    $.extend($.fn.bootstrapTable.columnDefaults = {
        searchType: undefined //["text","num","date","radio","checkbox"]
    })

    let BootstrapTable = $.fn.bootstrapTable.Constructor,
        _onSort = BootstrapTable.prototype.onSort,
        _getCaret = BootstrapTable.prototype.getCaret,
        _initServer = BootstrapTable.prototype.initServer,
        _initHeader = BootstrapTable.prototype.initHeader,
        _initContainer = BootstrapTable.prototype.initContainer;

    BootstrapTable.prototype.initContainer = function () {
        if (this.options.advancedSortable) {
            this.$container = $([
                '<div class="bootstrap-table">',
                '<div class="fixed-table-toolbar"></div>',
                '<div class="advanced-sortavle-toolbar"></div>',
                this.options.paginationVAlign === 'top' || this.options.paginationVAlign === 'both' ?
                    '<div class="fixed-table-pagination" style="clear: both;"></div>' :
                    '',
                '<div class="fixed-table-container">',
                '<div class="fixed-table-header"><table></table></div>',
                '<div class="fixed-table-body">',
                '<div class="fixed-table-loading">',
                this.options.formatLoadingMessage(),
                '</div>',
                '</div>',
                '<div class="fixed-table-footer"><table><tr></tr></table></div>',
                this.options.paginationVAlign === 'bottom' || this.options.paginationVAlign === 'both' ?
                    '<div class="fixed-table-pagination"></div>' :
                    '',
                '</div>',
                '</div>'
            ].join(''));

            this.$container.insertAfter(this.$el);
            this.$tableContainer = this.$container.find('.fixed-table-container');
            this.$tableHeader = this.$container.find('.fixed-table-header');
            this.$tableBody = this.$container.find('.fixed-table-body');
            this.$tableLoading = this.$container.find('.fixed-table-loading');
            this.$tableFooter = this.$container.find('.fixed-table-footer');
            this.$toolbar = this.$container.find('.fixed-table-toolbar');
            this.$pagination = this.$container.find('.fixed-table-pagination');
            this.$advancedSortable = this.$container.find(".advanced-sortavle-toolbar")

            this.$tableBody.append(this.$el);
            this.$container.after('<div class="clearfix"></div>');

            this.$el.addClass(this.options.classes);
            if (this.options.striped) {
                this.$el.addClass('table-striped');
            }
            if ($.inArray('table-no-bordered', this.options.classes.split(' ')) !== -1) {
                this.$tableContainer.addClass('table-no-bordered');
            }
        }else{
            _initContainer.apply(this, Array.prototype.slice.apply(arguments));
        }
    };


    BootstrapTable.prototype.onSort = function (event) {
        if (this.options.advancedSortable) {

            if (this.options.sidePagination === 'server') {
                this.initServer(this.options.silentSort);
                return;
            }

            this.initSort();
            this.updatePagination();
            this.initBody();
        } else {
            _onSort.apply(this, Array.prototype.slice.apply(arguments));
        }
    }

    BootstrapTable.prototype.getCaret = function () {
        if (this.options.advancedSortable) {
            $(".sortable").addClass("my-sortable").removeClass("sortable").removeClass("both");
            let sortName = this.options.sortName;
            let sortOrder = this.options.sortOrder;

            $.each(this.$header.find('th'), function (i, th) {
                let _sortable = $(th).find('.my-sortable');
                let field = $(th).attr("data-field")
                let mdi = sortIcon
                if (field === sortName) {
                    mdi = sortOrder === "asc" ? `<i class="${ascIcon}"></i>` : `<i class="${descIcon}"></i>`
                }
                $($(_sortable).find(".sort-box")).remove();
                $(_sortable).append(`<div class="sort-box">
                                        <button type="button" class="my-table-sort-icon sort-btn">
                                            ${mdi}
                                        </button>                                     
                                     </div>`)
            });
            console.log(this.options.height === undefined)

            if(this.options.height === undefined){

            }else{
                $(".fixed-table-header").css("height","380px")
                $(".fixed-table-body").css("margin-top","-335px")
            }
        } else {
            _getCaret.apply(this, Array.prototype.slice.apply(arguments));
        }
    };

    BootstrapTable.prototype.initServer = function (silent, query, url) {
        if (this.options.advancedSortable) {
            let that = this,
                data = {},
                params = {
                    searchText: this.searchText,
                    sortName: this.options.sortName,
                    sortOrder: this.options.sortOrder
                },
                request;

            if (this.options.pagination) {
                params.pageSize = this.options.pageSize === this.options.formatAllRows() ?
                    this.options.totalRows : this.options.pageSize;
                params.pageNumber = this.options.pageNumber;
            }

            if (!(url || this.options.url) && !this.options.ajax) {
                return;
            }

            if (this.options.queryParamsType === 'limit') {
                params = {
                    search: params.searchText,
                    searchType: this.options.searchType,
                    sort: params.sortName,
                    order: params.sortOrder
                };

                if (this.options.pagination) {
                    params.offset = this.options.pageSize === this.options.formatAllRows() ?
                        0 : this.options.pageSize * (this.options.pageNumber - 1);
                    params.limit = this.options.pageSize === this.options.formatAllRows() ?
                        this.options.totalRows : this.options.pageSize;
                }
            }

            if (!($.isEmptyObject(this.filterColumnsPartial))) {
                params.filter = JSON.stringify(this.filterColumnsPartial, null);
            }

            data = calculateObjectValue(this.options, this.options.queryParams, [params], data);

            $.extend(data, query || {});

            // false to stop request
            if (data === false) {
                return;
            }

            if (!silent) {
                this.$tableLoading.show();
            }
            request = $.extend({}, calculateObjectValue(null, this.options.ajaxOptions), {
                type: this.options.method,
                url: url || this.options.url,
                data: this.options.contentType === 'application/json' && this.options.method === 'post' ?
                    JSON.stringify(data) : data,
                cache: this.options.cache,
                contentType: this.options.contentType,
                dataType: this.options.dataType,
                success: function (res) {
                    res = calculateObjectValue(that.options, that.options.responseHandler, [res], res);

                    that.load(res);
                    that.trigger('load-success', res);
                    if (!silent) that.$tableLoading.hide();
                },
                error: function (res) {
                    that.trigger('load-error', res.status, res);
                    if (!silent) that.$tableLoading.hide();
                }
            });

            if (this.options.ajax) {
                calculateObjectValue(this, this.options.ajax, [request], null);
            } else {
                if (this._xhr && this._xhr.readyState !== 4) {
                    this._xhr.abort();
                }
                this._xhr = $.ajax(request);
            }
        } else {
            _initServer.apply(this, Array.prototype.slice.apply(arguments));
        }
    };

    let calculateObjectValue = function (self, name, args, defaultValue) {
        let func = name;
        if (typeof name === 'string') {
            // support obj.func1.func2
            let names = name.split('.');

            if (names.length > 1) {
                func = window;
                $.each(names, function (i, f) {
                    func = func[f];
                });
            } else {
                func = window[name];
            }
        }
        if (typeof func === 'object') {
            return func;
        }
        if (typeof func === 'function') {
            return func.apply(self, args || []);
        }
        if (!func && typeof name === 'string' && sprintf.apply(this, [name].concat(args))) {
            return sprintf.apply(this, [name].concat(args));
        }
        return defaultValue;
    };

    let getSearchData = function(data,search){
        let searchData =[];
        $.each(data, (i, v) => {
            let isValid = true;
            $.each(search, (key, maps) => {
                let st = maps["searchType"];
                if (st === "text") {
                    let fieldData = maps["data"].split(" ");
                    $.each(fieldData, (f, d) => {
                        isValid = isValid && v[key].indexOf(d) !== -1
                    })
                } else if (st === "radio") {
                    isValid = isValid && v[key] == maps["data"]
                } else if (st === "checkbox") {
                    let fieldData = maps["data"];
                    $.each(fieldData, (f, d) => {
                        isValid = isValid && v[key] == d
                    })
                } else if (st === "num") {
                    let min = maps.data["min"].replace(/,/g,'');
                    let max = maps.data["max"].replace(/,/g,'');
                    if ($.isNumeric(min) && $.isNumeric(max)) {
                        isValid = isValid && (Number(v[key]) >= Number(min) && Number(v[key]) <= Number(max))
                    } else if ($.isNumeric(min) && !$.isNumeric(max)) {
                        isValid = isValid && (Number(v[key]) >= Number(min))
                    } else if (!$.isNumeric(min) && $.isNumeric(max)) {
                        isValid = isValid && (Number(v[key]) <= Number(max))
                    } else {
                        isValid = false
                    }
                } else if (st === "date") {
                    let min = maps.data["min"];
                    let max = maps.data["max"];
                    let minDate = new Date(maps.data["min"]);
                    let maxDate = new Date(maps.data["max"]);
                    let date = new Date(v[key]);
                    if (min !== "" && max !== "") {
                        isValid = isValid && (date <= maxDate && date >= minDate)
                    } else if (min === "" && max !== "") {
                        isValid = isValid && (date <= maxDate)
                    } else if (min !== "" && max === "") {
                        isValid = isValid && (date >= minDate)
                    } else {
                        isValid = true;
                    }
                }
            })
            if (isValid) {
                searchData.push(v);
            }
        })
        return searchData;
    }

    let sprintf = function (str) {
        let args = arguments,
            flag = true,
            i = 1;

        str = str.replace(/%s/g, function () {
            let arg = args[i++];

            if (typeof arg === 'undefined') {
                flag = false;
                return '';
            }
            return arg;
        });
        return flag ? str : '';
    };

    BootstrapTable.prototype.initHeader = function () {
        if (this.options.advancedSortable) {

            var that = this,
                visibleColumns = {},
                html = [];

            this.header = {
                fields: [],
                styles: [],
                classes: [],
                formatters: [],
                events: [],
                sorters: [],
                sortNames: [],
                cellStyles: [],
                searchables: []
            };

            $.each(this.options.columns, function (i, columns) {
                html.push('<tr>');

                if (i === 0 && !that.options.cardView && that.options.detailView) {
                    html.push(sprintf('<th class="detail" rowspan="%s"><div class="fht-cell"></div></th>',
                        that.options.columns.length));
                }

                $.each(columns, function (j, column) {
                    var text = '',
                        halign = '', // header align style
                        align = '', // body align style
                        style = '',
                        class_ = sprintf(' class="%s"', column['class']),
                        order = that.options.sortOrder || column.order,
                        unitWidth = 'px',
                        width = column.width;

                    if (column.width !== undefined && (!that.options.cardView)) {
                        if (typeof column.width === 'string') {
                            if (column.width.indexOf('%') !== -1) {
                                unitWidth = '%';
                            }
                        }
                    }
                    if (column.width && typeof column.width === 'string') {
                        width = column.width.replace('%', '').replace('px', '');
                    }

                    halign = sprintf('text-align: %s; ', column.halign ? column.halign : column.align);
                    align = sprintf('text-align: %s; ', column.align);
                    style = sprintf('vertical-align: %s; ', column.valign);
                    style += sprintf('width: %s; ', (column.checkbox || column.radio) && !width ?
                        '36px' : (width ? width + unitWidth : undefined));

                    if (typeof column.fieldIndex !== 'undefined') {
                        that.header.fields[column.fieldIndex] = column.field;
                        that.header.styles[column.fieldIndex] = align + style;
                        that.header.classes[column.fieldIndex] = class_;
                        that.header.formatters[column.fieldIndex] = column.formatter;
                        that.header.events[column.fieldIndex] = column.events;
                        that.header.sorters[column.fieldIndex] = column.sorter;
                        that.header.sortNames[column.fieldIndex] = column.sortName;
                        that.header.cellStyles[column.fieldIndex] = column.cellStyle;
                        that.header.searchables[column.fieldIndex] = column.searchable;

                        if (!column.visible) {
                            return;
                        }

                        if (that.options.cardView && (!column.cardVisible)) {
                            return;
                        }

                        visibleColumns[column.field] = column;
                    }

                    html.push('<th' + sprintf(' title="%s"', column.titleTooltip),
                        column.checkbox || column.radio ?
                            sprintf(' class="bs-checkbox %s"', column['class'] || '') :
                            class_,
                        sprintf(' style="%s"', halign + style),
                        sprintf(' rowspan="%s"', column.rowspan),
                        sprintf(' colspan="%s"', column.colspan),
                        sprintf(' data-field="%s"', column.field),
                        '>');

                    html.push(sprintf('<div class="th-inner %s">', that.options.sortable && column.sortable ?
                        'sortable both' : ''));

                    text = that.options.escape ? escapeHTML(column.title) : column.title;

                    if (column.checkbox) {
                        if (!that.options.singleSelect && that.options.checkboxHeader) {
                            text = '<input name="btSelectAll" type="checkbox" />';
                        }
                        that.header.stateField = column.field;
                    }
                    if (column.radio) {
                        text = '';
                        that.header.stateField = column.field;
                        that.options.singleSelect = true;
                    }

                    html.push(text);
                    html.push('</div>');
                    html.push('<div class="fht-cell"></div>');
                    html.push('</div>');
                    html.push('</th>');
                });
                html.push('</tr>');
            });

            this.$header.html(html.join(''));
            this.$header.find('th[data-field]').each(function (i) {
                $(this).data(visibleColumns[$(this).data('field')]);
            });


            that.$advancedSortable.html("<div class='sort-toolbar'>Sort ： <span class='sort-btn-toolbar'></span></div>" +
                "<div class='search-toolbar'>Filter ：  <span class='search-btn-toolbar'></span></div>");

            let _searchType = {};
            let _columns = {}
            $.each(that.columns, (i, v) => {
                _searchType[v.field] = v.searchType;
                _columns[v.field] = v;
            })

            this.$container.off('click', '.sort-btn').on('click', '.sort-btn', function (event) {
                if (that.options.sortable) {
                    let sort_box = $(this).parents(".sort-box")
                    let field = $(this).parents("th").attr("data-field");
                    let sort_model =  sort_box.find(".sort-model")




                    if (sort_model.length === 0) {
                        let height = $(this).height() + 5;


                        let search = that.searchText !== undefined ? JSON.parse(that.searchText) : {};

                        let _searchText =  search[field] !== undefined?search[field].data : "";


                        let searchT = _searchType[field];


                        let buttonHtml = `<button type="button" class="btn-sort btn-sort-danger">Cancel</button>
                                            <button type="button" class="btn-sort btn-sort-primary">Search</button>`;
                        let sortHtml = ` <ul class="nav-sort">
                                            <li><a class="sort-asc" href="#"><i class="${ascIcon}"></i> Ascending</a></li>
                                            <li><a class="sort-desc" href="#"><i class="${descIcon}"></i> Descending</a></li>
                                        </ul>`;

                        if (searchT === "num") {
                            let html = `<div class="sort-model" style="margin-top: ${height}px;">
                                    <form>
                                        ${sortHtml}
                                        <div class="my-multiple-search">
                                            <input type="text" class="sort-input" id="${field}-search-min"  placeholder="最小值">
                                            <input type="text" class="sort-input" id="${field}-search-max"  placeholder="最大值" style="margin-top: 10px">
                                            ${buttonHtml}
                                        </div>
                                    </form>
                                </div>`
                            sort_box.append(html);

                            let min = _searchText !== "" ? _searchText["min"] : "";
                            let max = _searchText !== "" ? _searchText["max"] : "";
                            $("#" + field + "-search-min").val(min);
                            $("#" + field + "-search-max").val(max);

                        } else if (searchT === "date") {
                            let html = `<div class="sort-model" style="margin-top: ${height}px;">
                                    <form>
                                         ${sortHtml}
                                        <div class="my-multiple-search">
                                            <input type="date" class="sort-input" id="${field}-search-min" autoComplete="off" placeholder="最小值">
                                            <input type="date" class="sort-input" id="${field}-search-max" autoComplete="off" placeholder="最大值" style="margin-top: 10px">
                                            ${buttonHtml}
                                        </div>
                                    </form>
                                </div>`
                            sort_box.append(html);

                            let min = _searchText !== "" ? _searchText["min"] : "";
                            let max = _searchText !== "" ? _searchText["max"] : "";
                            $("#" + field + "-search-min").val(min);
                            $("#" + field + "-search-max").val(max);
                        } else if (searchT === "radio") {
                            let info = _columns[field]
                            let html = `<div class="sort-model" style="margin-top: ${height}px;">
                                    <form>
                                        ${sortHtml}
                                        <div class="my-multiple-search">
                                            <select id="${field}-search">
                                              
                                            </select>
                                            ${buttonHtml}
                                        </div>
                                    </form>
                                </div>`
                            sort_box.append(html);
                            if(_searchText === "") _searchText = info["searchSelect"][0];
                            $("#" + field + "-search").select2({
                                data: info["searchSelect"]
                            }).val(_searchText).select2({width: '178'})

                        } else if (searchT === "checkbox") {
                            let info = _columns[field]
                            let html = `<div class="sort-model" style="margin-top: ${height}px;">
                                    <form>
                                         ${sortHtml}
                                        <div class="my-multiple-search">
                                            <select id="${field}-search" multiple >
                                        
                                            </select>
                                            ${buttonHtml}
                                        </div>
                                    </form>
                                </div>`
                            sort_box.append(html);
                            $("#" + field + "-search").select2({
                                data: info["searchSelect"]
                            }).val(_searchText).select2({width: '178'})


/*                            $("#" + field + "-search").on('select2:close', function (evt) {
                                var uldiv = $(this).siblings('span.select2').find('ul')
                                var count = $(this).select2('data').length
                                if (count == 0) {
                                    uldiv.html("")
                                } else {
                                    uldiv.html("<li>" + count + " items selected</li>")
                                    //uldiv.html("<li>已选中 " + count + " 项</li>")
                                }
                            })*/

                        } else if (searchT === "text") {
                            let html = `<div class="sort-model" style="margin-top: ${height}px;">
                                    <form>
                                         ${sortHtml}
                                        <div class="my-multiple-search">
                                            <input type="text" class="sort-input" id="${field}-search" autoComplete="off">
                                            ${buttonHtml}
                                        </div>
                                    </form>
                                </div>`
                            sort_box.append(html);
                            $("#" + field + "-search").val(_searchText);
                        } else {
                            let html = `<div class="sort-model" style="margin-top: ${height}px;">
                                    <form>
                                         ${sortHtml}
                                    </form>
                                </div>`
                            sort_box.append(html);
                        }
                        sort_box.find(".sort-model").hide();

                        sort_model =  sort_box.find(".sort-model")

                        let leftWidth = sort_box[0].offsetLeft;

                        if(leftWidth < 250){
                            sort_model.addClass("sort-model-left")
                        }else{
                            sort_model.addClass("sort-model-right")
                        }




                    }


                    if(sort_box.find(".sort-model").is(":hidden")){
                        $(".sort-model").hide();
                        sort_box.find(".sort-model").show();
                    }else{
                        sort_box.find(".sort-model").hide();
                    }



                    //$(this).after(html);
                    //$(this).next().show();
                    //that.onSort(event);
                }
            });

            this.$container.off('click', '.sort-asc').on('click', '.sort-asc', function (event) {
                let field = $(this).parents("th").attr("data-field");
                that.options.sortName = field;
                that.options.sortOrder = "asc";
                let title = ""
                $.each(that.columns, (i, v) => {
                    if (v.field === field) {
                        title = v.title
                    }
                })
                let btn = `<buuton class="btn-sort btn-remove-sort btn-sort-position" value="${field}">${title} Asc ${closeIcon}</buuton>`
                that.$advancedSortable.find(".sort-btn-toolbar").html(btn);
               // $("#toolbar").find(".sort-btn-toolbar").html(btn);
                $(".sort-toolbar").show();
                that.onSort(event)
            })

            this.$container.off('click', '.sort-desc').on('click', '.sort-desc', function (event) {
                let field = $(this).parents("th").attr("data-field");
                that.options.sortName = field;
                that.options.sortOrder = "desc";
                let title = ""
                $.each(that.columns, (i, v) => {
                    if (v.field === field) {
                        title = v.title
                    }
                })
                let btn = `<buuton class="btn-sort btn-remove-sort btn-sort-position" value="${field}">${title} Desc  ${closeIcon}</buuton>`
                that.$advancedSortable.find(".sort-btn-toolbar").html(btn);
             //   $("#toolbar").find(".sort-btn-toolbar").html(btn);
                $(".sort-toolbar").show();
                that.onSort(event)
            })

            this.$container.off('click','.btn-remove-sort').on('click','.btn-remove-sort',function (event) {
                that.options.sortName = undefined;
                that.options.sortOrder = "asc";
                $(this).remove();
                $(".sort-toolbar").hide();
                that.onSort(event)
            })

            this.$container.off('click', '.btn-sort-primary').on('click', '.btn-sort-primary', function (event) {
                let field = $(this).parents("th").attr("data-field");
                let search = that.searchText !== undefined ? JSON.parse(that.searchText) : {};
                let searchType = _searchType[field];
                let value = {
                    field: field,
                    searchType: searchType
                }

                if (searchType === undefined || searchType === "radio" || searchType === "checkbox" || searchType === "text") {
                    value["data"] = $("#" + field + "-search").val()
                } else if (searchType === "date" || searchType === "num") {
                    value["data"] = {
                        min: $("#" + field + "-search-min").val(),
                        max: $("#" + field + "-search-max").val()
                    }
                }

                search[field] = value;

                let searchToolbar = ""
                $.each(search,(f,json)=>{
                    let title = _columns[f].title;
                    let st = _columns[f].searchType
                    let position = "";
                    if(st=== "num" || st ==="date"){
                        let js = json["data"];
                        let max = js.max;
                        let min = js.min;
                        position = "Min : " + min + ",Max : " +max
                    }else{
                        position = json["data"];
                    }
                    let btn = `<buuton class="btn-sort btn-remove-search btn-sort-position" value="${f}">${title} : ${position}   ${closeIcon}</buuton>`
                    searchToolbar += btn
                })
                that.$advancedSortable.find(".search-btn-toolbar").html(searchToolbar);
            //    $("#toolbar").find(".search-btn-toolbar").html(searchToolbar);
                $(".search-toolbar").show();
                that.searchText = JSON.stringify(search);
                if (that.options.sidePagination !== 'server') {
                    let data = that.options.data;
                    that.data =  getSearchData(data,search);
                }
                that.onSort(event)
            })

            this.$container.off('click', '.btn-sort-danger').on('click', '.btn-sort-danger', function (event) {
                $(".sort-model").hide()
            })

            this.$container.off('click', '.btn-remove-search').on('click', '.btn-remove-search', function (event) {
                let field = $(this).attr("value");
                let data = that.options.data;
                let search = that.searchText !== undefined ? JSON.parse(that.searchText) : {};
                delete search[field];
                that.searchText = JSON.stringify(search);
                if (that.options.sidePagination !== 'server') {
                    let data = that.options.data;
                    that.data = getSearchData(data,search);
                }
                $(this).remove();
                if(that.searchText === "{}"){
                    $(".search-toolbar").hide();
                }
                that.onSort(event)
            })

            this.$header.children().children().off('keypress').on('keypress', function (event) {
                if (that.options.sortable && $(this).data().sortable) {
                    var code = event.keyCode || event.which;
                    if (code == 13) { //Enter keycode
                        that.onSort(event);
                    }
                }
            });

            $(window).off('resize.bootstrap-table');
            if (!this.options.showHeader || this.options.cardView) {
                this.$header.hide();
                this.$tableHeader.hide();
                this.$tableLoading.css('top', 0);
            } else {
                this.$header.show();
                this.$tableHeader.show();
                this.$tableLoading.css('top', this.$header.outerHeight() + 1);
                // Assign the correct sortable arrow
                this.getCaret();
                $(window).on('resize.bootstrap-table', $.proxy(this.resetWidth, this));
            }

            this.$selectAll = this.$header.find('[name="btSelectAll"]');
            this.$selectAll.off('click').on('click', function () {
                var checked = $(this).prop('checked');
                that[checked ? 'checkAll' : 'uncheckAll']();
                that.updateSelected();
            });
        } else {
            _initHeader.apply(this, Array.prototype.slice.apply(arguments));
        }
    };

})(jQuery);