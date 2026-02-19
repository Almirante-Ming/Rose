const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withCustomApplicationAttrs(config) {
  return withAndroidManifest(config, (config) => {
    const app = config.modResults.manifest.application[0];
    app.$['android:dataExtractionRules'] = '@xml/secure_store_data_extraction_rules';
    app.$['android:networkSecurityConfig'] = '@xml/network_security_config';

    return config;
  });
};
