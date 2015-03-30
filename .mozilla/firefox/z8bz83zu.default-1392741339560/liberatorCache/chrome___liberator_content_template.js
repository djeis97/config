// Copyright (c) 2006-2009 by Kris Maglione <maglione.k at Gmail>
//
// This work is licensed for reuse under an MIT license. Details are
// given in the License.txt file included with this file.


/** @scope modules */

const Template = Module("template", {
    add: function add(a, b) a + b,
    join: function join(c) function (a, b) a + c + b,

    map: function map(iter, func, sep, interruptable) {
        return this.map2(xml, iter, func, sep, interruptable);
    },
    map2: function map(tag, iter, func, sep, interruptable) {
        if (iter.length) // FIXME: Kludge?
            iter = util.Array.itervalues(iter);
        let ret = tag({raw: [""],cooked: [""]}, []);
        let n = 0;
        var op = tag["+="] || tag["+"] ||function (lhs, rhs) tag({raw: ["", "", ""],cooked: ["", "", ""]}, [(lhs), (rhs)]);
        for each (let i in Iterator(iter)) {
            let val = func(i);
            if (val == undefined || (tag.isEmpty && tag.isEmpty(val)))
                continue;
            if (sep && n++)
                ret = op(ret, sep);
            if (interruptable && n % interruptable == 0)
                liberator.threadYield(true, true);
            ret = op(ret, val);
        }
        return ret;
    },

    maybeXML: function maybeXML(val) {
        if (typeof val == "xml" || val instanceof TemplateSupportsXML)
            return val;

        try {
            return xml.raw({raw: ["", ""],cooked: ["", ""]}, [(val)]);
        }
        catch (e) {}
        return xml({raw: ["", ""],cooked: ["", ""]}, [(val)]);
    },

    completionRow: function completionRow(item, highlightGroup) {
        if (typeof icon == "function")
            icon = icon();

        if (highlightGroup) {
            var text = item[0] || "";
            var desc = item[1] || "";
        }
        else {
            var text = this.process[0].call(this, item, item.text);
            var desc = this.process[1].call(this, item, item.description);
        }

        return xml({raw: ["<div highlight=", " style=\"white-space: nowrap\">\n\
                   <!-- The non-breaking spaces prevent empty elements\n\
                      - from pushing the baseline down and enlarging\n\
                      - the row.\n\
                      -->\n\
                   <li highlight=\"CompResult\">", "&#160;</li>\n\
                   <li highlight=\"CompDesc\">", "&#160;</li>\n\
               </div>"],cooked: ["<div highlight=", " style=\"white-space: nowrap\">                   <!-- The non-breaking spaces prevent empty elements                      - from pushing the baseline down and enlarging                      - the row.                      -->                   <li highlight=\"CompResult\">", "&#160;</li>                   <li highlight=\"CompDesc\">", "&#160;</li>               </div>"]}, [(highlightGroup || "CompItem"), (text), (desc)]);
    },

    bookmarkDescription: function (item, text, filter)
    xml({raw: ["\n\
        <a href=", " highlight=\"URL\">", "</a>&#160;\n\
        ", "\n\
    "],cooked: ["        <a href=", " highlight=\"URL\">", "</a>&#160;        ", "    "]}, [(item.item.url), (template.highlightFilter(text || "", filter)), (
            !(item.extra && item.extra.length) ? "" :
            xml({raw: ["<span class=\"extra-info\">\n\
                (", ")\n\
            </span>"],cooked: ["<span class=\"extra-info\">                (", ")            </span>"]}, [(
                    template.map2(xml, item.extra,
                    function (e) xml({raw: ["", ": <span highlight=", ">", "</span>"],cooked: ["", ": <span highlight=", ">", "</span>"]}, [(e[0]), (e[2]), (e[1])]),
                    xml.cdata({raw: ["&#xa0;"],cooked: ["&#xa0;"]}, [])/* Non-breaking space */)
                )])
        )]),

    icon: function (item, text) {
        return xml({raw: ["<span highlight=\"CompIcon\">", "</span><span class=\"td-strut\"/>", ""],cooked: ["<span highlight=\"CompIcon\">", "</span><span class=\"td-strut\"/>", ""]}, [(item.icon ? xml({raw: ["<img src=", "/>"],cooked: ["<img src=", "/>"]}, [(item.icon)]) : ""), (text)]);
    },

    filter: function (str) xml({raw: ["<span highlight=\"Filter\">", "</span>"],cooked: ["<span highlight=\"Filter\">", "</span>"]}, [(str)]),

    // if "processStrings" is true, any passed strings will be surrounded by " and
    // any line breaks are displayed as \n
    highlight: function highlight(arg, processStrings, clip) {
        // some objects like window.JSON or getBrowsers()._browsers need the try/catch
        try {
            let str = clip ? util.clip(String(arg), clip) : String(arg);
            switch (arg == null ? "undefined" : typeof arg) {
            case "number":
                return xml({raw: ["<span highlight=\"Number\">", "</span>"],cooked: ["<span highlight=\"Number\">", "</span>"]}, [(str)]);
            case "string":
                if (processStrings)
                    str = str.quote();
                return xml({raw: ["<span highlight=\"String\">", "</span>"],cooked: ["<span highlight=\"String\">", "</span>"]}, [(str)]);
            case "boolean":
                return xml({raw: ["<span highlight=\"Boolean\">", "</span>"],cooked: ["<span highlight=\"Boolean\">", "</span>"]}, [(str)]);
            case "function":
                // Vim generally doesn't like /foo*/, because */ looks like a comment terminator.
                // Using /foo*(:?)/ instead.
                if (processStrings)
                    return xml({raw: ["<span highlight=\"Function\">", "</span>"],cooked: ["<span highlight=\"Function\">", "</span>"]}, [(str.replace(/\{(.|\n)*(?:)/g, "{ ... }"))]);
                return xml({raw: ["", ""],cooked: ["", ""]}, [(arg)]);
            case "undefined":
                return xml({raw: ["<span highlight=\"Null\">", "</span>"],cooked: ["<span highlight=\"Null\">", "</span>"]}, [(arg)]);
            case "object":
                if (arg instanceof TemplateSupportsXML)
                    return arg;
                // for java packages value.toString() would crash so badly
                // that we cannot even try/catch it
                if (/^\[JavaPackage.*\]$/.test(arg))
                    return xml({raw: ["[JavaPackage]"],cooked: ["[JavaPackage]"]}, []);
                if (processStrings && false)
                    str = template.highlightFilter(str, "\n", function () xml({raw: ["<span highlight=\"NonText\">^J</span>"],cooked: ["<span highlight=\"NonText\">^J</span>"]}, []));
                return xml({raw: ["<span highlight=\"Object\">", "</span>"],cooked: ["<span highlight=\"Object\">", "</span>"]}, [(str)]);
            case "xml":
                return arg;
            default:
                return "<unknown type>";
            }
        }
        catch (e) {
            return "<unknown>";
        }
    },

    highlightFilter: function highlightFilter(str, filter, highlight) {
        if (filter.length == 0)
            return str;

        let filterArr = filter.split(" ");
        let matchArr = [];
        for (let item of filterArr) {
            if (!item)
                continue;
            let lcstr = String.toLowerCase(str);
            let lcfilter = item.toLowerCase();
            let start = 0;
            while ((start = lcstr.indexOf(lcfilter, start)) > -1) {
                matchArr.push({pos:start, len:lcfilter.length});
                start += lcfilter.length;
            }
        }

        return this.highlightSubstrings(str, matchArr, highlight || template.filter);
    },

    highlightRegexp: function highlightRegexp(str, re, highlight) {
        let matchArr = [];
        let res;
        while ((res = re.exec(str)) && res[0].length)
            matchArr.push({pos:res.index, len:res[0].length});

        return this.highlightSubstrings(str, matchArr, highlight || template.filter);
    },

    removeOverlapMatch: function removeOverlapMatch(matchArr) {
        matchArr.sort(function(a,b) a.pos - b.pos || b.len - a.len); // Ascending start positions
        let resArr = [];
        let offset = -1;
        let last, prev;
        for (let item of matchArr) {
            last = item.pos + item.len;
            if (item.pos > offset) {
                prev = resArr[resArr.length] = item;
                offset = last;
            } else if (last > offset) {
                prev.len += (last - offset);
                offset = last;
            }
        }

        return resArr;
    },

    highlightSubstrings: function highlightSubstrings(str, iter, highlight) {
        if (typeof str == "xml" || str instanceof TemplateSupportsXML)
            return str;
        if (str == "")
            return xml({raw: ["", ""],cooked: ["", ""]}, [(str)]);

        str = String(str).replace(" ", "\u00a0");
        let s = xml({raw: [""],cooked: [""]}, []);
        var add = xml["+="];
        let start = 0;
        let n = 0;
        for (let item of this.removeOverlapMatch(iter)) {
            if (n++ > 50) // Prevent infinite loops.
                return add(s, xml({raw: ["", ""],cooked: ["", ""]}, [(str.substr(start))]));
            add(s, xml({raw: ["", ""],cooked: ["", ""]}, [(str.substring(start, item.pos))]));
            add(s, highlight(str.substr(item.pos, item.len)));
            start = item.pos + item.len;
        }
        return add(s, xml({raw: ["", ""],cooked: ["", ""]}, [(str.substr(start))]));
    },

    highlightURL: function highlightURL(str, force, highlight) {
        highlight = "URL" + (highlight ? " " + highlight : "");
        if (force || /^[a-zA-Z]+:\/\//.test(str))
            return xml({raw: ["<a highlight=", " href=", ">", "</a>"],cooked: ["<a highlight=", " href=", ">", "</a>"]}, [(highlight), (str), (str)]);
        else
            return str;
    },

    // A generic output function which can have an (optional)
    // title and the output can be an XML which is just passed on
    genericOutput: function generic(title, value) {
        if (title)
            return xml({raw: ["<table style=\"width: 100%\">\n\
                       <tr style=\"text-align: left;\" highlight=\"CompTitle\">\n\
                           <th>", "</th>\n\
                       </tr>\n\
                       </table>\n\
                       <div style=\"padding-left: 0.5ex; padding-right: 0.5ex\">", "</div>\n\
                   "],cooked: ["<table style=\"width: 100%\">                       <tr style=\"text-align: left;\" highlight=\"CompTitle\">                           <th>", "</th>                       </tr>                       </table>                       <div style=\"padding-left: 0.5ex; padding-right: 0.5ex\">", "</div>                   "]}, [(title), (value)]);
        else
            return xml({raw: ["", ""],cooked: ["", ""]}, [(value)]);
    },

    // every item must have a .xml property which defines how to draw itself
    // @param headers is an array of strings, the text for the header columns
    genericTable: function genericTable(items, format) {
        completion.listCompleter(function (context) {
            context.filterFunc = null;
            if (format)
                context.format = format;
            context.completions = items;
        });
    },

    options: function options(title, opts) {
        return this.genericOutput("",
            xml({raw: ["<table style=\"width: 100%\">\n\
                <tr highlight=\"CompTitle\" align=\"left\">\n\
                    <th>", "</th>\n\
                </tr>\n\
                ", "\n\
            </table>"],cooked: ["<table style=\"width: 100%\">                <tr highlight=\"CompTitle\" align=\"left\">                    <th>", "</th>                </tr>                ", "            </table>"]}, [(title), (
                    this.map2(xml, opts, function (opt) xml({raw: ["\n\
                    <tr>\n\
                        <td>\n\
                            <span style=", ">", "", "</span><span>", "</span>\n\
                            ", "\n\
                        </td>\n\
                    </tr>"],cooked: ["                    <tr>                        <td>                            <span style=", ">", "", "</span><span>", "</span>                            ", "                        </td>                    </tr>"]}, [(opt.isDefault ? "" : "font-weight: bold"), (opt.pre), (opt.name), (opt.value), (opt.isDefault || opt.default == null ? "" : xml({raw: ["<span class=\"extra-info\"> (default: ", ")</span>"],cooked: ["<span class=\"extra-info\"> (default: ", ")</span>"]}, [(opt.default)]))]))
                )]));
    },

    // only used by showPageInfo: look for some refactoring
    table: function table(title, data, indent) {
        return this.table2(xml, title, data, indent);
    },
    table2: function table2(tag, title, data, indent) {
        var body = this.map2(tag, data, function (datum) tag({raw: ["\n\
                    <tr>\n\
                       <td style=", ">", "</td>\n\
                       <td>", "</td>\n\
                    </tr>"],cooked: ["                    <tr>                       <td style=", ">", "</td>                       <td>", "</td>                    </tr>"]}, [("font-weight: bold; min-width: 150px; padding-left: " + (indent || "2ex")), (datum[0]), (template.maybeXML(datum[1]))]));
        let table =
            tag({raw: ["<table>\n\
                <tr highlight=\"Title\" align=\"left\">\n\
                    <th colspan=\"2\">", "</th>\n\
                </tr>\n\
                ", "\n\
            </table>"],cooked: ["<table>                <tr highlight=\"Title\" align=\"left\">                    <th colspan=\"2\">", "</th>                </tr>                ", "            </table>"]}, [(title), (body)]);
        return body ? table : tag({raw: [""],cooked: [""]}, []);
    },

    // This is a generic function which can display tabular data in a nice way.
    // @param {string|array(string|object)} columns: Can either be:
    //        a) A string which is the only column header, streching the whole width
    //        b) An array of strings: Each string is the header of a column
    //        c) An array of objects: An object has optional properties "header", "style"
    //           and "highlight" which define the columns appearance
    // @param {object} rows: The rows as an array or arrays (or other iterable objects)
    tabular: function tabular(columns, rows) {
        function createHeadings() {
            if (typeof(columns) == "string")
                return xml({raw: ["<th colspan=", ">", "</th>"],cooked: ["<th colspan=", ">", "</th>"]}, [((rows && rows[0].length) || 1), (columns)]);

            let colspan = 1;
            return template.map(columns, function (h) {
                if (colspan > 1) {
                    colspan--;
                    return xml({raw: [""],cooked: [""]}, []);
                }

                if (typeof(h) == "string")
                    return xml({raw: ["<th>", "</th>"],cooked: ["<th>", "</th>"]}, [(h)]);

                let header = h.header || "";
                colspan = h.colspan || 1;
                return xml({raw: ["<th colspan=", ">", "</th>"],cooked: ["<th colspan=", ">", "</th>"]}, [(colspan), (header)]);
            });
        }

        function createRow(row) {
            return template.map(Iterator(row), function ([i, d]) {
                let style = ((columns && columns[i] && columns[i].style) || "") + (i == (row.length - 1) ? "; width: 100%" : ""); // the last column should take the available space -> width: 100%
                let highlight = (columns && columns[i] && columns[i].highlight) || "";
                return xml({raw: ["<td style=", " highlight=", ">", "</td>"],cooked: ["<td style=", " highlight=", ">", "</td>"]}, [(style), (highlight), (template.maybeXML(d))]);
            });
        }

        return  xml({raw: ["<table style=\"width: 100%\">\n\
                    <tr highlight=\"CompTitle\" align=\"left\">\n\
                    ", "\n\
                    </tr>\n\
                    ", "\n\
                </table>"],cooked: ["<table style=\"width: 100%\">                    <tr highlight=\"CompTitle\" align=\"left\">                    ", "                    </tr>                    ", "                </table>"]}, [(
                        createHeadings()
                    ), (
                        this.map2(xml, rows, function (row)
                        xml({raw: ["<tr highlight=\"CompItem\">\n\
                        ", "\n\
                        </tr>"],cooked: ["<tr highlight=\"CompItem\">                        ", "                        </tr>"]}, [(
                            createRow(row)
                        )]))
                    )]);
    }
});

// vim: set fdm=marker sw=4 ts=4 et:
