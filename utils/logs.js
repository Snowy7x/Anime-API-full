function log(title, ...values) {
  console.log(`Log [${title}]:`, ...values);
}

function error(title, ...values) {
  console.error(`Error [${title}]:`, ...values);
}

module.exports = { log, error };
