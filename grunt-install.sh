#!/bin/bash
grunt=$(which grunt);
npm=$(which npm);
#sudo $npm install -g grunt-cli;
#sudo $npm install -g;

$npm install  grunt-cli;
$npm install;

/bin/bash grunt-build.sh $1;