#!/bin/bash
source /home/bmira/.nvm/nvm.sh
nvm use 20
cd /home/bmira/linsi
npx docusaurus serve --host 0.0.0.0 --port 3333
