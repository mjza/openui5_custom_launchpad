(function () {
	"use strict";
	// Set the favicon dynamically to get read of blinking 
	function waitForElementAppear(selector) {
		return new Promise(function (resolve, reject) {
			var element = document.querySelector(selector);
			if (element) {
				resolve(element);
				return;
			}
			var observer = new MutationObserver(function (mutations) {
				mutations.forEach(function (mutation) {
					var nodes = Array.from(mutation.addedNodes);
					for (var node of nodes) {
						if (node.matches && node.matches(selector)) {
							observer.disconnect();
							resolve(node);
							return;
						}
					}
				});
			});
			observer.observe(document.documentElement, {
				childList: true,
				subtree: true
			});
		});
	}
	//
	function waitForElementRemoved(selector) {
		return new Promise((resolve) => {
			var element = document.querySelector(selector);
			if (!element) {
				resolve();
				return;
			}
			var observer = new MutationObserver((mutations, observer) => {
				for (const mutation of mutations) {
					for (const removedNode of mutation.removedNodes) {
						if (removedNode === element) {
							observer.disconnect();
							resolve();
						}
					}
				}
			});
			observer.observe(element.parentElement, {
				childList: true
			});
		});
	}
	//	
	function changeFavIcon(selector) {
		waitForElementAppear(selector).then(function (element) {
			element.setAttribute("href", "icon/favicon.ico");
			waitForElementRemoved(selector).then(function () {
				changeFavIcon(selector);
			});
		});
	};
	changeFavIcon("link[rel='shortcut icon']");
}());