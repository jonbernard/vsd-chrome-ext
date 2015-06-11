#!/bin/bash
if [ ! -e '/usr/bin/node' ]
then
    sudo -t ln -s /usr/local/bin/node /usr/bin/node;
fi
grunt_task="mobile:buildLocal";
if [ "$1" != "" ]; then
    grunt_task=$1;
fi
echo "Executing grunt task : $grunt_task";
grunt=$(which grunt);
$grunt $1;