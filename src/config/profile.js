import rawConfig from '../configurations.json';
import { getSafeIconClass, getSafeUrl } from '../utils/security';

const DEFAULT_BACKGROUND_TYPE = 'plain';
const DEFAULT_PLAIN_BACKGROUND_MODE = 'daylight';

function getDescriptions(config) {
	return [
		config.devDesc,
		config.devDesc2,
		config.devDesc3,
		config.devDesc4,
		config.devDesc5,
	].filter(Boolean);
}

function getSocialLinks(config) {
	return (config.icons || [])
		.map((icon) => ({
			iconClass: getSafeIconClass(icon.image),
			url: getSafeUrl(icon.url),
		}))
		.filter((icon) => icon.iconClass && icon.url);
}

export const profileConfig = {
	intro: rawConfig.devIntro,
	descriptions: getDescriptions(rawConfig),
	background: {
		type: rawConfig.backgroundType || DEFAULT_BACKGROUND_TYPE,
		plainMode: rawConfig.plainBackgroundMode || DEFAULT_PLAIN_BACKGROUND_MODE,
		gradientColors: rawConfig.gradientColors,
	},
	socialLinks: getSocialLinks(rawConfig),
};
