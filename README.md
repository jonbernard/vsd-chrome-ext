# Installation

Loading a .crx file is the best option for installing this Chrome Extension. Follow the instructions below. If you receive a security error, load the unpacked extension.

## Loading the .crx extension

1. <a href="https://stash.lbidts.com/projects/FEWDW/repos/vsd-chrome-ext/browse/webapp/vsd-chrome-ext.crx?raw" target="_blank">Download the VSD Chrome Extension</a>
2. Go to chrome://extensions in your Google Chrome browser
3. Check the "Developer mode" checkbox
4. Locate the downloaded .crx file.
5. Drag the file into the extension tab of your Chrome Browser
6. Accept the data privacy warning.
7. You're Done!


## Loading an unpacked extension

### 1. Clone this Repo
Clone this repo with stash and "cd" to its folder in Terminal

### 2. Node.js
Install NPM packages

	sudo npm install

### 3. Initialize your Chrome Extension

	grunt desktop:init

### 4. Load Unpacked Extension in Google Chrome
<a href="https://developer.chrome.com/extensions/getstarted#unpacked" target="_blank">developer.chrome.com - Loading Unpacked Extensions</a>

1. Go to chrome://extensions in your Google Chrome browser
2. Check the "Developer mode" checkbox
3. Click "Load unpacked extension..."
4. Navigate to the unpacked extension folder (i.e. ~/dev/vsd-chrome-ext/webapp/vsd-chrome-ext)
5. Click "Select" (The extension will reload you VSD Platform tabs)
6. You're Done!


---


# Updating

## Updating the .crx extension

To update the extension, follow the crx installation instructions above.


## Updating the unpacked extension extension

To update the extension, follow the "Building local changes to the Extension" instructions below.


---


## Building local changes to the Extension

### 1. Build the Unpacked Extension

	grunt desktop:build

This task will install the "<a href="https://github.com/prasmussen/chrome-cli" target="_blank">chrome-cli</a>" through "brew install chrome-cli". <a href="http://brew.sh/#install" target="_blank">Install Homebrew</a> and Xcode, if necessary. This CLI connects the terminal to your instance of Google Chrome. It is necessary for the auto-reloading of your chrome extension. It will then do the first build of your chrome extension.

### 2. Load Unpacked Extension in Google Chrome

The `grunt desktop:build` task will reload Google Chrome's Extensions for you. No need to manually reload your extension. But, if something does go wrong, follow the steps below.

1. Go to chrome://extensions in your Google Chrome browser
2. Under the "VSD Developer Tools", click "Reload (⌘R)"
3. Return to your VSD Platform tab


---


## More Information

- <a href="https://developer.chrome.com/extensions" target="_blank">What are chrome extensions?</a>
- <a href="https://developer.chrome.com/extensions/api_index" target="_blank">Chrome Platform APIs/Javascript APIs</a>
- <a href="https://developer.chrome.com/extensions/getstarted#unpacked" target="_blank">developer.chrome.com - Loading Unpacked Extensions</a>


---


## Changelog

- 0.0.4 - Added Loading/Error messaging to ajax calls, default Deque script to on
- 0.0.3 - Added Deque/WCAC script blocking
- 0.0.2 - Added native cookie editor
- 0.0.1 - Inital extension# vsd-chrome-ext
