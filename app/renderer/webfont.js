import { config, dom, library } from '@fortawesome/fontawesome-svg-core';
import { faBroadcastTower, faCompactDisc, faCog, faExchangeAlt, faSatellite, faUpload } from '@fortawesome/free-solid-svg-icons';
import { faFolderOpen } from '@fortawesome/free-regular-svg-icons';

config.autoAddCss = true;
library.add(faBroadcastTower, faCompactDisc, faCog, faExchangeAlt, faFolderOpen, faSatellite, faUpload);
dom.i2svg();
