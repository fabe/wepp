// Imports
var { ipcRenderer, remote } = require('electron');
var main = remote.require('./main.js');
const { dialog } = require('electron').remote;

// Helpers
const dom = query => document.querySelector(query);
const addClass = (query, className) => dom(query).classList.add(className);
const removeClass = (query, className) =>
  dom(query).classList.remove(className);
const drop = document.getElementById('drop');

drop.ondragover = () => {
  addClass('body', 'drag');
  return false;
};

drop.ondragleave = () => {
  removeClass('body', 'drag');
  return false;
};

drop.ondragend = () => {
  removeClass('body', 'drag');
  return false;
};

drop.ondrop = e => {
  e.preventDefault();
  removeClass('body', 'drag');

  const files = e.dataTransfer.files;

  dialog.showOpenDialog(
    {
      title: 'Choose a directory where the WebP files will be saved.',
      buttonLabel: 'Convert',
      properties: ['openDirectory'],
    },
    path => {
      if (!path) {
        return false;
      }

      addClass('body', 'loading');

      const output = path[0];
      let queue = [];

      for (let f of files) {
        const fileName = f.name.replace(/\.[^/.]+$/, '');
        queue.push(main.convertFileToWebp(f.path, fileName, output));
      }

      Promise.all(queue)
        .then(() => {
          removeClass('body', 'loading');

          dialog.showMessageBox(main.mainWindow, {
            type: 'info',
            message: `Success! ${files.length} ${files.length > 1
              ? 'files were'
              : 'file was'} converted to WebP.`,
          });
        })
        .catch(err => {
          removeClass('body', 'loading');

          dialog.showErrorBox('Sorry!', `${err.message}.`);
        });
    }
  );

  return false;
};
