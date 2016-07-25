#!/bin/bash

DIR=$1

cd $DIR

rm -rf .venv/

python3 -m venv --upgrade .venv
./.venv/bin/pip3 install --upgrade pip
./.venv/bin/pip3 install -r requirements.txt
