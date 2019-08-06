import i18n from "i18next";
import store from './store';
import { initReactI18next } from "react-i18next";

const language = store.getState().settings.language;
const options = {
	lng: language,
	fallbackLng: 'en',
	interpolation: {
		escapeValue: false, // not needed for react!!
	}
};

i18n.use(initReactI18next).init(options, (err, t) => {
	if (err) return console.log('something went wrong loading', err);
});

i18n.customLoad = (json, namespace) => {
	for(let l in json)
		i18n.addResourceBundle(l, namespace, json[l][namespace]);
};

export default i18n;
