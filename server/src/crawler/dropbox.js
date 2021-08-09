require('node-fetch'); // or another library of choice.
var Dropbox = require('dropbox').Dropbox;
var dbx = new Dropbox({ accessToken: 'Yg7rgHMkfEoAAAAAAAAAAYcOe77vT-46hX-irYRuqRlIMxrDT-vDtJsNBxADKawi' });
dbx
  .filesListFolder({ path: '' })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
