exports.handler = function (event, context) {
  setTimeout(() => {
    console.log('in timeout');
    // context.succeed('done');
  }, 1000);
  console.log('outside timeout');
};
