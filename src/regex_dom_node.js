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

function Node()
{
	this.next = null;
	this.src = null;
	this.id = null;
	this.tokens = new Array();
}

Node.prototype.Match = function() {return false;};
Node.prototype.GetDescription = function() {return "-Node-";};
Node.prototype.AddTokens = function() {
	for (var i = 0; i < arguments.length; i++)
		{
			var obj = arguments[i];
			if (obj instanceof Array)
				for (var j=0; j < obj.length; j++)
					this.AddTokens(obj[j]);
			else
				this.tokens.push(obj);
		}
}
Node.prototype.GetChainDescription = function() {
	var sResult = "";
	var oItem = this;
	while (oItem != null)
	{
		if (sResult != "") sResult += ", ";
		sResult += oItem.GetDescription();
		oItem = oItem.next;
	}
	return sResult;
}
Node.prototype.GetLast = function(newLast) {
	var oItem = this;
	while (oItem.next != null)
		oItem = oItem.next;
	return oItem;
}
Node.prototype.Flatten = function(newLast) {
	if (this.next) this.next = this.next.Flatten();
	return this;
}
Node.prototype.AppendAtEnd = function(newLast) {
	var oItem = this.GetLast();
	oItem.next = newLast;
};
Node.prototype.CopyFrom = function(prevNode) {
	this.next = prevNode.next; 
	this.id = prevNode.id;
	this.tokens = prevNode.tokens;
};
Node.prototype.GetHtml = function() {
	return "<h1>Error - Node.GetHtml sifted through on " + getObjectDesc(this) + "</h1>";
};
Node.prototype.GetTokenHighlightJS = function() {
	var sResult = "";
	for (var i = 0; i < this.tokens.length; i++)
		sResult += (i>0 ? ",[" : "[") + this.tokens[i].offset + "," + this.tokens[i].value.length + "]";
	return sResult;
}
function IsCharInTokenList(c, tokenlist) {
	if (tokenlist == null) return true;
	for (var i=0; i < tokenlist.length; i++) {
		if (c >= tokenlist[i][0] && c < (tokenlist[i][0] + tokenlist[i][1]))
			return true;
	}
	return false;
}
function NodeRegExTokenHighlight(tokenlist) {
	var i = 0;
	var oObj;
	while ((oObj = document.getElementById("rxchr_" + i++)) != null) {
		oObj.style.color = IsCharInTokenList(i - 1, tokenlist) ? "black" : "grey";
	}
	window.event.stopPropagation();
}
Node.prototype.GetHtmlOpenTag = function() {
	return "<li onmouseover=\"NodeRegExTokenHighlight([" + this.GetTokenHighlightJS() + "]);\" onmouseout=\"NodeRegExTokenHighlight(null);\">" + (this.id != null ? "<span class=\"rx_id\">" + this.id + ")</span> " : "");
};
Node.prototype.GetChainHtml = function() {
	var sResult = "<ul>";
	var oItem = this;
	while (oItem != null)
	{
		try {
		sResult += oItem.GetHtmlOpenTag() + oItem.GetHtml() + "</li>";
	} catch(err) {
		alert("Error " + err + " on object id " + oItem.id);
		}
		oItem = oItem.next;
	}
	return sResult + "</ul>";
}
Node.prototype.RunOnMe = function(func,param) {
	return func.call(this,param);
}
Node.prototype.RunForAll = function(func,param) {
	var oResult = this.RunOnMe(func,param);
	if (this.next != null)
		this.next = this.next.RunForAll(func,param);
	return oResult;
};