// react-native-health-connect (v2+) exige que MainActivity enregistre le delegate de
// permissions dans onCreate ; expo-health-connect ne le fait pas. Sans ça,
// requestPermission() lève une exception native au lancement → crash au démarrage.
const { withMainActivity } = require('@expo/config-plugins');

const IMPORT = 'import dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate';
const CALL = 'HealthConnectPermissionDelegate.setPermissionDelegate(this)';

module.exports = function withHealthConnectDelegate(config) {
  return withMainActivity(config, (cfg) => {
    let src = cfg.modResults.contents;
    if (cfg.modResults.language !== 'kt') {
      throw new Error('withHealthConnectDelegate: MainActivity Kotlin attendu');
    }
    if (!src.includes(IMPORT)) {
      src = src.replace(/(package [^\n]+\n)/, `$1\n${IMPORT}\n`);
    }
    if (!src.includes(CALL)) {
      src = src.replace(
        /(super\.onCreate\([^)]*\))/,
        `$1\n    // Requis par react-native-health-connect pour recevoir le résultat des permissions\n    ${CALL}`,
      );
    }
    cfg.modResults.contents = src;
    return cfg;
  });
};
