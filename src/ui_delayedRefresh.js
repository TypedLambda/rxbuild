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
/** @fileOverview Holds the async delayed cancellable class used for refreshes
	@requires utils.js
*/
if (!RXBuild)
	/** @namespace The RXBuild namespace is the root namespace for all things RXBuild */
	var RXBuild = { };
if (!RXBuild.UI)
	/** @namespace The RXBuild.UI namespace is the root namespace for all things related to RXBuilds user interface */
	 RXBuild.UI = {};

(function() {

	/** 
		Creates a new instance of RXBuild.UI.DelayedRefresh
		@class The RXBuild.UI.DelayedRefresh Holds a triggerable and cancelable delayed event object which adjusts its frequency.
		@property {Number} defaultDelay The delay with which to raise the delegate if none is specified
		@constructor
		@param {Number} defaultDelay The default delay to use when none is specified.
		@param {Function} callBack The main method to call after time has elapsed
		@param {Function} invalidateCallback Optional. A function to call when a refresh is pending.
		@param {Float} adaptiveSpeed A number from 0 to 1.0 that determines the hi-pass threshold for automatically updating
						the defaultDelay. If set to 0, the defaultDelay never changes, if set to 1.0, it is always the duration
						of the last execution of the callback, in between, the delay is averaged at each execution. A good value is 0.1.
	*/
	RXBuild.UI.DelayedRefresh = function (defaultDelay, callBack, invalidateCallback, adaptiveSpeed) {
		this.defaultDelay = defaultDelay;
		if (!adaptiveSpeed) adaptiveSpeed = 0;
		if (adaptiveSpeed < 0) adaptiveSpeed = 0;
		if (adaptiveSpeed > 1.0) adaptiveSpeed = 1.0;
		this.adaptiveSpeed = adaptiveSpeed;
		this.nextTimeout = 0;
		this.pendingEvent = null;
		this.callBack = callBack;
		this.invalidateCallback = invalidateCallback;
	};
	RXBuild.UI.DelayedRefresh.prototype.constructor = RXBuild.UI.DelayedRefresh;
	/** Cancel the pending trigger
		@return {Boolean} True if there was an event pending to cancel
	*/
	RXBuild.UI.DelayedRefresh.prototype.stop = function() {
		this.nextTimeout = 0;
		if (this.pendingEvent)
			{
				window.clearTimeout(this.pendingEvent);
				this.pendingEvent = null;
				return true;
			}
		return false;
	};
	/** Calls the delegate and updates the timer frequency
		@private
	*/
	RXBuild.UI.DelayedRefresh.prototype.__runDelegate = function() {
		this.pendingEvent = null;
		var iStart = new Date();
		try {
			this.callBack();
		} catch (e) {
			window.alert("Warning - CallBack raised an exception\n" + e);
		}
		var iDuration = ((new Date()).getTime() - iStart) * 10;
		if (this.adaptiveSpeed != 0){
			this.defaultDelay = (1.0 - this.adaptiveSpeed) * this.defaultDelay + this.adaptiveSpeed * iDuration;
			if (this.defaultDelay < 10) this.defaultDelay = 10;
		}
	};
	/** Restarts the pending event, cancelling any pending events
		@param {Number} timeout The timeout can override the internally maintained timeout
	*/
	RXBuild.UI.DelayedRefresh.prototype.reset = function(timeout) {
		if (typeof timeout == "undefined")
			timeout = this.defaultDelay;
		var iNextTimeout = new Date((new Date()).getTime() + timeout);
		var bShouldInvalidate = !this.pendingEvent;
		this.stop();
		if (bShouldInvalidate && this.invalidateCallback) this.invalidateCallback();
		this.nextTimeout = iNextTimeout;
		this.pendingEvent = window.setTimeout(RXBuild.Utils.createDelegate(this,
			function() {
				if (this.nextTimeout > iNextTimeout)
					return;
				this.__runDelegate();
			}), timeout);
	};


})();
