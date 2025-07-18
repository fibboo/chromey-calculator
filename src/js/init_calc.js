/*
 * Copyright (c) 2010 Brent Weston Robinett <bwrobinett@gmail.com>
 * Licensed under the MIT License: http://www.opensource.org/licenses/mit-license.php
 */
(function () {
	// Initialize the calculator using message passing instead of direct background page access
	chrome.runtime.sendMessage({ 
		action: "initCalc",
		isPopout: !!window.opener
	}, function(response) {
		// Initialize the calculator in this window
		if (window.cCalc && typeof window.cCalc.init === 'function') {
			window.cCalc.init(window);
		}
	});
}());