/* (c) Copyright 2009 Eric Doughty-Papassideris. All Rights Reserved.

	This file is part of RXBuild.

    RXBuild is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    RXBuild is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with RXBuild.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
	@fileOverview Contains simple utility functions used throughout
*/
/**
	Returns a version of the string that is suitable for insertion in XML code
	(&amp; is replaced by &amp;amp; and so on)
	@type String
*/
String.prototype.escapeXML = function () {
        return(
            this.replace(/&/g,'&amp;')
                .replace(/>/g,'&gt;')
                .replace(/</g,'&lt;')
                .replace(/'/g,'&apos;')
                .replace(/"/g,'&quot;')
        );
    };
/**
	Returns a version of the string that is has all standard 5 entities replaced
	(&amp;amp; is replaced by &amp; and so on)
	@type String
*/
String.prototype.unescapeXML = function () {
        return(
            this
                .replace(/&gt;/g,'>')
                .replace(/&lt;/g,'<')
                .replace(/&apos;/g,'\'')
                .replace(/&quot;/g,'\"')
				.replace(/&amp;/g,'&')
        );
    };

/**
	Returns a version of the string that is suitable for insertion in HTML code
	@type String
*/
String.prototype.escapeHTML = function () {
	return this.escapeXML()
		.replace(/\r\n/g, "<br />")
		.replace(/\n/g, "<br />")
		.replace(/\r/g, "<br />");
};


/**
	Returns a version of the string that is suitable for insertion in C/JS type code (without quotes though)
	@type String

*/
String.prototype.escapeToBackslashes = function () {
       return(
           (this.replace(/\\/g,'\\\\')).
               replace(/'/g,'\\\'').
               replace(/"/g,'\\\"').
               replace(/\t/g,'\\t').
               replace(/\r/g,'\\r').
               replace(/\f/g,'\\f').
               replace(/\v/g,'\\v').
               replace(/\n/g,'\\n').
			   replace(/[^a-zA-Z0-9_+*\/\\ .,?!@#$%^&*():;\[\]|><~-]/gi, function (s) { 
				var sHexCode = (new Number(s.charCodeAt(0))).toString(16);
				if (sHexCode.length == 1) sHexCode = "0" + sHexCode;
				if (sHexCode.length == 2) return "\\x" + sHexCode;
				if (sHexCode.length == 3) sHexCode = "0" + sHexCode;
				if (sHexCode.length == 4) return "\\u" + sHexCode;
				return "[Unexplainable char 0x" + sHexCode + "]"; })
       );
   };

/**
	Returns an version of the string that only single LF characters
	@type String

*/
String.prototype.normaliseNewLines = function () {
       return this.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
};

/**
	Returns the number of identical characters in this string and the one in s
	starting from the beginning.
	@param {String} s The other string to compare to
	@param {Number} startIndex Optional - The position from which to start
	@return {Number} The number of common characters between the two strings
*/
String.prototype.findCommonPrefix = function (s, startIndex) {
	var i;
	if (typeof(startIndex) != "number") startIndex = 0;
	for (i = startIndex; i < this.length && i < s.length && this.charAt(i) == s.charAt(i); i++)
		;
    return i - startIndex;
};

/**
	Returns a version of the string with all leading and trailing whitespace removed
	@type String

*/
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, '');
};

/**
	Returns a version of the string that is suitable for insertion in C/JS type code (with quotes)
	@type String

*/
String.prototype.escapeJS = function () {
       return "\"" + this.escapeToBackslashes() + "\"";
};

/**
	Returns a version of the string that is suitable for insertion in C# type code (with quotes)
	@type String

*/
String.prototype.escapeCS = function () {
	   if (this.indexOf("\"") < 0)
		return "@\"" + this + "\"";
       return("\"" + this.escapeToBackslashes() + "\"");
   };

/**
	Returns a version of the string that is suitable for insertion in an HTML string with a pre tag around it
	@type String

*/
String.prototype.plainTextToHtml = function () {
        return "<pre>" + this.escapeHTML() + "</pre>";
    };

/**
	Returns a version of the string that is suitable for insertion in a regular expression as a litteral value
	@type String

*/
String.prototype.escapeRegexp = function () {
        return(
            this.replace(/\\/g,'\\\\').
                replace(/([.\$\^\{\[\|\(\)\]\}\*\+\?])/g,'\\$1')
        );
    };

String.prototype.toString = function () {
        return this;
    };

/** Parses the current instance for url encoded key value pairs, in the form <code>key%20name=key%20value&amp;key%20bool&amp;key%20empty=</code>
	@return {Array of arrays of string} Returns an array with each element being a key and optional value pair.
*/
String.prototype.parseURLKeyValues = function () {
        var sItems = this.split(/&/);
		for (var i=0; i < sItems.length; i++) {
			var sPieces = sItems[i].split(/\=/);
			for (var j = sPieces.length - 1; j >= 0; j--){
				sPieces[j] = unescape(sPieces[j]);
			};
			sItems[i] = sPieces;
		}
		return sItems;
    };

(function() {
	/** @private */
	function replaceValues(oldValues, newValues) {
		function findItemByName(name) {
			for (var j = oldValues.length - 1; j >= 0; j--){
				var oVal = oldValues[j];
				if (typeof(oVal) == 'string'){
					if (oVal == name) return j;
				} else if (oVal[0] == name) return j;
			};
			return -1;
		}
		function replaceItemByName(name, newValue) {
			var iItemToDel = findItemByName(name);
			if (iItemToDel > -1) oldValues[iItemToDel] = newValue;
			else oldValues.push(newValue);
		}
		function deleteItemByName(name) {
			var iItemToDel = findItemByName(name);
			if (iItemToDel > -1) oldValues.splice(iItemToDel, 1);
		}
		for (var i = newValues.length - 1; i >= 0; i--){
			var oItem = newValues[i];
			if (typeof(oItem) == "string")
				deleteItemByName(oItem);
			else
				replaceItemByName(oItem[0], oItem);
		};
	}
	/** @private */
	function encodeURLKeyValuePair(values) {
		var sResult = [];
		for (var i=0; i < values.length; i++) {
			var oItem = values[i];
			if (typeof(oItem) == "string")
				sResult.push(escape(oItem));
			else {
				var sItemString = [];
				for (var j=0; j < oItem.length; j++) {
					sItemString.push(escape(oItem[j]));
				};
				sResult.push(sItemString.join("="));
			}
		};
		return sResult.join("&");
	}
	
	/** Replaces the provide key value pairs, in the format as returned by parseURLKeyValues in the current instance
		and returns the resulting string.
		@param {Array of Array of string} newValues The values to edit in the current instance. The following formats are acceptable:
		<ul>
			<li><code>[&quot;abc&quot;]</code> - to delete the key with name abc</li>
			<li><code>[[&quot;abc&quot;]]</code> - to empty the key abc (but keep it present)</li>
			<li><code>[[&quot;abc&quot;, &quot;def&quot;]]</code> - to replace or add the key named abc with the value def</li>
		</ul>
		@return {String} A string encoded in the format <code>key%20name=key%20value&amp;key%20bool&amp;key%20empty=</code>
	*/
	String.prototype.replaceURLKeys = function(newValues) {
		var oOldValue = this.parseURLKeyValues();
		replaceValues(oOldValue, newValues);
		return encodeURLKeyValuePair(oOldValue);
	};
})();

/**
	Looks for an equal item in an array, and returns true if it was in the array.
	@param {Array} arr The array to search through
	@param {Whatever} txt The item to look for
	@type boolean
	@static
*/
function arrayHasString(arr, txt) {
	for (var s in arr) if (arr[s] == txt) return true;
	return false;
}


/**
	Returns a string in the format l: 12 c:34 from an offset in a string
	@param {String} txt The original string (used to find the line number)
	@param {number} pos The offset in txt
	@type String
	@static
*/
function getLineNoByCharPos(txt, pos) {
	var iLines= 1;
	var iLineStart = 0;
	if (pos > 0) pos --;
	for (var i=0; i<=pos; i++) if (txt[i] == "\n"){
		iLineStart = i;
		iLines++;
	}
	return "l: " + iLines + " c:" + (pos - iLineStart);
}

/** Tries really hard to build a flat array with all parameters
	If the first argument is an array, it will be the one to which the other items are added.
	You can call JoinArrays(null, ...) to make sure you get a new array. It returns null if the 
	result would have been empty.
	@param ... {Array} A list of arrays.
	@type Array
	@static
*/
function JoinArrays() {
	var oArg = Array.prototype.slice.call(arguments);
	var oResult = oArg[0];
	var i = 1;
	if (oResult != null && !(oResult instanceof Array))
	{
		i = 0;
		oResult = null;
	}
	if (oResult == null)
		oResult = [];
	for (; i < oArg.length; i++)
		{
			var oItem = oArg[i];
			if (oItem != null)
				if (oItem instanceof Array)
					for (var j=0; j < oItem.length; j++)
						JoinArrays(oResult, oItem[j]);
				else
					oResult.push(oItem);
		}
	if (oResult.length == 0)
		return null;
	return oResult;
}

/** Creates a callable delegate by using a closure to store the objects instance
	@param {object} object The scope for the callback.
	@param {Function} method The method to call
	@type Function
	@static
*/
function createDelegate(object, method) {
    return function() { method.apply(object, arguments); };
};

/**
	Generates a recursive print out of the provided object (o), skipping any properties
	contained in skip, and functions (unless requested).
	@param {object} o The object to explore.
	@param {String[]} skip A list of names of properties to exclude from the result
	@param {boolean} includeFunctions If set to true, function names are printed out too
	@param {String} i Initial indent string. (you can set to null)
	@type String
	@static
*/
function getObjectDesc(o, skip, includeFunctions, i) {
		if (i == null) i = "";
		if (o == null) return "<null>";
		var oType = typeof(o);
		if (oType == "string") return "'" + o.escapeToBackslashes() + "'";
		if (oType == "number" || oType == "boolean") return o;
		if (oType == "function") return "{...}";
		var sResult = oType + "\n" + i;
		var bFirst = true;
		for (var prop in o)
			if (o.hasOwnProperty(prop) &&
				(includeFunctions || typeof(o[prop]) != "function") &&
				(skip == null || !arrayHasString(skip, prop))) {
				sResult += (bFirst ? "" : "\n" + i) + "-" + prop + ": " + getObjectDesc(o[prop], skip, includeFunctions, i + "  |");
				if (bFirst) bFirst = false;
			}
		return sResult;
	};