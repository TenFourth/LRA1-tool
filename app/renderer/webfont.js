import { config, dom, library } from '@fortawesome/fontawesome-svg-core';
import { faBroadcastTower, faCog, faSatellite } from '@fortawesome/free-solid-svg-icons';
import { faFolderOpen } from '@fortawesome/free-regular-svg-icons';

config.autoAddCss = true;
library.add(faBroadcastTower, faCog, faFolderOpen, faSatellite);
dom.i2svg();
